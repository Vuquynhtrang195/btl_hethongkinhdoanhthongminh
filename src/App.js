import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import ThuChi from "./pages/ThuChi";
import SoGiaoDich from "./pages/SoGiaoDich";
import NhacNho from "./pages/NhacNho";
import NganSach from "./pages/NganSach";
import CaiDat from "./pages/CaiDat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Lắng nghe thay đổi token (khi login/logout)
  useEffect(() => {
    const handleStorageChange = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Router>
      <div className="app-layout">
        {token && <Sidebar />}
        <div className="main-content">
          <Routes>
            {token ? (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/thuchi" element={<ThuChi />} />
                <Route path="/sogiaodich" element={<SoGiaoDich />} />
                <Route path="/nhacnho" element={<NhacNho />} />
                <Route path="/ngansach" element={<NganSach />} />
                <Route path="/caidat" element={<CaiDat />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            ) : (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
