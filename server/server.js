import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import predictRoutes from "./routes/predictRoutes.js";

const app = express();

// ✅ CORS CHUẨN EXPRESS 5
const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Kết nối MongoDB thành công"))
  .catch((err) => console.error("❌ MongoDB lỗi:", err));

app.use("/api", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/predict", predictRoutes);

app.get("/", (req, res) => res.send("🚀 Server đang chạy ngon!"));

app.use((err, req, res, next) => {
  console.error("🔥 Lỗi server:", err);
  res.status(500).json({ message: err.message || "Lỗi không xác định" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));
