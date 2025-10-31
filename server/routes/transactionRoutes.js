import express from "express";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// 📍 GET: Lấy danh sách giao dịch
router.get("/", async (req, res) => {
  try {
    const list = await Transaction.find().sort({ date: -1 });
    res.json(list);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy dữ liệu", error: err.message });
  }
});

// 📍 POST: Thêm giao dịch mới
router.post("/", async (req, res) => {
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
      date: new Date(date), // ép về Date thật
    });

    await newTx.save();
    console.log("✅ Lưu giao dịch thành công:", newTx);
    res.status(201).json(newTx);
  } catch (err) {
    console.error("🔥 Lỗi khi lưu giao dịch:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
