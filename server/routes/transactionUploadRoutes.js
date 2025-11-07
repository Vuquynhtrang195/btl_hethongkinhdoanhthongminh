import express from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import iconv from "iconv-lite";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ✅ POST /api/transactions/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Thiếu file CSV" });

    const filePath = req.file.path;
    const results = [];

    console.log(`📂 Đang đọc file: ${filePath}`);

    fs.createReadStream(filePath)
      .pipe(iconv.decodeStream("utf8"))
      .pipe(csv({ mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, "") }))
      .on("data", (data) => {
        if (!data.type && !data.category && !data.amount) return;

        // 🔧 Chuẩn hóa userId — tránh lỗi ObjectId
        let validUserId;
        if (mongoose.Types.ObjectId.isValid(data.userId)) {
          validUserId = data.userId;
        } else {
          // 🔹 Gán tạm 1 ID người dùng mặc định (ví dụ: admin)
          validUserId = "690c3f639f8efac3e440c736"; // Thay bằng _id user admin của bạn
        }

        const row = {
          type: data.type?.trim() || "",
          category: data.category?.trim() || "",
          amount: data.amount ? parseFloat(data.amount) : 0,
          desc: data.desc?.trim() || "",
          date: data.date ? new Date(data.date) : new Date(),
          userId: validUserId,
        };
        results.push(row);
      })
      .on("end", async () => {
        fs.unlink(filePath, () => {});
        console.log(`✅ Đọc xong file, tổng số dòng: ${results.length}`);

        if (results.length === 0)
          return res.status(200).json({ message: "Không có dòng hợp lệ", total: 0, rows: [] });

        try {
          const inserted = await Transaction.insertMany(results, { ordered: false });
          console.log(`💾 Đã lưu ${inserted.length} giao dịch vào MongoDB`);

          return res.status(200).json({
            message: `✅ Đã lưu ${inserted.length} giao dịch vào MongoDB`,
            total: inserted.length,
            rows: inserted.map((t) => ({
              type: t.type,
              category: t.category,
              amount: t.amount,
              desc: t.desc,
              date: t.date,
              userId: t.userId,
            })),
          });
        } catch (err) {
          console.error("❌ Lỗi khi lưu Mongo:", err);
          return res.status(500).json({ message: "Lỗi lưu MongoDB", error: err.message });
        }
      })
      .on("error", (err) => {
        console.error("❌ Lỗi đọc CSV:", err);
        fs.unlink(filePath, () => {});
        res.status(500).json({ message: "Lỗi đọc CSV", error: err.message });
      });
  } catch (err) {
    console.error("🔥 Lỗi server:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

export default router;
