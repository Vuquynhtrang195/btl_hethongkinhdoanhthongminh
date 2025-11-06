// export_to_sqlite.cjs
const sqlite3 = require("sqlite3").verbose();
const mongoose = require("mongoose");

// Kết nối MongoDB của bạn

mongoose.connect("mongodb://127.0.0.1:27017/smartfinance");

const transactionSchema = new mongoose.Schema({
  userId: String,
  type: String, // "thu" hoặc "chi"
  category: String,
  amount: Number,
  date: Date,
  note: String,
});

const Transaction = mongoose.model("Transaction", transactionSchema);

// Tạo hoặc mở file SQLite
const db = new sqlite3.Database("finance.db");

// Đảm bảo có bảng
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS transactions (
      id TEXT,
      userId TEXT,
      type TEXT,
      category TEXT,
      amount REAL,
      date TEXT,
      note TEXT
    )`
  );
});

async function exportData() {
  try {
    const transactions = await Transaction.find();
    console.log(`✅ Số giao dịch lấy được: ${transactions.length}`);

    const stmt = db.prepare(
      "INSERT INTO transactions (id, userId, type, category, amount, date, note) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );

    transactions.forEach((t) => {
      stmt.run(
        t._id.toString(),
        t.userId,
        t.type,
        t.category,
        t.amount,
        t.date?.toISOString() || null,
        t.note
      );
    });

    stmt.finalize(() => {
      console.log("✅ Xuất dữ liệu hoàn tất → finance.db");
      db.close();
      mongoose.connection.close();
    });
  } catch (err) {
    console.error("🔥 Lỗi khi export:", err);
  }
}

exportData();
