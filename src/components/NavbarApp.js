import { MdAccountCircle } from "react-icons/md";
import { useEffect, useState } from "react";
import "./NavbarApp.css";

export default function NavbarApp({ showUser = true }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!showUser) return; // ✅ Nếu không cần user thì bỏ qua luôn
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setUser(data);
      } catch (err) {
        console.error("Lỗi khi lấy user:", err);
      }
    };
    fetchUser();
  }, [showUser]);

  return (
    <div className="navbar-app">
      <div className="navbar-inner">
        {showUser && (
          <div className="navbar-user">
            <MdAccountCircle className="user-icon" />
            <span className="user-name">
              {user ? user.name : "Đang tải..."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
