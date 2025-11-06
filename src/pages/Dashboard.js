import React, { useEffect, useState } from "react";
import NavbarApp from "../components/NavbarApp";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./Dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState({ income: 0, expense: 0, balance: 0 });
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/dashboard?month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(res.data);
    } catch (err) {
      console.error("Lỗi tải Dashboard:", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [month, year]);

  const format = (n) => n.toLocaleString("vi-VN");
  const chartData = [
    { name: "Thu nhập", value: data.income },
    { name: "Chi tiêu", value: data.expense },
  ];

  const COLORS = ["#4CAF50", "#FF6384", "#36A2EB"];

  return (
    <>
      <NavbarApp />
      <div className="dashboard-page">
        <h2>🏠 Dashboard</h2>

        {/* Bộ lọc tháng/năm */}
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

        {/* Thẻ tổng quan */}
        <div className="dashboard-cards">
          <div className="card income">
            <h4>💰 Thu nhập</h4>
            <p>{format(data.income)} VND</p>
          </div>

          <div className="card expense">
            <h4>🛒 Chi tiêu</h4>
            <p>{format(data.expense)} VND</p>
          </div>

          <div className="card balance">
            <h4>💳 Số dư</h4>
            <p>{format(data.balance)} VND</p>
          </div>
        </div>

        {/* Biểu đồ tròn */}
        <div className="chart-section">
          <h3>📊 Tỷ lệ thu - chi - số dư</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v.toLocaleString("vi-VN")} VND`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ cột */}
        <div className="chart-section">
          <h3>📈 So sánh thu nhập, chi tiêu và số dư</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 40, right: 30, left: 20, bottom: 20 }}
              barSize={80}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 14 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => v.toLocaleString("vi-VN")}
                tick={{ fontSize: 13 }}
                width={100}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(v) => `${v.toLocaleString("vi-VN")} VND`} />
              <Legend verticalAlign="top" height={36} />
              <Bar
                dataKey="value"
                radius={[10, 10, 0, 0]}
                label={{
                  position: "top",
                  formatter: (v) => v.toLocaleString("vi-VN"),
                  fill: "#333",
                  fontSize: 13,
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* 📈 Phân tích tài chính thông minh */}
        <div className="analysis-section">
          <h3>🤖 Phân tích tài chính thông minh</h3>

          {(() => {
            const { income, expense, balance } = data;
            if (income === 0 && expense === 0) {
              return <p>Không có dữ liệu để phân tích.</p>;
            }

            const savingRate =
              income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

            let summary = "";
            if (savingRate >= 40) {
              summary =
                "💪 Tài chính rất tốt! Bạn đang tiết kiệm nhiều hơn 40% thu nhập.";
            } else if (savingRate >= 20) {
              summary = "👍 Tình hình ổn định, bạn đang tiết kiệm hợp lý.";
            } else if (savingRate >= 10) {
              summary = "⚠️ Cần chú ý, tỷ lệ tiết kiệm của bạn đang hơi thấp.";
            } else {
              summary =
                "🚨 Cảnh báo! Bạn đang chi tiêu quá mức, nên xem lại kế hoạch chi tiêu.";
            }

            // Phân tích chi tiêu
            const expenseRate =
              income > 0 ? ((expense / income) * 100).toFixed(1) : 0;
            let advice = "";
            if (expenseRate > 80) {
              advice =
                "Bạn đang tiêu hơn 80% thu nhập, hãy cân nhắc cắt giảm các khoản không thiết yếu.";
            } else if (expenseRate > 60) {
              advice =
                "Chi tiêu ở mức khá cao, nên đặt mục tiêu tiết kiệm ít nhất 20% thu nhập.";
            } else {
              advice =
                "Bạn chi tiêu hợp lý, tiếp tục duy trì và đầu tư phần tiết kiệm.";
            }

            return (
              <div className="analysis-box">
                <p>
                  <strong>Tỷ lệ tiết kiệm:</strong> {savingRate}%
                </p>
                <p>
                  <strong>Tỷ lệ chi tiêu:</strong> {expenseRate}%
                </p>
                <hr />
                <p>{summary}</p>
                <p>{advice}</p>
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
}
