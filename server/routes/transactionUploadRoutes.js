import express from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // tạm lưu file

// POST /api/transactions/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Thiếu file" });

    const results = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csv({ skipLines: 0, mapHeaders: ({ header }) => header?.trim() }))
      .on("data", (data) => {
        // convert nếu cần: ví dụ parse số, date
        const row = {
          // kỳ vọng CSV có header: date, description, amount, category
          date: data.date ? new Date(data.date) : null,
          description: data.description ?? data.Description ?? "",
          amount: data.amount ? parseFloat(data.amount) : (data.Amount ? parseFloat(data.Amount) : null),
          category: data.category ?? data.Category ?? "",
          raw: data // giữ raw object nếu cần
        };
        results.push(row);
      })
      .on("end", () => {
        // xóa file tạm
        fs.unlink(filePath, (err) => {
          if (err) console.warn("Không xóa được file tạm:", err);
        });
        res.json({ rows: results });
      })
      .on("error", (err) => {
        fs.unlink(filePath, () => {});
        res.status(500).json({ message: "Lỗi đọc CSV", error: err.message });
      });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

export default router;
