// 📁 server/services/geminiService.js
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

/**
 * Gửi prompt đến Gemini API (model 2.5-flash).
 */
export async function getGeminiReply(prompt) {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
  const apiKey = process.env.GEMINI_API_KEY;

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };

  try {
    const res = await fetch(`${url}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
      "Không có phản hồi từ Gemini.";
    console.log("✅ Gemini (2.5-flash) trả lời:", reply);
    return reply;
  } catch (err) {
    console.error("❌ Lỗi khi gọi Gemini API:", err.message);
    return "⚠️ Lỗi khi kết nối với Gemini. Vui lòng thử lại sau.";
  }
}
