import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import User from "../models/User.js";

const router = express.Router();

// ✅ Khởi tạo Resend với API Key
const resend = new Resend("re_18BLcSo5_6wATETPekt1AwbK18xux5zVD");

// ==========================
// 🧩 Đăng ký
// ==========================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email đã được sử dụng!" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newUser._id }, "secret123", {
      expiresIn: "7d",
    });

    res.status(201).json({ message: "Tạo tài khoản thành công", token });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// ==========================
// 🔑 Đăng nhập
// ==========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "Không tìm thấy tài khoản!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu!" });

    const token = jwt.sign({ id: user._id }, "secret123", { expiresIn: "7d" });

    res.json({ message: "Đăng nhập thành công", token });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// ==========================
// 📧 Quên mật khẩu (Resend)
// ==========================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "Không tìm thấy email này!" });

    const resetToken = jwt.sign({ id: user._id }, "resetSecret123", {
      expiresIn: "1h",
    });

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    // ✅ Gửi email bằng Resend
    await resend.emails.send({
      from: "Smart Finance <onboarding@resend.dev>",
      to: email,
      subject: "🔑 Đặt lại mật khẩu Smart Finance",
      html: `
        <h2>Xin chào ${user.name || "bạn"},</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Smart Finance.</p>
        <p>Nhấn vào liên kết bên dưới để tạo mật khẩu mới:</p>
        <a href="${resetLink}" style="background-color:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Đặt lại mật khẩu</a>
        <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
        <hr />
        <p>Smart Finance Team</p>
      `,
    });

    res.json({
      message: "✅ Đã gửi liên kết đặt lại mật khẩu tới email của bạn.",
    });
  } catch (err) {
    console.error("❌ Lỗi gửi email:", err);
    res.status(500).json({
      message: "Không thể gửi email, vui lòng thử lại sau!",
      error: err.message,
    });
  }
});

// ==========================
// 🔄 Đặt lại mật khẩu
// ==========================
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const decoded = jwt.verify(token, "resetSecret123");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.json({ message: "✅ Mật khẩu đã được đặt lại thành công!" });
  } catch (err) {
    res.status(400).json({
      message: "❌ Token không hợp lệ hoặc đã hết hạn!",
      error: err.message,
    });
  }
});

// ==========================
// 👤 Lấy thông tin người dùng hiện tại (đã fix xác thực token)
// ==========================
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("📩 Header nhận được:", authHeader);

    if (!authHeader) {
      return res.status(401).json({ message: "Thiếu token xác thực!" });
    }

    const token = authHeader.split(" ")[1];
    console.log("🔑 Token tách được:", token);

    const decoded = jwt.verify(token, "secret123");
    console.log("✅ Giải mã token:", decoded);

    const user = await User.findById(decoded.id).select("name email");
    console.log("📦 User từ DB:", user);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    res.json({ name: user.name, email: user.email });
  } catch (err) {
    console.error("🔥 Lỗi /api/me:", err.message);
    res.status(401).json({
      message: "Token không hợp lệ hoặc đã hết hạn!",
      error: err.message,
    });
  }
});

export default router;
