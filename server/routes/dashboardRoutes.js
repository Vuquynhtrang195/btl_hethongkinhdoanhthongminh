import express from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user.id;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    // ✅ Tính tổng thu nhập
    const incomeAgg = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "thu",
          date: { $gte: start, $lt: end },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // ✅ Tính tổng chi tiêu
    const expenseAgg = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "chi",
          date: { $gte: start, $lt: end },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const income = incomeAgg[0]?.total || 0;
    const expense = expenseAgg[0]?.total || 0;
    const balance = income - expense; // ✅ Số dư = Thu nhập - Chi tiêu

    res.json({ income, expense, balance });
  } catch (err) {
    console.error("🔥 Lỗi GET /dashboard:", err);
    res.status(500).json({ message: "Không thể tải dữ liệu dashboard!" });
  }
});

export default router;
