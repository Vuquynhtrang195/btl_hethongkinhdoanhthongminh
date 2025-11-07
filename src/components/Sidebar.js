import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const location = useLocation();
  const { t } = useTranslation();

  // Định nghĩa các mục menu bằng key dịch thuật và icon
  const menuItems = [
    { path: "/dashboard", key: "navigation.dashboard", icon: "🏠" },
    { path: "/thuchi", key: "navigation.income_expense", icon: "💸" },
    { path: "/sogiaodich", key: "navigation.transactions", icon: "💰" },
    { path: "/nhacnho", key: "navigation.reminders", icon: "🔔" },
    { path: "/ngansach", key: "navigation.budget", icon: "📊" },
    { path: "/import", key: "Import CSV", icon: "📂" },
    { path: "/caidat", key: "navigation.settings", icon: "⚙️" },
  ];

  return (
    <aside className="sidebar">
      <h2 className="logo">{t("app.title")}</h2>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={location.pathname === item.path ? "active" : ""}
            >
              {/* ✅ Dùng t(item.key) để dịch chữ */}
              <Link to={item.path}>
                {item.icon} {t(item.key)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
