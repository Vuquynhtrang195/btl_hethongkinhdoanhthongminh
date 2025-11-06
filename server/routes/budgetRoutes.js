import express from "express";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// 📍 Lấy danh sách ngân sách + tổng chi tiêu theo category
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user.id;

    // ✅ Lọc ngân sách theo tháng / năm
    const filter = { userId };
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      filter.createdAt = { $gte: start, $lt: end };
    }

    const budgets = await Budget.find(filter);

    // ✅ Lọc giao dịch chi tiêu theo tháng / năm tương ứng
    const txFilter = { userId, type: "chi" };
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      txFilter.date = { $gte: start, $lt: end };
    }

    const transactions = await Transaction.find(txFilter);

    // Gom chi tiêu theo category
    const spentByCategory = transactions.reduce((acc, tx) => {
      acc[tx.category.toLowerCase()] =
        (acc[tx.category.toLowerCase()] || 0) + tx.amount;
      return acc;
    }, {});

    // Kết hợp dữ liệu ngân sách + chi tiêu
    const merged = budgets.map((b) => {
      const categoryKey = b.category.toLowerCase();
      const spent = spentByCategory[categoryKey] || 0;
      const remaining = Math.max(0, (b.limit || 0) - spent);
      const overLimit = spent > b.limit;
      return {
        ...b.toObject(),
        spent,
        remaining,
        overLimit,
      };
    });

    res.json(merged);
  } catch (err) {
    console.error("🔥 Lỗi GET budgets:", err);
    res.status(500).json({ message: err.message });
  }
});

// 📍 Thêm ngân sách mới
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

// 📍 Xoá ngân sách
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

// ✅ Đặt export cuối cùng
export default router;
