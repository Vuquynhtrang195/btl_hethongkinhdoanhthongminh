import React, { useState } from "react";
import axios from "axios";

export default function ImportCSVServer() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      setMsg("Đang tải...");
      const res = await axios.post("http://localhost:5000/api/transactions/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setRows(res.data.rows || []);
      setMsg(`Đã đọc ${res.data.rows?.length ?? 0} dòng`);
    } catch (err) {
      console.error(err);
      setMsg("Lỗi upload/parse file");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📤 Import CSV (Server-side)</h2>
      <input type="file" accept=".csv,text/csv" onChange={handleUpload} />
      {msg && <p>{msg}</p>}

      <table border="1" cellPadding="6" style={{ marginTop: 12 }}>
        <thead>
          <tr>
            {rows[0] && Object.keys(rows[0]).map((k) => <th key={k}>{k}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {Object.values(r).map((v, j) => <td key={j}>{v?.toString?.() ?? ""}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
