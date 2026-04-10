import React, { useState, useRef, useEffect } from 'react';
import '../styles/AIDoubtSolver.css';

const API = 'http://localhost:8000';

const SUGGESTED_DOUBTS = [
  "Explain the Basic Structure Doctrine.",
  "What is the difference between Repo Rate and Reverse Repo Rate?",
  "How should I approach Ethics case studies?",
  "Can you summarize the causes of the 1857 Revolt?"
];

const WELCOME_MESSAGE = {
  role: 'ai',
  content: `👋 Hello! I am **Samkalp Intelligence**, your elite UPSC & IAS Doubt Solver.\n\nWhether you have a quick conceptual question about Polity or need a detailed breakdown of an Economics topic, I'm here to help. What's on your mind?`
};

const AIDoubtSolver = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchHistory();
    setMessages([{ ...WELCOME_MESSAGE, content: WELCOME_MESSAGE.content.replace('Hello!', `Hello ${user?.name || 'Aspirant'}!`) }]);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/api/doubt-solver/history/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("History fail:", err);
    }
  };

  const loadChat = async (chatId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/doubt-solver/chat/${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setCurrentChatId(data.id);
      }
    } catch (err) {
      console.error("Load fail:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (e, chatId) => {
    e.stopPropagation(); // Prevent loading the chat when user intended to delete it
    if (!window.confirm("Are you sure you want to delete this doubt session?")) return;

    try {
      const res = await fetch(`${API}/api/doubt-solver/chat/${chatId}?user_id=${user.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (currentChatId === chatId) clearChat();
        fetchHistory();
      }
    } catch (err) {
      console.error("Delete fail:", err);
    }
  };

  const clearChat = () => {
    setMessages([{ ...WELCOME_MESSAGE, content: WELCOME_MESSAGE.content.replace('Hello!', `Hello ${user?.name || 'Aspirant'}!`) }]);
    setCurrentChatId(null);
  };

  const formatText = (text) => {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/\n/g, '<br />');
    return formatted;
  };

  const handleSend = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text || loading) return;

    // Filter out initial welcome message from the thread so it doesn't mess with the title
    const userPrompts = messages.filter(m => m.role === 'user');
    const newMsgs = [...userPrompts, { role: 'user', content: text }];

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/doubt-solver/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          chat_id: currentChatId,
          messages: newMsgs,
          user_name: user?.name || 'Aspirant',
        })
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
      setCurrentChatId(data.chat_id);
      fetchHistory(); // Refresh sidebar
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "⚠️ I encountered an error answering that. Please try again." }]);
    } finally {
      setLoading(false);
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
    <div className="doubt-solver-dashboard">
      <div className="doubt-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>AI Doubt Solver</h1>
          <p>Instant, precise answers for your UPSC preparation.</p>
        </div>
        <button
          onClick={clearChat}
          className="clear-chat-btn"
        >
          ➕ New Chat
        </button>
      </div>

      <div className="doubt-main-layout">
        {/* Sidebar */}
        <div className="doubt-sidebar">
          <div className="sidebar-header">Recent Doubts</div>
          <div className="history-list">
            {history.length === 0 && <div className="empty-history">No past chats</div>}
            {history.map(chat => (
              <div
                key={chat.id}
                className={`history-item ${currentChatId === chat.id ? 'active' : ''}`}
                onClick={() => loadChat(chat.id)}
              >
                <div className="item-content">
                  <span className="icon">💬</span>
                  <span className="title">{chat.title}</span>
                </div>
                <button
                  className="item-delete-btn"
                  onClick={(e) => deleteChat(e, chat.id)}
                  title="Delete chat"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Container */}
        <div className="doubt-chat-container">
          <div className="doubt-chat-box">
            <div className="doubt-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`doubt-message-wrapper ${msg.role === 'ai' ? 'ai' : 'user'}`}>
                  <div className="doubt-avatar">
                    {msg.role === 'ai' ? '🤖' : '👤'}
                  </div>
                  <div className="doubt-bubble">
                    <div dangerouslySetInnerHTML={{ __html: formatText(msg.content) }} />
                  </div>
                </div>
              ))}

              {loading && (
                <div className="doubt-message-wrapper ai">
                  <div className="doubt-avatar">🤖</div>
                  <div className="doubt-bubble typing-bubble">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="doubt-suggestions">
              <p>Try asking :</p>
              <div className="suggestions-grid">
                {SUGGESTED_DOUBTS.map((q, i) => (
                  <button key={i} className="suggestion-btn" onClick={() => handleSend(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="doubt-input-area">
              <textarea
                ref={inputRef}
                className="doubt-textarea"
                placeholder="Ask any UPSC or academic doubt here... (Press Enter to send)"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                rows={1}
              />
              <button
                className={`doubt-send-btn ${loading || !input.trim() ? 'disabled' : ''}`}
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
              >
                Ask AI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDoubtSolver;
