import React, { useEffect, useState } from "react";
import NavbarApp from "../components/NavbarApp";
import "./SoGiaoDich.css";
import axios from "axios";

export default function SoGiaoDich() {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ====== HÀM LẤY DỮ LIỆU TỪ BACKEND ======
  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("⚠️ Không có token, vui lòng đăng nhập lại.");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Sắp xếp theo ngày giảm dần
      const sorted = res.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setTransactions(sorted);
      setIsLoading(false);
    } catch (err) {
      console.error("🔥 Lỗi khi tải giao dịch:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  // ====== GỌI API KHI MỞ TRANG & CẬP NHẬT MỖI 10 GIÂY ======
  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 10000); // 10 giây
    return () => clearInterval(interval);
  }, []);

  // ====== LỌC THEO THÁNG / NĂM ======
  useEffect(() => {
    const filteredTx = transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() + 1 === Number(month) && d.getFullYear() === Number(year)
      );
    });
    setFiltered(filteredTx);
  }, [transactions, month, year]);

  // ====== NHÓM THEO NGÀY ======
  const grouped = filtered.reduce((acc, tx) => {
    const dateStr = new Date(tx.date).toLocaleDateString("vi-VN");
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(tx);
    return acc;
  }, {});

  // ====== TÍNH TOÁN ======
  const totalIncome = filtered
    .filter((t) => t.type === "thu")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filtered
    .filter((t) => t.type === "chi")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // ====== DANH SÁCH NĂM ======
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = 2020; y <= currentYear + 2; y++) years.push(y);
  years.sort((a, b) => b - a);

  // ====== RENDER UI ======
  return (
    <>
      <NavbarApp />
      <div className="so-giao-dich-dashboard">
        {/* ======= PHẦN HEADER ======= */}
        <div className="fixed-header">
          <div className="dashboard-header">
            <h2>💰 Sổ Giao Dịch</h2>
            <div className="filter-toolbar">
              <label>
                Tháng
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {m < 10 ? `0${m}` : m}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Năm
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* ======= TỔNG QUAN ======= */}
          <div className="summary-row">
            <div className="summary-card income">
              <div className="icon">💰</div>
              <div className="info">
                <p>Thu nhập</p>
                <h3>+{totalIncome.toLocaleString()} VND</h3>
              </div>
            </div>
            <div className="summary-card expense">
              <div className="icon">💸</div>
              <div className="info">
                <p>Chi tiêu</p>
                <h3>-{totalExpense.toLocaleString()} VND</h3>
              </div>
            </div>
            <div className="summary-card balance">
              <div className="icon">🧾</div>
              <div className="info">
                <p>Số dư</p>
                <h3>{balance.toLocaleString()} VND</h3>
              </div>
            </div>
          </div>
        </div>

        {/* ======= DANH SÁCH GIAO DỊCH ======= */}
        <div className="transaction-scroll-area">
          {isLoading ? (
            <p className="no-data">⏳ Đang tải dữ liệu...</p>
          ) : error ? (
            <p className="no-data error-message">⚠️ Lỗi: {error}</p>
          ) : filtered.length === 0 ? (
            <p className="no-data">Không có giao dịch trong tháng này 😅</p>
          ) : (
            Object.entries(grouped).map(([date, list]) => (
              <div key={date} className="day-section">
                <h3 className="date-title">🗓 {date}</h3>
                {list.map((t) => (
                  <div
                    key={t._id}
                    className={`transaction-item ${
                      t.type === "thu" ? "income" : "expense"
                    }`}
                  >
                    <div className="left">
                      <strong>{t.category}</strong>
                      <span>{t.desc || "Không có ghi chú"}</span>
                    </div>
                    <div className="right">
                      <span className="amount">
                        {t.type === "thu" ? "+" : "-"}
                        {t.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
