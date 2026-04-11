import React, { useState, useEffect, useRef } from 'react';
import '../styles/AIMentor.css';

const API = `${process.env.REACT_APP_API_URL}`;

const QUICK_PROMPTS = [
  "How do I join a live class?",
  "Where can I find study materials?",
  "How do mock tests work?",
  "Who are the faculty members?",
  "How can I track my progress?",
];

const AIMentor = ({ user, isFloating = false, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Welcome message
    setMessages([
      {
        role: 'mentor',
        content: `👋 Hello, ${user?.name || user?.email?.split('@')[0] || 'Student'}! I'm the **Samkalp Platform Guide**.\n\nI can help you navigate:\n• 📺 Live Classes\n• 📝 Practice Tests\n• 📚 Study Materials\n• ⚙️ General LMS usage\n\nHow can I help you today?`,
        id: Date.now()
      }
    ]);
  }, [user]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;

    const userMsg = { role: 'user', content: msgText, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/psychometric/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || 1,
          user_name: user?.name || user?.email?.split('@')[0] || 'Student',
          message: msgText,
        }),
      });

      if (!res.ok) throw new Error('Mentor failed to respond');
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'mentor', content: data.reply, id: Date.now() }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'mentor',
        content: `⚠️ I'm having trouble connecting right now. Please try again.`,
        id: Date.now(),
        isError: true
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (text) => {
    // Convert markdown-ish formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className={`mentor-container ${isFloating ? 'floating-mode' : ''}`}>
      {/* Sidebar info - Hidden in floating mode or made compact */}
      {!isFloating && (
        <div className="mentor-sidebar">
          <div className="mentor-avatar-card">
            <div className="mentor-avatar">🤖</div>
            <h3>Samkalp Platform Guide</h3>
            <div className={`mentor-status status-active`}>
              <span className="status-dot"></span>
              Ready to Help
            </div>
          </div>

          <div className="mentor-profile-badge">
            <h4>💡 Platform Tips</h4>
            <p>I can assist you with finding documents, understanding course structures, or debugging technical issues.</p>
          </div>

          <div className="mentor-quick-prompts">
            <h4>Quick Questions</h4>
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} className="quick-prompt-btn" onClick={() => sendMessage(p)} disabled={loading}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="mentor-chat-area">
        <div className="mentor-chat-header">
          <div className="mentor-header-left">
            <div className="mentor-header-avatar">🤖</div>
            <div>
              <h3>Platform Guide AI</h3>
              <span className="mentor-online">● Online</span>
            </div>
          </div>
          <div className="mentor-header-actions">
            <button className="mentor-clear-btn" onClick={() => setMessages([{
              role: 'mentor',
              content: `New conversation started! How can I help you today, ${user?.name || 'Student'}?`,
              id: Date.now()

            }])}>
              🗑️
            </button>
            {isFloating && (
              <button className="mentor-close-btn" onClick={onClose}>✕</button>
            )}
          </div>
        </div>

        <div className="mentor-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`mentor-message ${msg.role === 'user' ? 'msg-user' : 'msg-mentor'} ${msg.isError ? 'msg-error' : ''}`}>
              {msg.role === 'mentor' && <div className="msg-avatar mentor-msg-avatar">🤖</div>}
              <div className="msg-bubble">
                <div
                  className="msg-content"
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
              </div>
              {msg.role === 'user' && (
                <div className="msg-avatar user-msg-avatar">
                  {(user?.name || user?.email || 'S').substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="mentor-message msg-mentor">
              <div className="msg-avatar mentor-msg-avatar">🤖</div>
              <div className="msg-bubble">
                <div className="mentor-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips for Floating Mode */}
        {isFloating && messages.length <= 1 && (
          <div className="mentor-suggestions-floating">
            {QUICK_PROMPTS.slice(0, 4).map((p, i) => (
              <button key={i} className="suggestion-chip" onClick={() => sendMessage(p)}>
                {p}
              </button>
            ))}
          </div>
        )}

        <div className="mentor-input-area">
          <textarea
            ref={inputRef}
            className="mentor-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your mentor anything..."
            rows={1}
            disabled={loading}
          />
          <button
            className={`mentor-send-btn ${loading ? 'btn-loading' : ''}`}
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            {loading ? '⏳' : '➤'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIMentor;
