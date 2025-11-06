import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    const { message } = req.body; // Lấy message client gửi lên

    // ✅ Gửi đúng kiểu POST và truyền message sang n8n
    const response = await axios.post(
      "https://qdwn29.app.n8n.cloud/webhook/chat", // Thay bằng URL webhook Production hoặc Test trong n8n
      { message }, // Dùng biến message thật, không hardcode "Xin chào AI"
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ Kiểm tra và trả về dữ liệu nhận từ n8n
    res.json({
      reply: response.data, // có thể đổi tuỳ vào output n8n trả về
    });
  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);
    res.status(500).json({ error: "AI error" });
  }
});

export default router;
