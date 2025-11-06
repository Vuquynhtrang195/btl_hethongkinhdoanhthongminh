import React, { useEffect, useState } from "react";
import NavbarApp from "../components/NavbarApp";
import axios from "axios";
import "./NganSach.css";

export default function NganSach() {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/budgets?month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBudgets(res.data);
    } catch (err) {
      console.error("Lỗi khi tải ngân sách:", err);
    }
  };

  const addBudget = async () => {
    if (!category || !limit)
      return alert("Vui lòng nhập đủ danh mục và hạn mức!");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/budgets",
        { category, limit: Number(limit), month, year },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategory("");
      setLimit("");
      fetchBudgets();
    } catch (err) {
      alert(err.response?.data?.message || "Không thể thêm ngân sách!");
      console.error(err);
    }
  };

  const deleteBudget = async (id) => {
    if (!window.confirm("Xóa ngân sách này?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/budgets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <>
      <NavbarApp />
      <div className="budget-page">
        <h2>📊 Lập kế hoạch ngân sách</h2>

        <div className="month-year-filter">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>
        </div>

        <div className="budget-form">
          <input
            type="text"
            placeholder="Danh mục (ví dụ: Ăn uống)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <input
            type="number"
            placeholder="Hạn mức (VND)"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
          <button onClick={addBudget}>➕ Thêm ngân sách</button>
        </div>

        {budgets.length === 0 ? (
          <p>
            Chưa có ngân sách nào trong tháng {month}/{year}.
          </p>
        ) : (
          <div className="budget-list">
            {budgets.map((b) => {
              const percent = b.limit
                ? Math.min((b.spent / b.limit) * 100, 100)
                : 0;
              return (
                <div
                  key={b._id}
                  className={`budget-card ${b.overLimit ? "over-limit" : ""}`}
                >
                  <div className="budget-date">
                    <i className="fa-regular fa-calendar"></i>{" "}
                    {formatDate(b.createdAt)}
                  </div>
                  <h4>{b.category}</h4>
                  <p>Hạn mức: {b.limit?.toLocaleString()} VND</p>
                  <p>Đã tiêu: {b.spent?.toLocaleString()} VND</p>
                  <p>Còn lại: {b.remaining?.toLocaleString()} VND</p>

                  {b.overLimit && (
                    <div className="warning">
                      ⚠️ Bạn đã vượt hạn mức chi tiêu!
                    </div>
                  )}

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: b.overLimit
                          ? "#f44336"
                          : percent > 70
                          ? "#ff9800"
                          : "#4caf50",
                      }}
                    ></div>
                  </div>

                  <button
                    className="btn-delete"
                    onClick={() => deleteBudget(b._id)}
                  >
                    ❌ Xóa
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
