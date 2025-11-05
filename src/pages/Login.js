import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      alert("Đăng nhập thành công!");
      navigate("/");
      window.location.href = "/";
    } else {
      alert(data.message || "Đăng nhập thất bại!");
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-wrap gradient-bg">
        <div className="auth-card big-card">
          <h2 className="auth-title">💰 Quản lý chi tiêu cá nhân</h2>
          <p className="auth-sub">Đăng nhập để theo dõi tài chính của bạn</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="input"
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button className="btn">Đăng nhập</button>
          </form>
          <div className="auth-links">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
            <p>
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
