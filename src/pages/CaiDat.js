import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./CaiDat.css";
import NavbarApp from "../components/NavbarApp";
import Sidebar from "../components/Sidebar"; // Đảm bảo đã import Sidebar

export default function CaiDat() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage);
  };

  // Lấy thông tin user khi load trang
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setUser(data);
        else setUser(null);
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

      {/* Cấu trúc layout chính */}
      <div className="page-content setting-page-with-sidebar">
        

        {/* ✅ Bọc nội dung cài đặt trong setting-content */}
        <div className="setting-content">
          <div className="setting-card">
            <h2 className="setting-title">⚙️ {t("settings.title")}</h2>

            <div className="setting-section">
              <div className="setting-item">
                <span>👤</span>
                <strong>{user ? user.name : t("status.loading")}</strong>
              </div>

              <div className="setting-item clickable">
                <span>🔒</span>
                <p>{t("settings.account_security")}</p>
              </div>

              <div className="setting-item">
                <span>❓</span>
                <p>{t("settings.help_center")}</p>
              </div>

              <div className="setting-item">
                <span>🌐</span>
                <p>{t("settings.language")}</p>
                <select
                  className="lang-select"
                  onChange={handleLanguageChange}
                  value={i18n.language}
                >
                  <option value="vi">{t("languages.vi_short")}</option>
                  <option value="en">{t("languages.en_short")}</option>
                </select>
              </div>
            </div>

            <div className="setting-actions">
              <button className="btn btn-logout" onClick={handleLogout}>
                {t("actions.logout")}
              </button>
              <button className="btn btn-switch">
                {t("actions.switch_account")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
