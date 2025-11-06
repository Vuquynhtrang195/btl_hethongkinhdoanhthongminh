import { useEffect, useState } from "react";
import axios from "axios";

export default function ReminderList() {
  const [items, setItems] = useState([]);
  const token = localStorage.getItem("token");

  const load = async () => {
    const { data } = await axios.get(
      "http://localhost:5000/api/calendar/reminders",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const removeItem = async (id) => {
    await axios.delete(`http://localhost:5000/api/calendar/reminders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await load();
  };

  return (
    <div className="reminder-list">
      {items.map((r) => (
        <div key={r._id} className="reminder-card">
          <div className="top">
            <b>{r.title}</b>
            {r.recurrence === "MONTHLY" && <span className="tag">Monthly</span>}
          </div>
          <div>{new Date(r.dueAt).toLocaleString()}</div>
          {r.amount ? (
            <div>Số tiền: {r.amount.toLocaleString()} VND</div>
          ) : null}
          {r.billType ? <div>Loại: {r.billType}</div> : null}
          <div className="actions">
            <button onClick={() => removeItem(r._id)}>🗑️ Xóa</button>
            {/* Bạn có thể thêm nút Sửa mở modal update */}
          </div>
        </div>
      ))}
    </div>
  );
}
