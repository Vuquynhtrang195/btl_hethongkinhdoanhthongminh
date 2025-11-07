// 📁 server/services/testGeminiModels.js
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("⚠️ Chưa có GEMINI_API_KEY trong .env");
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;

try {
  console.log("🔍 Đang kiểm tra danh sách model từ Gemini API...");
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`❌ Lỗi HTTP ${res.status}: ${text}`);
  }
  const data = await res.json();
  console.log("\n✅ Danh sách model bạn có quyền sử dụng:\n");
  for (const model of data.models) {
    console.log("🧠", model.name);
  }
} catch (err) {
  console.error("❌ Không thể lấy danh sách model:", err.message);
}
