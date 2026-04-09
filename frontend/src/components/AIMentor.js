import React, { useState, useEffect, useRef } from 'react';
import '../styles/AIMentor.css';

const API = 'http://localhost:8000';

const QUICK_PROMPTS = [
  "What are my biggest strengths for UPSC?",
  "How should I improve my weak areas?",
  "Create a study plan based on my profile",
  "How do I manage exam stress better?",
  "Which optional subject suits my personality?",
  "How many hours should I study daily?",
  "What books should I read for GS Paper 1?",
  "How can I improve my answer writing?",
];

const AIMentor = ({ user, isFloating = false, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportContext, setReportContext] = useState('');
  const [hasReport, setHasReport] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Fetch user's psychometric report for context
    if (user?.id) {
      fetch(`${API}/psychometric/report/${user.id}`)
        .then(r => r.json())
        .then(data => {
          if (data.report) {
            setHasReport(true);
            const r = data.report;
            const ctx = `
Student: ${data.user_name}
Overall Profile: ${r.overall_profile}
UPSC Readiness: ${r.upsc_readiness?.level} (${r.upsc_readiness?.score}/100)
Strengths: ${(r.strengths || []).join(', ')}
Areas for Improvement: ${(r.areas_for_improvement || []).join(', ')}
Learning Style: ${r.scores?.learning_style?.style}
Motivation: ${r.scores?.motivation?.rating}
Stress Management: ${r.scores?.stress_management?.rating}
            `.trim();
            setReportContext(ctx);
          }
        })
        .catch(() => {});
    }

    // Welcome message
    setMessages([
      {
        role: 'mentor',
        content: `👋 Hello, ${user?.name || user?.email?.split('@')[0] || 'Student'}! I'm **Samkalp Mentor AI**, your personal UPSC guide.\n\nI can help you with:\n• 📊 Understanding your psychometric profile\n• 📚 UPSC preparation strategies\n• 🧠 Personalized study advice\n• 💪 Motivation & goal setting\n\nWhat would you like to know today?`,
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
          report_context: reportContext || null,
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
            <div className="mentor-avatar">🎓</div>
            <h3>Samkalp Mentor AI</h3>
            <div className={`mentor-status ${hasReport ? 'status-active' : 'status-default'}`}>
              <span className="status-dot"></span>
              {hasReport ? 'Profile Loaded' : 'Ready to Help'}
            </div>
          </div>

          {hasReport && (
            <div className="mentor-profile-badge">
              <h4>📊 Profile Active</h4>
              <p>Your psychometric report has been loaded. I'll give personalized advice based on your profile.</p>
            </div>
          )}

          {!hasReport && (
            <div className="mentor-no-profile">
              <h4>💡 Tip</h4>
              <p>Complete the <strong>Psychometric Assessment</strong> first for more personalized mentoring!</p>
            </div>
          )}

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
            <div className="mentor-header-avatar">🎓</div>
            <div>
              <h3>Samkalp Mentor AI</h3>
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
              {msg.role === 'mentor' && <div className="msg-avatar mentor-msg-avatar">🎓</div>}
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
              <div className="msg-avatar mentor-msg-avatar">🎓</div>
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
