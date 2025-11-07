// Tệp: src/components/Chatbot.js
import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Thêm tin nhắn chào mừng khi mở chat
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          sender: "bot",
          text: "Chào bạn! Tôi là trợ lý tài chính. Bạn cần giúp gì?",
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Lấy token từ localStorage để xác thực
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/chatbot/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Gửi token để server biết bạn là ai
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Lỗi mạng hoặc server");
      }

      const data = await response.json();
      const botMessage = { sender: "bot", text: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      const errorMessage = {
        sender: "bot",
        text: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <p>SmartFinance Bot</p>
            <button onClick={toggleChat} className="close-btn">
              ×
            </button>
          </div>
          <div className="chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                <p style={{ whiteSpace: "pre-wrap" }}>{msg.text}</p>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message bot">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="chat-input-form" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              disabled={isLoading}
              autoFocus
            />
            <button type="submit" disabled={isLoading}>
              Gửi
            </button>
          </form>
        </div>
      )}
      <button onClick={toggleChat} className="chat-toggle-button">
        🤖
      </button>
    </div>
  );
};

export default Chatbot;
