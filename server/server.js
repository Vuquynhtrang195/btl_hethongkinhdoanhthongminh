import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";


dotenv.config();

const app = express();

// ====== CORS ======
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"], // 👈 thêm PUT, DELETE
    credentials: true,
  })
);

app.use(express.json());

// ====== KẾT NỐI MONGODB ======
mongoose
  .connect("mongodb://127.0.0.1:27017/smartfinance", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Đã kết nối MongoDB"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// ====== ROUTES ======
app.use("/api", userRoutes); // login / register
app.use("/api/transactions", transactionRoutes); // giao dịch
app.use("/api/calendar", calendarRoutes); // Google Calendar


// ====== MIDDLEWARE XỬ LÝ LỖI ======
app.use((err, req, res, next) => {
  console.error("🔥 Lỗi server:", err);
  res.status(500).json({ message: err.message || "Lỗi không xác định" });
});

// ====== KHỞI CHẠY SERVER ======
app.listen(5000, () => {
  console.log("🚀 Server chạy tại cổng 5000");
});
