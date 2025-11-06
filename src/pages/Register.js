import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    alert(data.message || "Đăng ký thành công!");
  };

  return (
    <>
      <Navbar />
      <div className="auth-wrap gradient-bg">
        <div className="auth-card big-card">
          <h2 className="auth-title">📝 Tạo tài khoản</h2>
          <p className="auth-sub">Giúp bạn kiểm soát dòng tiền hiệu quả</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              className="input"
              type="text"
              placeholder="Họ và tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
            <button className="btn">Đăng ký</button>
          </form>
          <div className="auth-links">
            <p>
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
