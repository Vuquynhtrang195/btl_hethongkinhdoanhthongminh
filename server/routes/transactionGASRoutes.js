import express from "express";
import mongoose from "mongoose";

const router = express.Router();

/**
 * 📦 Route: /api/transactions-gas/all
 * 👉 Trả về dữ liệu transactions cho Google Apps Script
 */
router.get("/all", async (req, res) => {
  try {
    console.log("📥 Yêu cầu lấy dữ liệu từ MongoDB...");

    // Đảm bảo kết nối MongoDB còn hoạt động
    if (!mongoose.connection.db) {
      return res.status(500).json({ error: "❌ MongoDB chưa kết nối" });
    }

    // Các tên collection có thể có
    const possibleCollections = ["transactions", "transaction", "giao dich"];
    let data = [];
    let usedCollection = "";

    for (const name of possibleCollections) {
      try {
        const collection = mongoose.connection.db.collection(name);
        const count = await collection.countDocuments();
        console.log(`📊 Collection '${name}' có ${count} documents`);

        if (count > 0) {
          data = await collection.find({}).limit(100).toArray();
          usedCollection = name;
          console.log(`✅ Đã tìm thấy collection: ${name}`);
          break;
        }
      } catch (err) {
        console.log(`⚠️ Không tìm thấy collection '${name}': ${err.message}`);
      }
    }

    // Không có dữ liệu nào
    if (data.length === 0) {
      const allCollections = (
        await mongoose.connection.db.listCollections().toArray()
      ).map((c) => c.name);
      return res.json({
        success: false,
        message: "Không tìm thấy dữ liệu trong các collection mặc định",
        availableCollections: allCollections,
      });
    }

    // Đảm bảo luôn trả JSON đúng định dạng
    res.setHeader("Content-Type", "application/json");
    res.json({
      success: true,
      collection: usedCollection,
      count: data.length,
      sample: data.slice(0, 5), // chỉ trả 5 mẫu minh họa
      message: "Dữ liệu transactions trả về thành công",
    });
  } catch (err) {
    console.error("❌ Lỗi trong route /transactions-gas/all:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📡 Route test đơn giản: /api/transactions-gas/test
 */
router.get("/test", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json({
    message: "✅ Route /transactions-gas/test hoạt động!",
    timestamp: new Date(),
  });
});

export default router;
