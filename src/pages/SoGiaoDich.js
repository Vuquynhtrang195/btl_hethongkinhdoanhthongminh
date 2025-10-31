import React, { useEffect, useState } from "react";
import NavbarApp from "../components/NavbarApp";
import "./SoGiaoDich.css";

export default function SoGiaoDich() {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const saved = localStorage.getItem("transactions");
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(parsed);
    }
  }, []);

  useEffect(() => {
    const filteredTx = transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() + 1 === Number(month) && d.getFullYear() === Number(year)
      );
    });
    setFiltered(filteredTx);
  }, [transactions, month, year]);

  const grouped = filtered.reduce((acc, tx) => {
    const dateStr = new Date(tx.date).toLocaleDateString("vi-VN");
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(tx);
    return acc;
  }, {});

  const totalIncome = filtered
    .filter((t) => t.type === "thu")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filtered
    .filter((t) => t.type === "chi")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = 2020; y <= currentYear + 2; y++) years.push(y);
  years.sort((a, b) => b - a);

  return (
    <>
      <NavbarApp />
      <div className="so-giao-dich-dashboard">
        {/* ======= PHẦN HEADER CỐ ĐỊNH ======= */}
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

          {/* Tổng quan */}
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

        {/* ======= PHẦN DANH SÁCH CUỘN ======= */}
        <div className="transaction-scroll-area">
          {filtered.length === 0 ? (
            <p className="no-data">Không có giao dịch trong tháng này 😅</p>
          ) : (
            Object.entries(grouped).map(([date, list]) => (
              <div key={date} className="day-section">
                <h3 className="date-title">🗓 {date}</h3>
                {list.map((t) => (
                  <div
                    key={t.id}
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
