import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";

import User from "./models/User.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000", // Cho phép React gọi API
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/smartfinance");

app.use("/api", userRoutes);

app.listen(5000, () =>
  console.log("🚀 Server chạy tại cổng 5000\n✅ Đã kết nối MongoDB")
);
