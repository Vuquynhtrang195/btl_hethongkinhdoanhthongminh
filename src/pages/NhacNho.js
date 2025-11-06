import React, { useState, useEffect } from "react";
import axios from "axios";
import NavbarApp from "../components/NavbarApp";
import "./NhacNho.css";

export default function NhacNho() {
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueAt: "",
    amount: "",
    billType: "electric",
    recurrence: "NONE",
  });

  const token = localStorage.getItem("token");

  // ====== Kết nối Google Calendar ======
  const connectGoogle = () => {
    window.open(
      "http://localhost:5000/api/calendar/connect",
      "_blank",
      "width=600,height=700"
    );
    window.addEventListener(
      "message",
      async (event) => {
        if (!event.data) return;
        console.log("📩 Nhận token Google:", event.data); // Thêm dòng này để debug
        const token = localStorage.getItem("token");
        try {
          await axios.post(
            "http://localhost:5000/api/calendar/save-token",
            event.data,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          alert("✅ Đã kết nối Google Calendar thành công!");
        } catch (err) {
          console.error("Lỗi lưu token:", err);
          alert("❌ Lỗi khi lưu token Google!");
        }
      },
      { once: true }
    );
  };

  // ====== Lấy danh sách nhắc nhở ======
  const loadReminders = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/calendar/reminders",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setReminders(res.data);
  };

  useEffect(() => {
    loadReminders();
  }, []);

  // ====== Xử lý form ======
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createReminder = async (e) => {
    e.preventDefault();
    await axios.post(
      "http://localhost:5000/api/calendar/reminders",
      {
        ...form,
        dueAt: new Date(form.dueAt).toISOString(),
        amount: form.amount ? Number(form.amount) : undefined,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    alert("✅ Tạo nhắc thành công!");

    setForm({
      title: "",
      description: "",
      dueAt: "",
      amount: "",
      billType: "electric",
      recurrence: "NONE",
    });
    loadReminders();
  };

  const deleteReminder = async (id) => {
    await axios.delete(`http://localhost:5000/api/calendar/reminders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadReminders();
  };

  return (
    <div className="nhacnho-page">
      <NavbarApp />

      <div className="nhacnho-container">
        <h2>🔔 Nhắc Thanh Toán Hóa Đơn</h2>

        {/* Nút kết nối Google Calendar */}
        <div className="google-connect">
          <p>Để đồng bộ lịch thanh toán, hãy kết nối với Google Calendar:</p>
          <button onClick={connectGoogle} className="btn-connect">
            🔗 Kết nối Google Calendar
          </button>
        </div>

        {/* Form tạo nhắc nhở */}
        <form className="reminder-form" onSubmit={createReminder}>
          <input
            type="text"
            name="title"
            placeholder="Tên hóa đơn (VD: Tiền điện tháng 11)"
            value={form.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Ghi chú..."
            value={form.description}
            onChange={handleChange}
          />
          <input
            type="datetime-local"
            name="dueAt"
            value={form.dueAt}
            onChange={handleChange}
            required
          />

          <div className="form-row">
            <select
              name="billType"
              value={form.billType}
              onChange={handleChange}
            >
              <option value="electric">Điện</option>
              <option value="water">Nước</option>
              <option value="internet">Internet</option>
              <option value="credit">Thẻ tín dụng</option>
              <option value="other">Khác</option>
            </select>

            <input
              type="number"
              name="amount"
              placeholder="Số tiền (VND)"
              value={form.amount}
              onChange={handleChange}
            />
          </div>

          <label>Lặp lại:</label>
          <select
            name="recurrence"
            value={form.recurrence}
            onChange={handleChange}
          >
            <option value="NONE">Không lặp</option>
            <option value="MONTHLY">Hàng tháng</option>
          </select>

          <button type="submit" className="btn-add">
            ➕ Thêm Nhắc
          </button>
        </form>

        {/* Danh sách nhắc nhở */}
        <div className="reminder-list">
          {reminders.length === 0 ? (
            <p className="no-reminder">Chưa có nhắc nào 💤</p>
          ) : (
            reminders.map((r) => (
              <div key={r._id} className="reminder-card">
                <div className="reminder-top">
                  <h4>{r.title}</h4>
                  {r.recurrence === "MONTHLY" && (
                    <span className="tag">Hàng tháng</span>
                  )}
                </div>
                <p>{r.description}</p>
                <p>
                  <b>Thời gian:</b> {new Date(r.dueAt).toLocaleString()}
                </p>
                {r.amount && (
                  <p>
                    <b>Số tiền:</b> {r.amount.toLocaleString()} VND
                  </p>
                )}
                <p>
                  <b>Loại:</b> {r.billType}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
