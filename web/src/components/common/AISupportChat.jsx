import React, { useEffect, useMemo, useState } from 'react';
import { Bot, MessageSquare, SendHorizontal, Trash2, User2 } from 'lucide-react';
import { aiAgentApi } from '../../api';

const MAX_HISTORY = 30;

function makeStorageKey(userId) {
  return `rentcar_ai_chat_${userId || 'guest'}`;
}

function createMessage(role, content) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

function readHistory(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AISupportChat({ userId, context = {} }) {
  const storageKey = useMemo(() => makeStorageKey(userId), [userId]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const history = readHistory(storageKey);
    if (history.length) {
      setMessages(history);
      return;
    }
    setMessages([
      createMessage(
        'assistant',
        'Xin chào, mình là AI hỗ trợ thuê xe. Bạn cần gợi ý xe, ngân sách hay quy trình thanh toán?'
      )
    ]);
  }, [storageKey]);

  useEffect(() => {
    if (!messages.length) return;
    localStorage.setItem(storageKey, JSON.stringify(messages.slice(-MAX_HISTORY)));
  }, [messages, storageKey]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || loading) return;

    const userMessage = createMessage('user', content);
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const response = await aiAgentApi.chatSupport({
        message: content,
        context
      });
      const reply =
        response?.data?.reply ||
        'Mình đã nhận câu hỏi. Bạn có thể cung cấp thêm nhu cầu để mình gợi ý chính xác hơn.';
      setMessages((prev) => [...prev, createMessage('assistant', reply)]);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Không thể kết nối AI lúc này.'
      );
      setMessages((prev) => [
        ...prev,
        createMessage(
          'assistant',
          'AI đang bận. Bạn thử lại sau vài giây hoặc dùng mục gợi ý xe nhanh phía trên.'
        )
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-cyan-300/20 bg-slate-950/45 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
          <Bot className="h-3.5 w-3.5" />
          Chat hỗ trợ AI
        </p>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem(storageKey);
            setMessages([
              createMessage(
                'assistant',
                'Lịch sử chat đã được làm mới. Bạn muốn mình hỗ trợ gì tiếp theo?'
              )
            ]);
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2 py-1 text-[11px] text-slate-300 transition hover:bg-white/10"
        >
          <Trash2 className="h-3 w-3" />
          Xóa lịch sử
        </button>
      </div>

      <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/65 p-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-lg px-2.5 py-2 text-xs ${
              message.role === 'assistant'
                ? 'border border-cyan-300/25 bg-cyan-500/10 text-cyan-50'
                : 'border border-white/15 bg-slate-800 text-slate-100'
            }`}
          >
            <p className="mb-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] opacity-80">
              {message.role === 'assistant' ? (
                <>
                  <Bot className="h-3 w-3" /> AI
                </>
              ) : (
                <>
                  <User2 className="h-3 w-3" /> Bạn
                </>
              )}
            </p>
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Hỏi AI về xe phù hợp, ngân sách, quy trình..."
          className="flex-1 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="inline-flex items-center gap-1 rounded-xl bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {loading ? (
            <>
              <MessageSquare className="h-3.5 w-3.5" /> Đang trả lời
            </>
          ) : (
            <>
              <SendHorizontal className="h-3.5 w-3.5" /> Gửi
            </>
          )}
        </button>
      </div>

      {error ? <p className="mt-1 text-xs text-rose-200">{error}</p> : null}
    </div>
  );
}
