import express from "express";
import dotenv from "dotenv";
import Transaction from "../models/Transaction.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const router = express.Router();

// ====== KHỞI TẠO GEMINI SDK ======
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ====== API DỰ ĐOÁN NGÂN SÁCH ======
router.get("/next-month", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    // ====== LẤY DỮ LIỆU GIAO DỊCH ======
    const transactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(90);

    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có dữ liệu giao dịch để dự đoán" });
    }

    // ====== TẠO LỊCH SỬ GIAO DỊCH ======
    const historyText = transactions
      .map(
        (t) =>
          `${t.type === "thu" ? "Thu" : "Chi"} ${t.amount} cho ${
            t.category
          } (${new Date(t.date).toLocaleDateString("vi-VN")})`
      )
      .join("\n");

    // ====== PROMPT GỬI TỚI GEMINI ======
    const prompt = `
Dưới đây là lịch sử giao dịch trong 3 tháng qua của người dùng:
${historyText}

Dựa trên thói quen chi tiêu và thu nhập, hãy dự đoán:
1. Tổng chi tiêu dự kiến trong tháng tới.
2. Tổng thu nhập dự kiến trong tháng tới.
3. Gợi ý ngân sách hợp lý cho các danh mục chính (ăn uống, di chuyển, giải trí, tiết kiệm).

Trả lời bằng tiếng Việt, định dạng dễ đọc như ví dụ sau:
**Dự đoán chi tiêu tháng tới:**
* Ăn uống dự kiến: ...
* Di chuyển dự kiến: ...
* Giải trí dự kiến: ...
* Tiết kiệm dự kiến: ...
**Tổng chi dự kiến:** ...
**Tổng thu dự kiến:** ...
Và cuối cùng, trả về thêm JSON ở cuối cùng để máy có thể đọc được.
`;

    // ====== GỌI GEMINI ======
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-05-20",
    });
    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    // ====== THỬ TRÍCH JSON ======
    let parsed;
    try {
      const match = text.match(/```json([\s\S]*?)```/);
      parsed = JSON.parse(match ? match[1].trim() : text);
    } catch {
      parsed = { raw: text };
    }

    // ====== TRẢ VỀ CẢ TEXT & JSON ======
    res.json({
      success: true,
      text: text, // 👈 phần hiển thị giống terminal
      data: parsed, // 👈 phần JSON (nếu cần dùng)
    });
  } catch (error) {
    console.error("🔥 Lỗi dự đoán:", error);
    res.status(500).json({ message: "Lỗi khi dự đoán ngân sách" });
  }
});

export default router;
