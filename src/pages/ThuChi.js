import React, { useState } from "react";
import NavbarApp from "../components/NavbarApp";
import axios from "axios";
import "./ThuChi.css";

export default function ThuChi() {
  const [expense, setExpense] = useState({
    amount: "",
    category: "",
    desc: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [income, setIncome] = useState({
    amount: "",
    category: "",
    desc: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [notify, setNotify] = useState({ show: false, message: "", type: "" });

  // ========== Hàm hiển thị thông báo nổi ==========
  const showNotify = (msg, type) => {
    setNotify({ show: true, message: msg, type });
    setTimeout(() => setNotify({ show: false, message: "", type: "" }), 2500);
  };

  // ========== Gửi dữ liệu lên MongoDB ==========
  const handleAdd = async (type) => {
    const data = type === "chi" ? expense : income;

    if (!data.amount || !data.category)
      return showNotify("⚠️ Nhập đủ thông tin nhé!", "warning");

    const newTx = {
      type,
      amount: parseFloat(data.amount),
      category: data.category,
      desc: data.desc,
      date: new Date(data.date), // 👈 quan trọng
    };

    try {
      const token = localStorage.getItem("token"); // 👈 Lấy token từ localStorage

      await axios.post("http://localhost:5000/api/transactions", newTx, {
        headers: {
          Authorization: `Bearer ${token}`, // 👈 Gửi token trong header
        },
      });

      showNotify(
        type === "chi"
          ? "💸 Đã thêm chi tiêu thành công!"
          : "💰 Đã thêm thu nhập thành công!",
        type
      );

      // Reset form
      if (type === "chi")
        setExpense({
          amount: "",
          category: "",
          desc: "",
          date: new Date().toISOString().slice(0, 10),
        });
      else
        setIncome({
          amount: "",
          category: "",
          desc: "",
          date: new Date().toISOString().slice(0, 10),
        });
    } catch (err) {
      console.error(err);
      showNotify("❌ Lỗi khi lưu vào MongoDB!", "error");
    }
  };

  return (
    <>
      <NavbarApp />

      {/* ======== Thông báo nổi ======== */}
      {notify.show && (
        <div className={`notify-box ${notify.type}`}>{notify.message}</div>
      )}

      <div className="thu-chi-container">
        <h2 className="page-title">💸 Quản lý Thu & Chi</h2>
        <p className="subtitle">
          Ghi lại thu nhập và chi tiêu của bạn mỗi ngày để theo dõi tài chính
          thông minh hơn.
        </p>

        <div className="forms-grid">
          {/* ===== Chi tiêu ===== */}
          <div className="form-card expense-card">
            <h3>Chi tiêu</h3>
            <div className="form-group">
              <label>Số tiền (VND)</label>
              <input
                type="number"
                value={expense.amount}
                onChange={(e) =>
                  setExpense({ ...expense, amount: e.target.value })
                }
                placeholder="Nhập số tiền..."
              />
            </div>
            <div className="form-group">
              <label>Thể loại</label>
              <input
                type="text"
                value={expense.category}
                onChange={(e) =>
                  setExpense({ ...expense, category: e.target.value })
                }
                placeholder="Ăn uống, đi lại, mua sắm..."
              />
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <input
                type="text"
                value={expense.desc}
                onChange={(e) =>
                  setExpense({ ...expense, desc: e.target.value })
                }
                placeholder="Ghi chú thêm..."
              />
            </div>
            <div className="form-group">
              <label>Ngày</label>
              <input
                type="date"
                value={expense.date}
                onChange={(e) =>
                  setExpense({ ...expense, date: e.target.value })
                }
              />
            </div>
            <button className="btn-expense" onClick={() => handleAdd("chi")}>
              ➕ Thêm chi tiêu
            </button>
          </div>

          {/* ===== Thu nhập ===== */}
          <div className="form-card income-card">
            <h3>Thu nhập</h3>
            <div className="form-group">
              <label>Số tiền (VND)</label>
              <input
                type="number"
                value={income.amount}
                onChange={(e) =>
                  setIncome({ ...income, amount: e.target.value })
                }
                placeholder="Nhập số tiền..."
              />
            </div>
            <div className="form-group">
              <label>Nguồn thu</label>
              <input
                type="text"
                value={income.category}
                onChange={(e) =>
                  setIncome({ ...income, category: e.target.value })
                }
                placeholder="Lương, thưởng, freelance..."
              />
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <input
                type="text"
                value={income.desc}
                onChange={(e) => setIncome({ ...income, desc: e.target.value })}
                placeholder="Ghi chú thêm..."
              />
            </div>
            <div className="form-group">
              <label>Ngày</label>
              <input
                type="date"
                value={income.date}
                onChange={(e) => setIncome({ ...income, date: e.target.value })}
              />
            </div>
            <button className="btn-income" onClick={() => handleAdd("thu")}>
              ➕ Thêm thu nhập
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
