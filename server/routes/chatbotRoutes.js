// 📁 server/routes/chatbotRoutes.js
import express from "express";
import mongoose from "mongoose";
import authMiddleware from "../middleware/authMiddleware.js";
import Transaction from "../models/Transaction.js";
import nlpManager from "../services/nlpManager.js";
import { getGeminiReply } from "../services/geminiService.js";

const router = express.Router();

// === ENDPOINT API CHÍNH ===
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.id); // ✅ Ép kiểu ObjectId

    // 1️⃣ Phân loại ý định (intent)
    const nlpResult = await nlpManager.process("vi", message);
    const intent = nlpResult.intent;
    const answer = nlpResult.answer;

    // Nếu là câu hỏi đơn giản (chào, help, v.v...)
    if (answer) return res.json({ reply: answer });

    // 2️⃣ Lấy dữ liệu từ MongoDB tùy theo intent
    let contextData = null;

    switch (intent) {
      case "intent.report.summary":
        contextData = await getSummaryData(userId);
        break;
      case "intent.report.transactions":
        contextData = await getTransactionsData(userId);
        break;
      case "intent.report.expenses":
        contextData = await getExpensesData(userId);
        break;
      default:
        break;
    }

    console.log("📦 Dữ liệu MongoDB:", contextData);

    // 3️⃣ Xây dựng prompt thông minh cho Gemini
    const fullPrompt = contextData
      ? `Hệ thống SmartFinance đang gọi bạn, một AI nội bộ tên "SmartFinance Bot".

Bạn là AI nội bộ được cấp quyền truy cập cơ sở dữ liệu SmartFinance.
Dữ liệu sau đây KHÔNG phải dữ liệu thật của người dùng, mà là bản sao nội bộ để phân tích.

--- DỮ LIỆU HỆ THỐNG ---
${JSON.stringify(contextData, null, 2)}
-------------------------

Nhiệm vụ của bạn:
- Trả lời câu hỏi: "${message}"
- Dựa hoàn toàn vào dữ liệu trên.
- KHÔNG nói “bạn không có quyền truy cập”.
- KHÔNG sinh ví dụ giả hay hướng người dùng ra ứng dụng khác.
- Nếu dữ liệu trống hoặc lỗi, hãy trả lời: “Không có dữ liệu tương ứng trong hệ thống.”`
      : `Bạn là SmartFinance Bot, trợ lý tài chính AI thông minh. 
Hãy trả lời ngắn gọn, chính xác và bằng tiếng Việt.
Câu hỏi của người dùng: "${message}"`;

    // 4️⃣ Gọi Gemini AI
    const reply = await getGeminiReply(fullPrompt);

    // ✅ Trả kết quả cho frontend
    return res.json({ reply });
  } catch (error) {
    console.error("❌ Lỗi chatbot route:", error);
    res.status(500).json({ message: "Bot gặp lỗi." });
  }
});

// === CÁC HÀM TRUY VẤN DỮ LIỆU ===

// Báo cáo tổng hợp: chi tiêu + giao dịch gần nhất
async function getSummaryData(userId) {
  try {
    const expenseData = await getExpensesData(userId);
    const transactionData = await getTransactionsData(userId);
    return {
      expenseReport: expenseData.expenseReport,
      recentTransactions: transactionData.recentTransactions,
    };
  } catch {
    return { error: "Không thể truy vấn báo cáo." };
  }
}

// Lấy 3 giao dịch gần nhất
async function getTransactionsData(userId) {
  try {
    const transactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(3)
      .lean();

    if (!transactions.length)
      return { recentTransactions: "Không có giao dịch nào." };

    return {
      recentTransactions: transactions.map((tx) => ({
        category: tx.category,
        amount: tx.amount,
        desc: tx.desc,
        date: tx.date.toISOString().split("T")[0],
      })),
    };
  } catch (err) {
    console.error("⚠️ Lỗi getTransactionsData:", err);
    return { error: "Không thể truy vấn giao dịch." };
  }
}

// Tổng chi tiêu 7 ngày qua
async function getExpensesData(userId) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const expenses = await Transaction.find({
      userId,
      type: "chi",
      date: { $gte: sevenDaysAgo },
    }).lean();

    if (!expenses.length)
      return { expenseReport: "Không có chi tiêu nào trong 7 ngày qua." };

    const total = expenses.reduce((sum, tx) => sum + tx.amount, 0);
    return {
      expenseReport: `Tổng chi tiêu 7 ngày qua: ${total.toLocaleString()} VND.`,
      count: expenses.length,
    };
  } catch (err) {
    console.error("⚠️ Lỗi getExpensesData:", err);
    return { error: "Không thể tính toán chi tiêu." };
  }
}

export default router;
