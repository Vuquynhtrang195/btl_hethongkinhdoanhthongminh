import React, { useState } from "react";
import NavbarApp from "../components/NavbarApp";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "./ThuChi.css";

export default function ThuChi() {
  const { t } = useTranslation();
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
      return showNotify(t("toast.fill_info"), "warning");

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
          ? t("toast.add_expense_success")
          : t("toast.add_income_success"),
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
      showNotify(t("toast.save_fail"), "error");
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
        <h2 className="page-title">💸 {t("page.income_expense")}</h2>
        <p className="subtitle">{t("ie.subtitle")}</p>

        <div className="forms-grid">
          {/* ===== Chi tiêu ===== */}
          <div className="form-card expense-card">
            <h3>{t("ie.expense_type")}</h3>
            <div className="form-group">
              <label>{t("ie.amount_vnd")}</label>
              <input
                type="number"
                value={expense.amount}
                onChange={(e) =>
                  setExpense({ ...expense, amount: e.target.value })
                }
                placeholder={t("ie.amount_placeholder")}
              />
            </div>
            <div className="form-group">
              <label>{t("ie.category")}</label>
              <input
                type="text"
                value={expense.category}
                onChange={(e) =>
                  setExpense({ ...expense, category: e.target.value })
                }
                placeholder={t("ie.category_placeholder_expense")}
              />
            </div>
            <div className="form-group">
              <label>{t("ie.description")}</label>
              <input
                type="text"
                value={expense.desc}
                onChange={(e) =>
                  setExpense({ ...expense, desc: e.target.value })
                }
                placeholder={t("ie.note_placeholder")}
              />
            </div>
            <div className="form-group">
              <label>{t("ie.date")}</label>
              <input
                type="date"
                value={expense.date}
                onChange={(e) =>
                  setExpense({ ...expense, date: e.target.value })
                }
              />
            </div>
            <button className="btn-expense" onClick={() => handleAdd("chi")}>
              ➕ {t("ie.add_expense")}
            </button>
          </div>

          {/* ===== Thu nhập ===== */}
          <div className="form-card income-card">
            <h3>{t("ie.income_type")}</h3>
            <div className="form-group">
              <label>{t("ie.amount_vnd")}</label>
              <input
                type="number"
                value={income.amount}
                onChange={(e) =>
                  setIncome({ ...income, amount: e.target.value })
                }
                placeholder={t("ie.amount_placeholder")}
              />
            </div>
            <div className="form-group">
              <label>{t("ie.source")}</label>
              <input
                type="text"
                value={income.category}
                onChange={(e) =>
                  setIncome({ ...income, category: e.target.value })
                }
                placeholder={t("ie.category_placeholder_income")}
              />
            </div>
            <div className="form-group">
              <label>{t("ie.description")}</label>
              <input
                type="text"
                value={income.desc}
                onChange={(e) => setIncome({ ...income, desc: e.target.value })}
                placeholder={t("ie.note_placeholder")}
              />
            </div>
            <div className="form-group">
              <label>{t("ie.date")}</label>
              <input
                type="date"
                value={income.date}
                onChange={(e) => setIncome({ ...income, date: e.target.value })}
              />
            </div>
            <button className="btn-income" onClick={() => handleAdd("thu")}>
              ➕ {t("ie.add_income")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
