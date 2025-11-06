import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ResetPassword.css";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(
      `http://localhost:5000/api/reset-password/${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      alert("✅ Đặt lại mật khẩu thành công!");
      navigate("/login");
    } else {
      alert(data.message || "❌ Không thể đặt lại mật khẩu!");
    }
  };

  return (
    <div className="auth-wrap gradient-bg">
      <div className="card auth-card">
        <h2 className="auth-title">🔐 Đặt lại mật khẩu</h2>
        <p className="auth-sub">Nhập mật khẩu mới cho tài khoản của bạn</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="input"
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button className="btn">Xác nhận</button>
        </form>
      </div>
    </div>
  );
}
