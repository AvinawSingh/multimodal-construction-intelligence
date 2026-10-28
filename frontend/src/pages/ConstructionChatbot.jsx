import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Trash2,
  HardHat,
  Sparkles,
  Bot,
  User,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import ErrorAlert from '../components/ErrorAlert';

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    content: "Hello! I am your SkillWallet Construction AI Advisor. Ask me anything about concrete mix ratios, reinforcement steel thumb-rules, OSHA safety standards, waterproofing, structural crack remediation, or site quality inspection."
  }
];

const SUGGESTED_PROMPTS = [
  "What is the difference between M20 and M25 concrete mix?",
  "What is the thumb rule for steel rebar in RCC slab and columns?",
  "How to properly execute bathroom and terrace waterproofing?",
  "What are the mandatory precautions when pouring concrete in hot weather?"
];

export const ConstructionChatbot = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText = input) => {
    if (!messageText.trim() || loading) return;

    const userMsg = { role: 'user', content: messageText.trim() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Send chat request with history
      const formattedHistory = newHistory.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.sendChatMessage({
        message: userMsg.content,
        history: formattedHistory.slice(0, -1) // prior history
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
          is_demo_mode: res.is_demo_mode,
          sources: res.sources_or_references
        }
      ]);
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages(INITIAL_MESSAGES);
    setError(null);
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
            Construction Intelligence Chatbot
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            Interactive conversational AI for site engineers, quantity surveyors, and project managers.
          </p>
        </div>

        <button
          onClick={handleClear}
          className="btn btn-secondary"
          style={{ fontSize: '0.82rem', padding: '6px 12px' }}
        >
          <Trash2 size={14} />
          <span>Clear Chat</span>
        </button>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {/* Suggested Prompts Bar */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            style={{
              whiteSpace: 'nowrap',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '0.78rem',
              color: '#334155',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="chat-window" style={{ flex: 1, minHeight: '400px' }}>
        <div className="chat-messages">
          {messages.map((m, index) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  flexDirection: isUser ? 'row-reverse' : 'row'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isUser ? '#f97316' : '#1e293b',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {isUser ? <User size={16} /> : <HardHat size={16} />}
                </div>

                <div>
                  <div className={`chat-bubble ${isUser ? 'user' : 'assistant'}`}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                  </div>

                  {m.sources && m.sources.length > 0 && (
                    <div style={{ fontSize: '0.70rem', color: '#94a3b8', marginTop: '4px', marginLeft: '6px' }}>
                      Sources: {m.sources.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#1e293b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <HardHat size={16} />
              </div>
              <div className="chat-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="spinner spinner-orange" style={{ width: '16px', height: '16px' }} />
                <span style={{ fontSize: '0.84rem', color: '#64748b' }}>Consulting civil engineering models...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <form
          className="chat-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Type your construction question (e.g. concrete slump, rebar spacing, shuttering de-striking time)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !input.trim()}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConstructionChatbot;
