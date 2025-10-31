import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CaiDat.css";
import NavbarApp from "../components/NavbarApp";

export default function CaiDat() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ✅ Gọi API lấy thông tin người dùng
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return; // chưa login thì cứ hiển thị trang + nút Đăng nhập/Đổi TK
      }

      try {
        const res = await fetch("http://localhost:5000/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setUser(data);
        else setUser(null); // KHÔNG navigate ở đây để nhìn UI & debug
      } catch (err) {
        console.error("Lỗi khi lấy thông tin user:", err);
        setUser(null);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setTimeout(() => {
      window.location.href = "/login";
    }, 100);
  };

  return (
    <>
      <NavbarApp showUser={false} />
      <div className="page-content setting-page">
        <div className="setting-card">
          <h2 className="setting-title">⚙️ Cài đặt</h2>

          <div className="setting-section">
            <div className="setting-item">
              <span>👤</span>
              <strong>{user ? user.name : "Đang tải..."}</strong>
            </div>
            <div className="setting-item clickable">
              <span>🔒</span>
              <p>Tài khoản và bảo mật</p>
            </div>
            <div className="setting-item">
              <span>❓</span>
              <p>Trung tâm trợ giúp</p>
            </div>

            <div className="setting-item">
              <span>🌐</span>
              <p>Ngôn ngữ</p>
              <select className="lang-select">
                <option value="vi">VI</option>
                <option value="en">EN</option>
              </select>
            </div>
          </div>

          <div className="setting-actions">
            <button className="btn btn-logout" onClick={handleLogout}>
              Đăng xuất
            </button>
            <button className="btn btn-switch">Chuyển tài khoản</button>
          </div>
        </div>
      </div>
    </>
  );
}
