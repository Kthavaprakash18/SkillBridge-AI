import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Spinner } from '../components/UI';
import { CHATBOT_RESPONSES } from '../data/careers';

const SUGGESTED_QUESTIONS = [
  'What skills should I learn next?',
  'Am I ready for Data Analyst jobs?',
  'Which career suits my profile?',
  'How can I improve my job readiness?',
];

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

function getBotResponse(userMessage, analysis) {
  const msg = normalize(userMessage);

  for (const [key, fn] of Object.entries(CHATBOT_RESPONSES)) {
    if (key === 'default') continue;
    if (msg.includes(key) || key.split(' ').every(w => msg.includes(w))) {
      return fn(analysis);
    }
  }
  return CHATBOT_RESPONSES.default(analysis);
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        B
      </div>
      <div className="chat-bubble-bot flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-slate-400"
            style={{
              animation: `pulseSoft 1.2s ease ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          B
        </div>
      )}
      <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-bot'}>
        <p style={{ whiteSpace: 'pre-line' }}>{msg.content}</p>
      </div>
    </div>
  );
}

export default function BridgeBot({ onClose }) {
  const { student, analysis } = useApp();
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: 'bot',
      content: `Hi ${student?.name || 'there'} 👋\nI'm BridgeBot. Ask me anything about your career journey.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));

    const response = getBotResponse(text, analysis);
    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', content: response }]);
    setLoading(false);
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col animate-scale-in"
      style={{
        width: 340,
        height: 480,
        boxShadow: '0 20px 60px rgb(0 0 0 / 0.2)',
        borderRadius: 20,
        overflow: 'hidden',
        background: 'white',
        border: '1px solid #e2e8f0',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4"
        style={{ background: 'linear-gradient(135deg, #1e3a8a, #0e7490)' }}
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
          🤖
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">BridgeBot</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
            <span className="text-blue-200 text-xs">AI Career Assistant</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white text-xl transition-colors"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3 bg-slate-50">
        {messages.map(msg => <Message key={msg.id} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {messages.length < 3 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.slice(0, 2).map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="text-xs px-2.5 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100 font-medium"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className="flex gap-2">
          <input
            className="input flex-1 py-2 text-sm"
            placeholder="Ask anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && sendMessage(input)}
            disabled={loading}
          />
          <button
            className="btn-primary px-3 py-2 text-sm"
            onClick={() => !loading && sendMessage(input)}
            disabled={loading || !input.trim()}
          >
            {loading ? <Spinner size={14} color="white" /> : '→'}
          </button>
        </div>

        {/* Quick questions */}
        <div className="mt-2 flex flex-wrap gap-1">
          {SUGGESTED_QUESTIONS.slice(2).map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChatButton({ onClick, isOpen }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white text-xl shadow-lg transition-all"
      style={{
        background: isOpen
          ? '#dc2626'
          : 'linear-gradient(135deg, #2563eb, #06b6d4)',
        boxShadow: '0 4px 20px rgb(37 99 235 / 0.4)',
        transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
        transition: 'all 0.3s ease',
      }}
      title="Open BridgeBot AI Assistant"
    >
      {isOpen ? '×' : '🤖'}
    </button>
  );
}
