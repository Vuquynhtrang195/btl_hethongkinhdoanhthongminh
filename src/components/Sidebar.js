import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", label: "🏠 Dashboard" },
    { path: "/thuchi", label: "💸 Thu chi" },
    { path: "/sogiaodich", label: "💰 Sổ giao dịch" },
    { path: "/nhacnho", label: "🔔 Nhắc nhở" },
    { path: "/ngansach", label: "📊 Ngân sách" },
    { path: "/du-doan", label: "🤖 Dự đoán AI" }, // thêm mục mới
    { path: "/caidat", label: "⚙️ Cài đặt" },
  ];

  return (
    <aside className="sidebar">
      <h2 className="logo">Smart Finance</h2>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={location.pathname === item.path ? "active" : ""}
            >
              <Link to={item.path}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
