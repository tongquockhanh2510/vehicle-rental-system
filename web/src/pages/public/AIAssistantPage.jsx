import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aiApi } from '../../api/modules/aiApi';

const SUGGESTED_MESSAGES = [
  'Tìm xe 7 chỗ ở Đà Lạt từ thứ 7 đến Chủ Nhật, giá dưới 1.5 triệu.',
  'Find me a 4-seat car in Nha Trang for this weekend.',
  'Kiếm xe gia đình đi Hội An từ sáng thứ 6 đến chiều Chủ Nhật.',
  'I need a pickup truck in Buôn Ma Thuột, budget under 1 million VND.',
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`ai-chat-message ${isUser ? 'ai-chat-user' : 'ai-chat-ai'}`}>
      {!isUser && (
        <div className="ai-chat-avatar">🤖</div>
      )}
      <div className="ai-chat-bubble">
        <p className="ai-chat-text">{msg.content}</p>

        {/* Vehicle cards */}
        {msg.vehicles && msg.vehicles.length > 0 && (
          <div className="ai-vehicle-results">
            {msg.vehicles.map((v, idx) => (
              <div key={idx} className="ai-vehicle-card">
                {v.imageUrl && (
                  <img src={v.imageUrl} alt={v.name} className="ai-vehicle-img" />
                )}
                <div className="ai-vehicle-info">
                  <h4 className="ai-vehicle-name">{v.name || `${v.vehicleType}`}</h4>
                  <div className="ai-vehicle-meta">
                    <span className="ai-vehicle-price">
                      💰 {Number(v.pricePerDay || 0).toLocaleString('vi-VN')} VND/ngày
                    </span>
                    {v.rating && (
                      <span className="ai-vehicle-rating">⭐ {v.rating}</span>
                    )}
                    {v.trustScore && (
                      <span className="ai-vehicle-trust">🛡️ {v.trustScore}/100</span>
                    )}
                  </div>
                  {v.location && (
                    <p className="ai-vehicle-location">📍 {v.location}</p>
                  )}
                  <Link
                    to={v.bookingUrl || `/vehicles/${v.id}`}
                    className="ai-book-btn"
                    id={`book-btn-${v.id || idx}`}
                  >
                    Xem & Đặt xe
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alternatives */}
        {msg.alternatives && msg.alternatives.length > 0 && (
          <div className="ai-alternatives">
            <p className="ai-alt-title">Gợi ý thay thế:</p>
            {msg.alternatives.map((alt, i) => (
              <div key={i} className="ai-alt-item">
                <span className="ai-alt-icon">
                  {alt.type === 'HIGHER_BUDGET' ? '💸' :
                   alt.type === 'DIFFERENT_TYPE' ? '🚗' :
                   alt.type === 'DIFFERENT_DATE' ? '📅' : '📍'}
                </span>
                <span className="ai-alt-text">{alt.message}</span>
              </div>
            ))}
          </div>
        )}

        <span className="ai-chat-time">
          {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {isUser && (
        <div className="ai-chat-avatar ai-user-avatar">👤</div>
      )}
    </div>
  );
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: 'Xin chào! Tôi là trợ lý AI đặt xe. Hãy mô tả loại xe bạn cần, địa điểm và thời gian — tôi sẽ tìm xe phù hợp nhất cho bạn! 🚗',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const userId = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user._id || user.id || 'anonymous';
    } catch { return 'anonymous'; }
  })();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (messageText = input) => {
    const text = messageText.trim();
    if (!text || sending) return;

    setInput('');
    setSending(true);

    const userMsg = { role: 'user', content: text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const data = await aiApi.chat(userId, text);
      const aiMsg = {
        role: 'ai',
        content: data.message || 'Tôi không tìm thấy xe phù hợp.',
        vehicles: data.vehicles || [],
        alternatives: data.alternatives || [],
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: 'Xin lỗi, hiện tại tôi không thể xử lý yêu cầu của bạn. Vui lòng thử lại sau.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-assistant-page">
      {/* Header */}
      <div className="ai-assistant-header">
        <div className="ai-header-left">
          <span className="ai-header-icon">🤖</span>
          <div>
            <h1 className="ai-header-title">AI Booking Assistant</h1>
            <p className="ai-header-sub">Tìm xe bằng ngôn ngữ tự nhiên · Tiếng Việt & English</p>
          </div>
        </div>
        <Link to="/vehicles" className="ai-browse-btn">Xem tất cả xe →</Link>
      </div>

      {/* Chat area */}
      <div className="ai-chat-area" id="ai-chat-area">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {sending && (
          <div className="ai-chat-message ai-chat-ai">
            <div className="ai-chat-avatar">🤖</div>
            <div className="ai-chat-bubble ai-typing-bubble">
              <span className="ai-typing-dot" />
              <span className="ai-typing-dot" />
              <span className="ai-typing-dot" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested messages */}
      {messages.length <= 1 && (
        <div className="ai-suggestions">
          <p className="ai-suggestions-label">Thử hỏi:</p>
          <div className="ai-suggestions-list">
            {SUGGESTED_MESSAGES.map((s, i) => (
              <button
                key={i}
                className="ai-suggestion-chip"
                onClick={() => handleSend(s)}
                id={`suggestion-${i}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="ai-chat-input-area">
        <textarea
          ref={inputRef}
          id="ai-chat-input"
          className="ai-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mô tả xe bạn cần... (VD: xe 7 chỗ ở Đà Lạt từ thứ 7 đến Chủ Nhật, giá 1.5 triệu)"
          rows={2}
          disabled={sending}
        />
        <button
          id="ai-chat-send-btn"
          className={`ai-chat-send-btn ${sending ? 'sending' : ''}`}
          onClick={() => handleSend()}
          disabled={sending || !input.trim()}
          title="Gửi"
        >
          {sending ? '⏳' : '➤'}
        </button>
      </div>
    </div>
  );
}
