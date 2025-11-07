// Tệp: server/services/nlpManager.js
import { NlpManager } from "node-nlp";
import fs from "fs";

const modelPath = "./services/chatbot-model.nlp";
const manager = new NlpManager({ languages: ["vi"], forceNER: true });

// === HUẤN LUYỆN AI PHÂN LOẠI ===

// Chào hỏi
manager.addDocument("vi", "chào", "intent.greeting");
manager.addDocument("vi", "chào bạn", "intent.greeting");
manager.addDocument("vi", "hi", "intent.greeting");

// Giúp đỡ
manager.addDocument("vi", "giúp", "intent.help");
manager.addDocument("vi", "bạn làm được gì", "intent.help");
manager.addDocument("vi", "menu", "intent.help");

// ⭐️ Báo cáo Tổng quan (Ý định cá nhân)
manager.addDocument("vi", "báo cáo", "intent.report.summary");
manager.addDocument("vi", "báo cáo tổng chi tiêu", "intent.report.summary");
manager.addDocument("vi", "tình hình tài chính", "intent.report.summary");

// ⭐️ Giao dịch (Ý định cá nhân)
manager.addDocument("vi", "giao dịch", "intent.report.transactions");
manager.addDocument("vi", "3 giao dịch mới nhất", "intent.report.transactions");
manager.addDocument(
  "vi",
  "các giao dịch gần đây",
  "intent.report.transactions"
);

// ⭐️ Chi tiêu (Ý định cá nhân)
manager.addDocument("vi", "chi tiêu", "intent.report.expenses");
manager.addDocument("vi", "tổng chi tiêu", "intent.report.expenses");
manager.addDocument("vi", "dạo này tiêu bao nhiêu", "intent.report.expenses");

// === CÁC CÂU TRẢ LỜI ĐƠN GIẢN ===
manager.addAnswer(
  "vi",
  "intent.greeting",
  "Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?"
);
manager.addAnswer(
  "vi",
  "intent.help",
  'Tôi có thể: \n1. Báo cáo tài chính cá nhân (ví dụ: gõ "báo cáo") \n2. Trả lời các câu hỏi về tài chính (ví dụ: "lạm phát là gì?")'
);

// 3. HUẤN LUYỆN VÀ LƯU MODEL
(async () => {
  if (fs.existsSync(modelPath)) {
    console.log("🤖 Đã tải model AI phân loại...");
    manager.load(modelPath);
  } else {
    console.log("🤖 Đang huấn luyện model AI phân loại...");
    await manager.train();
    manager.save(modelPath);
    console.log("✅ Huấn luyện AI phân loại hoàn tất.");
  }
})();

export default manager;
