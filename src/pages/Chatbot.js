import React, { useState, useEffect, useRef } from 'react';
import NavbarApp from '../components/NavbarApp';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './Chatbot.css'; // Sẽ tạo file này ở bước 2.2

const Chatbot = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]); // Lưu lịch sử chat
  const [input, setInput] = useState(''); // Tin nhắn đang gõ
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null); // Dùng để tự động cuộn

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Gọi API backend /api/chat
      const res = await axios.post('http://localhost:5000/api/chat', {
        prompt: input,
      });

      const modelMessage = { role: 'model', content: res.data.response };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Lỗi khi gọi API chat:', error);
      const errorMessage = { role: 'model', content: t('status.error_ai') };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavbarApp />
      <div className="page-content chatbot-page-with-sidebar">
        <div className="chatbot-container">
          <div className="chat-window">
            <div className="messages-list">
              {/* Tin nhắn chào mừng */}
              <div className="message model">
                <p>{t('chatbot.welcome')}</p>
              </div>

              {/* Lịch sử chat */}
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.role}`}>
                  <p>{msg.content}</p>
                </div>
              ))}

              {/* Hiển thị "Đang tải..." */}
              {isLoading && (
                <div className="message model">
                  <p className="loading-dots">
                    <span>.</span><span>.</span><span>.</span>
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSubmit} className="chat-input-form">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chatbot.placeholder')}
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading}>
                {t('chatbot.send')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;