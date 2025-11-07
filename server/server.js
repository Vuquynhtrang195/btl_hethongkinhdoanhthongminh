// ====== IMPORT CÁC THƯ VIỆN ======
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// ====== IMPORT ROUTES ======
import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import transactionGASRoutes from "./routes/transactionGASRoutes.js";
import transactionUploadRoutes from "./routes/transactionUploadRoutes.js"; // ✅ Upload CSV

dotenv.config();

// ====== KHỞI TẠO ỨNG DỤNG EXPRESS ======
const app = express();
const PORT = process.env.PORT || 5000;

// ====== MIDDLEWARE CORS ======
app.use(cors({
  origin: "*", // Cho phép tất cả domain (cả Google Apps Script)
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// ====== MIDDLEWARE LOG ======
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  res.setHeader("Content-Type", "application/json"); // đảm bảo mọi response trả JSON
  next();
});

app.use(express.json());

// ====== KẾT NỐI MONGODB ======
mongoose
  .connect("mongodb://127.0.0.1:27017/smartfinance", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Đã kết nối MongoDB"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// ====== KHAI BÁO ROUTES ======
app.use("/api", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/transactions-gas", transactionGASRoutes);
app.use("/api/transaction", transactionUploadRoutes); // ✅ route upload CSV

// ====== ROUTE TEST ======
app.get("/api/test", (req, res) => {
  res.json({
    message: "✅ Server đang hoạt động!",
    timestamp: new Date(),
    port: PORT,
    environment: process.env.NODE_ENV || "development",
  });
});

// ====== ROUTE DEBUG MONGODB ======
app.get("/api/debug-collections", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const names = collections.map(c => c.name);
    res.json({
      status: "success",
      database: "smartfinance",
      collections: names,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====== ROUTE FALLBACK ======
app.use((req, res) => {
  console.log(`❌ Route không tồn tại: ${req.originalUrl}`);
  res.status(404).json({
    error: "Route không tồn tại",
    requestedUrl: req.originalUrl,
  });
});

// ====== XỬ LÝ LỖI TOÀN CỤC ======
app.use((err, req, res, next) => {
  console.error("🔥 Lỗi server:", err);
  res.status(500).json({ message: err.message || "Lỗi không xác định" });
});

// ====== CHẠY SERVER ======
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại cổng ${PORT}`);
  console.log(`📊 Test URL: http://localhost:${PORT}/api/test`);
  console.log(`📊 Debug Collections: http://localhost:${PORT}/api/debug-collections`);
  console.log(`📊 Upload CSV: http://localhost:${PORT}/api/transaction-upload/upload`);
  console.log(`📊 Transactions GAS: http://localhost:${PORT}/api/transactions-gas/all`);
});
