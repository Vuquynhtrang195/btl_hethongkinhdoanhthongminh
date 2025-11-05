import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    alert(data.message || "Nếu email tồn tại, liên kết đặt lại đã được gửi!");
  };

  return (
    <>
      <Navbar />
      <div className="auth-wrap gradient-bg">
        <div className="auth-card big-card">
          <h2 className="auth-title">🔑 Quên mật khẩu</h2>
          <p className="auth-sub">Nhập email để đặt lại mật khẩu</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="btn">Gửi liên kết đặt lại</button>
          </form>
          <div className="auth-links">
            <Link to="/login">← Quay lại đăng nhập</Link>
          </div>
        </div>
      </div>
    </>
  );
}
