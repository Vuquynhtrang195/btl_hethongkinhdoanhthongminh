import express from "express";
import Transaction from "../models/Transaction.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// 📍 GET: Lấy danh sách giao dịch
router.get("/", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({
      date: -1,
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// 📍 POST: Thêm giao dịch mới
router.post("/", authMiddleware, async (req, res) => {
  try {
    console.log("📩 Dữ liệu nhận được:", req.body);

    const { type, category, amount, desc, date } = req.body;

    if (!type || !category || !amount || !date) {
      return res.status(400).json({ message: "Thiếu dữ liệu cần thiết!" });
    }

    const newTx = new Transaction({
      type,
      category,
      amount,
      desc,
      date,
      userId: req.user.id, // ✅ Giờ middleware sẽ gắn được user id thật
    });

    await newTx.save();
    console.log("✅ Lưu giao dịch thành công:", newTx);
    res.status(201).json(newTx);
  } catch (err) {
    console.error("🔥 Lỗi khi lưu giao dịch:", err);
    res.status(500).json({ message: err.message });
  }
});
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deleted)
      return res
        .status(404)
        .json({ message: "Không tìm thấy hoặc không có quyền xóa!" });
    res.json({ message: "Đã xóa thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
