import express from "express";
import dotenv from "dotenv";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const router = express.Router();

// ========================== 📍 LẤY DANH SÁCH NGÂN SÁCH ==========================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user.id;

    const filter = { userId };
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      filter.createdAt = { $gte: start, $lt: end };
    }

    const budgets = await Budget.find(filter);
    const txFilter = { userId, type: "chi" };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      txFilter.date = { $gte: start, $lt: end };
    }

    const transactions = await Transaction.find(txFilter);

    const spentByCategory = transactions.reduce((acc, tx) => {
      acc[tx.category.toLowerCase()] =
        (acc[tx.category.toLowerCase()] || 0) + tx.amount;
      return acc;
    }, {});

    const merged = budgets.map((b) => {
      const categoryKey = b.category.toLowerCase();
      const spent = spentByCategory[categoryKey] || 0;
      const remaining = Math.max(0, (b.limit || 0) - spent);
      const overLimit = spent > b.limit;
      return { ...b.toObject(), spent, remaining, overLimit };
    });

    res.json(merged);
  } catch (err) {
    console.error("🔥 Lỗi GET /budgets:", err);
    res.status(500).json({ message: err.message });
  }
});

// ========================== 📍 THÊM NGÂN SÁCH ==========================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { category, limit, month, year } = req.body;

    if (!category || !limit) {
      return res.status(400).json({ message: "Thiếu dữ liệu!" });
    }

    const now = new Date();
    const budget = await Budget.create({
      userId: req.user.id,
      category,
      limit: Number(limit),
      month: month || now.getMonth() + 1,
      year: year || now.getFullYear(),
    });

    res.status(201).json(budget);
  } catch (err) {
    console.error("🔥 Lỗi POST /budgets:", err);
    res.status(500).json({ message: "Không thể thêm ngân sách!" });
  }
});

// ========================== 📍 XOÁ NGÂN SÁCH ==========================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;

    const budget = await Budget.findOne({ _id: budgetId, userId });
    if (!budget)
      return res.status(404).json({ message: "Không tìm thấy ngân sách!" });

    await budget.deleteOne();

    res.json({ success: true, message: "Đã xoá ngân sách!" });
  } catch (err) {
console.error("🔥 Lỗi DELETE /budgets:", err);
    res.status(500).json({ message: "Không thể xoá ngân sách!" });
  }
});

// ========================== 🤖 DỰ ĐOÁN NGÂN SÁCH THÁNG SAU ==========================
router.get("/predict-next-month", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Chưa đăng nhập!" });
    }

    // 📊 Lấy dữ liệu 3 tháng gần nhất
    const transactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(90);

    if (transactions.length === 0) {
      return res.status(404).json({ message: "Không có dữ liệu để dự đoán" });
    }

    // 🧾 Tạo prompt gửi cho Gemini
    const historyText = transactions
      .map(
        (t) =>
          `${t.type === "thu" ? "Thu" : "Chi"} ${t.amount} cho ${
            t.category
          } (${new Date(t.date).toLocaleDateString("vi-VN")})`
      )
      .join("\n");

    const prompt = `
Dưới đây là lịch sử giao dịch của người dùng trong 3 tháng qua:
${historyText}

Hãy:
1. Dự đoán chi tiêu và thu nhập tháng tới.
2. Gợi ý ngân sách hợp lý cho các danh mục chính.
3. Thêm một đoạn "lời khuyên" ngắn gọn giúp người dùng quản lý chi tiêu tốt hơn.

Trả về đúng định dạng JSON sau:
{
  "tong_chi_du_kien": ...,
  "tong_thu_du_kien": ...,
  "goi_y_ngan_sach": {
    "ăn uống": ...,
    "di chuyển": ...,
    "giải trí": ...,
    "tiết kiệm": ...
  },
  "loi_khuyen": "..."
}
`;

    // ⚙️ Khởi tạo Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ message: "Thiếu GEMINI_API_KEY trong file .env" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-05-20",
    });

    // 🧠 Gọi Gemini
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 🧩 Parse JSON trả về
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.warn("⚠️ Gemini trả về text không chuẩn JSON:", text);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw_text: text };
    }

    // --- ⚖️ CHUẨN HÓA GỢI Ý NGÂN SÁCH ---
    if (parsed?.goi_y_ngan_sach && parsed?.tong_chi_du_kien > 0) {
      const tongGoiY = Object.values(parsed.goi_y_ngan_sach).reduce(
        (a, b) => a + b,
        0
      );
      if (tongGoiY > parsed.tong_chi_du_kien) {
        const tyLe = parsed.tong_chi_du_kien / tongGoiY;
        Object.keys(parsed.goi_y_ngan_sach).forEach((key) => {
          parsed.goi_y_ngan_sach[key] = Math.round(
            parsed.goi_y_ngan_sach[key] * tyLe
          );
        });
      }
    }
// ✅ Trả kết quả cho frontend
    res.json({
      success: true,
      data: parsed,
      raw_text: text,
    });
  } catch (error) {
    console.error("🔥 Lỗi /predict-next-month:", error);
    res.status(500).json({ message: "Lỗi khi dự đoán ngân sách" });
  }
});

export default router;
