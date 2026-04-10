/**
 * VideoAvatarCounselling.jsx
 *
 * AI Avatar counselling session for IAS/UPSC psychometric report analysis.
 * Uses Beyond Presence (bey.dev) for photorealistic avatar + STT/TTS.
 * Falls back to browser SpeechSynthesis + a static avatar image when
 * the Beyond Presence SDK is not yet wired in (demo / preview mode).
 *
 * Props:
 *   report          — psychometric analysis object (see shape below)
 *   candidateName   — candidate's display name
 *   onEndSession    — callback when user ends the session
 *   beyCallLink     — (optional) bey.chat iframe URL; enables live avatar
 *   avatarImageUrl  — (optional) fallback avatar image path
 *
 * Report shape expected:
 * {
 *   upsc_readiness: { score: 72, description: "…" },
 *   strengths: ["…", "…"],
 *   areas_for_improvement: ["…"],
 *   personality_traits: ["…"],
 *   personalized_recommendations: [{ title, description }],
 *   candidate_name: "…"
 * }
 */

import React, {
  useState, useEffect, useRef, useCallback, useMemo
} from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send } from 'lucide-react';
import { Room, RoomEvent, Track } from 'livekit-client';
import aiAvatarImg from '../images/ai_video_avatar.png';
import '../styles/VideoAvatarCounselling.css';

// ── Helpers ────────────────────────────────────────────────────────────────

const fmt = (date) =>
  date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

const elapsed = (startMs) => {
  const s = Math.floor((Date.now() - startMs) / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

// Build avatar's opening script from the report
const buildScript = (report, name) => {
  const firstName = (name || report?.candidate_name || 'there').split(' ')[0];
  if (!report) return [
    `Hello ${firstName}! I'm Aryan, your UPSC preparation mentor. How can I help you today?`
  ];
  return [
    `Namaste ${firstName}! I'm Aryan, your dedicated AI mentor for IAS preparation. I've reviewed your psychometric analysis in detail. What would you like to discuss first?`
  ];
};

// Static IAS-focused quick-questions
const QUICK_QUESTIONS = [
  "What does my readiness score mean?",
  "How should I prioritise my UPSC subjects?",
  "How do I improve my answer writing?",
  "What study schedule suits my personality profile?",
  "How do I stay motivated during preparation?",
  "Which optional subject would suit my strengths?",
];

// ── Sub-components ─────────────────────────────────────────────────────────

const WaveForm = () => (
  <span className="vac-wave" aria-hidden="true">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <span key={i} className="vac-wave-bar" style={{ height: `${[35, 75, 55, 90, 45, 65][i - 1]}%` }} />
    ))}
  </span>
);

const ScoreRing = ({ score }) => {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg className="vac-ring-svg" width="72" height="72" viewBox="0 0 72 72">
      <circle className="vac-ring-track" cx="36" cy="36" r={r} />
      <circle
        className="vac-ring-fill"
        cx="36" cy="36" r={r}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 36 36)"
      />
      <text x="36" y="40" textAnchor="middle"
        style={{ fill: '#d4a853', fontSize: '15px', fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>
        {score}
      </text>
    </svg>
  );
};

const TypingDots = () => (
  <div className="vac-msg vac-msg--ai">
    <span className="vac-msg-who">Aryan</span>
    <div className="vac-msg-bubble">
      <div className="vac-typing">
        <span /><span /><span />
      </div>
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────

const VideoAvatarCounselling = ({
  report,
  candidateName,
  onEndSession,
  beyCallLink = null,
  avatarImageUrl = null,
}) => {

  // ── State ────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('connecting'); // connecting | live | ended
  const [activeTab, setActiveTab] = useState('chat');       // chat | report
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [camActive, setCamActive] = useState(false);
  const [scriptIdx, setScriptIdx] = useState(0);
  const [activeLine, setActiveLine] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [showQuickQ, setShowQuickQ] = useState(false);
  const [sessionStart] = useState(Date.now());
  const [sessionTime, setSessionTime] = useState('00:00');

  // LIVEKIT / BEYOND PRESENCE State
  const [activeBeyLink, setActiveBeyLink] = useState(beyCallLink);
  const [iframeReady, setIframeReady] = useState(false);
  const [isLivekitConnected, setLivekitConnected] = useState(false);

  const roomRef = useRef(null);
  const avatarVidRef = useRef(null);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const userVideoRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const speakTimers = useRef([]);

  const script = useMemo(
    () => buildScript(report, candidateName),
    [report, candidateName]
  );

  // ── Session timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'live') return;
    const id = setInterval(() => setSessionTime(elapsed(sessionStart)), 1000);
    return () => clearInterval(id);
  }, [phase, sessionStart]);

  // ── Connect delay ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setPhase('live'), 6800); // Extra delay so video loads before audio starts
    return () => clearTimeout(t);
  }, []);

  // ── Auto-scroll messages ─────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // ── Beyond Presence Init ─────────────────────────────────────────────────
  useEffect(() => {
    const initBey = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/beyond-presence/init-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportData: report || {}, candidateName: candidateName || 'Candidate' })
        });
        if (!res.ok) throw new Error("Bey API missing or failed");

        const data = await res.json();
        if (data.beyCallLink) {
          setActiveBeyLink(data.beyCallLink);
          setLivekitConnected(true);
          // The iframe onLoad fires when their HTML loads (very fast),
          // but the actual WebRTC video stream takes 10-15s to start streaming.
          // We use a timed gate so user sees the loader until the video is ACTUALLY rendering.
          setTimeout(() => setIframeReady(true), 13000);
        }
      } catch (err) {
        console.warn("Beyond Presence not configured. Falling back to Local Mode:", err.message);
      }
    };
    initBey();
  }, [report, candidateName]);

  // ── Speech synthesis helper ───────────────────────────────────────────────
  // NOTE: When Beyond Presence is active, it handles TTS natively via Cartesia.
  // We skip browser TTS entirely to avoid double-audio.
  const speak = useCallback((text, onEnd) => {
    if (activeBeyLink) {
      // Beyond Presence is active - silent pass-through
      if (onEnd) setTimeout(onEnd, 500);
      return;
    }
    if (!('speechSynthesis' in window)) {
      if (onEnd) setTimeout(onEnd, Math.max(3500, text.length * 68));
      return;
    }
    window.speechSynthesis.cancel();

    let voices = window.speechSynthesis.getVoices();

    const play = () => {
      const utt = new SpeechSynthesisUtterance(text);
      voices = window.speechSynthesis.getVoices();

      // Prefer male Indian voice for Arjun mentor persona
      const preferred = voices.find(v => v.lang.startsWith('en-IN') && v.name.toLowerCase().includes('male'))
        || voices.find(v => v.lang.startsWith('en-IN'))
        || voices.find(v => v.name.toLowerCase().includes('male'))
        || voices.find(v => v.lang.startsWith('en'))
        || voices[0];

      if (preferred) utt.voice = preferred;
      utt.rate = 0.88;
      utt.pitch = 0.9;  // Lower pitch = more masculine

      // Hook up the clear end event
      let hasEnded = false;
      const endFn = () => {
        if (!hasEnded && onEnd) {
          hasEnded = true;
          onEnd();
        }
      };

      utt.onend = endFn;
      // Fallback timer just in case browser TTS engine stalls completely
      setTimeout(endFn, Math.max(12000, text.length * 90));

      window.speechSynthesis.speak(utt);
    };

    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = play;
    } else {
      play();
    }
  }, []);

  // ── Drive avatar opening script ───────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'live') return;
    if (scriptIdx >= script.length) return;

    const line = script[scriptIdx];
    setIsSpeaking(true);
    setActiveLine(line);

    // Add as chat message on first delivery
    setMessages(prev => {
      const alreadyAdded = prev.some(m => m.text === line && m.role === 'ai');
      if (alreadyAdded) return prev;
      return [...prev, { id: Date.now(), role: 'ai', text: line, time: fmt(new Date()) }];
    });

    speak(line, () => {
      setIsSpeaking(false);
      setActiveLine('');
      setScriptIdx(i => i + 1);
    });

    return () => {
      speakTimers.current.forEach(clearTimeout);
      window.speechSynthesis.cancel();
    };
  }, [phase, scriptIdx]); // eslint-disable-line

  // ── Microphone / Speech Recognition ──────────────────────────────────────
  useEffect(() => {
    let rec = null;
    let activeStream = null;

    if (micActive) {
      // Secure hardware mic latching to prevent silent blocked contexts
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          activeStream = stream;

          const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (!SR) {
            setUserTranscript('Speech recognition not supported in your browser. (Try Chrome)');
            return;
          }

          rec = new SR();
          rec.continuous = true;
          rec.interimResults = true;
          // Dynamically adapt to user's OS locale instead of forcing en-IN
          rec.lang = navigator.language || 'en-US';

          rec.onresult = (e) => {
            let fullTranscript = '';
            for (let i = 0; i < e.results.length; i++) {
              fullTranscript += e.results[i][0].transcript;
            }
            setUserTranscript(fullTranscript);
          };

          rec.onerror = (e) => {
            console.warn('Speech engine:', e.error);
          };

          rec.onend = () => {
            if (micActive && rec) {
              try { rec.start(); } catch (err) { }
            }
          };

          try {
            rec.start();
            recognitionRef.current = rec;
          } catch (err) {
            console.error(err);
          }
        })
        .catch(err => {
          console.error("Hardware mic blocked:", err);
          setUserTranscript("Microphone permission denied by browser.");
        });

    } else {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
      setUserTranscript('');
    }

    return () => {
      if (rec) {
        rec.onend = null;
        rec.stop();
      }
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [micActive]);


  // ── Webcam ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (camActive) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (userVideoRef.current) userVideoRef.current.srcObject = stream;
        })
        .catch(console.error);
    } else {
      const el = userVideoRef.current;
      if (el?.srcObject) {
        el.srcObject.getTracks().forEach(t => t.stop());
        el.srcObject = null;
      }
    }
  }, [camActive]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
      const el = userVideoRef.current;
      if (el?.srcObject) el.srcObject.getTracks().forEach(t => t.stop());
      speakTimers.current.forEach(clearTimeout);
    };
  }, []);

  // ── AI reply (simple rule-based + report-grounded) ───────────────────────
  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(async (text) => {
    const trimmed = (text || inputText).trim();
    if (!trimmed || isThinking) return;

    // Stop ongoing speech
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setActiveLine('');

    const userMsg = { id: Date.now(), role: 'you', text: trimmed, time: fmt(new Date()) };
    const currentMessages = [...messages, userMsg];
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const response = await fetch('http://localhost:8000/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages.map(m => ({ role: m.role, text: m.text })),
          reportData: report,
          candidateName: candidateName
        })
      });

      if (!response.ok) throw new Error("Chat sequence failed");
      const data = await response.json();
      const reply = data.reply;
      console.log(`[AI Mentor] Response from: ${data.model_used || 'unknown'}`);

      const aiMsg = { id: Date.now() + 1, role: 'ai', text: reply, time: fmt(new Date()) };
      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);

      // Speak the reply
      setIsSpeaking(true);
      setActiveLine(reply);
      speak(reply, () => {
        setIsSpeaking(false);
        setActiveLine('');
      });
    } catch (err) {
      console.error("AI Chat Error:", err);
      const errorMsg = "I'm having a bit of trouble connecting right now. Could you please repeat that?";
      setMessages(prev => [...prev, { id: Date.now(), role: 'ai', text: errorMsg, time: fmt(new Date()) }]);
      setIsThinking(false);
    }
  }, [inputText, isThinking, messages, report, candidateName, speak]);

  // ── Auto-submit completed speech ─────────────────────────────────────────
  const lastUserTranscript = useRef('');
  useEffect(() => {
    // Wait for the user to stop talking briefly, then auto-submit the captured text
    if (micActive && userTranscript && userTranscript !== lastUserTranscript.current) {
      lastUserTranscript.current = userTranscript;

      const speakerTimeout = setTimeout(() => {
        if (userTranscript.trim()) {
          handleSend(userTranscript);
          setMicActive(false); // Turn off mic so the AI doesn't hear its own answer
          lastUserTranscript.current = '';
        }
      }, 2000); // 2 second pause dictates end of question

      return () => clearTimeout(speakerTimeout);
    }
  }, [userTranscript, micActive, handleSend]);

  // Textarea auto-resize + Enter to send
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEnd = () => {
    window.speechSynthesis?.cancel();
    recognitionRef.current?.stop();
    setPhase('ended');
    onEndSession?.();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const avatarBgStyle = avatarImageUrl
    ? { backgroundImage: `url(${avatarImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center top' }
    : { background: 'linear-gradient(180deg, #141b28 0%, #0e1420 100%)' };

  return (
    <div className="vac-container">
      <div className="vac-layout">

        {/* ── Header ── */}
        <header className="vac-header">
          <div className="vac-logo">
            <div className="vac-logo-mark">IAS</div>
            <span className="vac-logo-text">Samkalp <span>Mentor</span></span>
          </div>
          <div className="vac-header-meta">
            {phase === 'live' && (
              <>
                <span className="vac-badge vac-badge--live">Live Session</span>
                <span className="vac-session-timer">{sessionTime}</span>
              </>
            )}
          </div>
        </header>

        {/* ── Avatar Stage ── */}
        <main className="vac-stage">
          <div className={`vac-avatar-container ${isSpeaking ? 'is-speaking' : 'is-idle'}`} ref={avatarVidRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            {/* Fallback dark background if Beyond Presence isn't connected */}
            {!activeBeyLink ? (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #141b28 0%, #0e1420 100%)' }} />
            ) : (
              <>
                {/* Loading overlay — shown until the iframe video is fully loaded */}
                {!iframeReady && (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 10,
                    background: 'linear-gradient(180deg, #141b28 0%, #080b10 100%)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: '1rem',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        border: '3px solid rgba(212,168,83,0.2)',
                        borderTop: '3px solid #d4a853',
                        animation: 'spin 1s linear infinite',
                      }} />
                      <span style={{ color: '#d4a853', fontSize: '0.85rem', fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }}>Connecting to Aryan...</span>
                    </div>
                  </div>
                )}
                <iframe
                  src={activeBeyLink}
                  allow="camera; microphone; autoplay"
                  className="vac-bey-iframe"
                  onLoad={() => setIframeReady(true)}
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    border: 'none', zIndex: 3,
                    // Keep iframe mounted but invisible until video is ready
                    opacity: iframeReady ? 1 : 0,
                    transition: 'opacity 0.8s ease',
                  }}
                  title="Beyond Presence avatar session"
                />
                {/* Top mask — hides "Talk to Aryan Mentor" heading */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: '18%',
                  background: 'linear-gradient(to bottom, #080b10 60%, transparent)',
                  zIndex: 4,
                  pointerEvents: 'none',
                }} />
                {/* Bottom mask — hides Start Conversation button + Terms text */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: '32%',
                  background: 'linear-gradient(to top, #080b10 55%, transparent)',
                  zIndex: 4,
                  pointerEvents: 'none',
                }} />
              </>
            )}
          </div>

          <div className="vac-stage-vignette" />
          <div className="vac-stage-scrim" />

          {/* Glow aura */}
          {isSpeaking && <div className="vac-avatar-aura" aria-hidden="true" />}

          {/* Status bar */}
          {phase === 'live' && (
            <div className="vac-status">
              <div className={`vac-status-dot ${!isSpeaking && micActive ? 'is-listening' : ''}`} />
              {isSpeaking ? 'Aryan is speaking' : micActive ? 'Listening…' : 'Aryan is ready'}
            </div>
          )}

          {/* PiP user camera */}
          <div className="vac-pip">
            {camActive
              ? <video ref={userVideoRef} autoPlay playsInline muted />
              : (
                <div className="vac-pip-off">
                  <VideoOff size={24} />
                  <span>Camera off</span>
                </div>
              )
            }
          </div>



          {/* Controls */}
          <div className="vac-controls">
            <button
              className={`vac-ctrl-btn ${micActive ? 'is-active' : ''}`}
              onClick={() => setMicActive(v => !v)}
              title={micActive ? 'Mute' : 'Unmute'}
              aria-label={micActive ? 'Mute microphone' : 'Unmute microphone'}
            >
              {micActive ? <Mic size={20} /> : <MicOff size={20} />}
            </button>

            <button
              className={`vac-ctrl-btn ${camActive ? 'is-active' : ''}`}
              onClick={() => setCamActive(v => !v)}
              title={camActive ? 'Turn off camera' : 'Turn on camera'}
              aria-label={camActive ? 'Turn off camera' : 'Turn on camera'}
            >
              {camActive ? <Video size={20} /> : <VideoOff size={20} />}
            </button>

            <button
              className="vac-ctrl-btn vac-ctrl-btn--end"
              onClick={handleEnd}
              title="End session"
              aria-label="End counselling session"
            >
              <PhoneOff size={20} />
            </button>
          </div>

          {/* Connecting overlay */}
          {phase === 'connecting' && (
            <div className="vac-connecting" role="status" aria-live="polite">
              <div className="vac-connecting-ring" aria-hidden="true" />
              <h2>Connecting to Aryan…</h2>
              <p>Preparing your personalised counselling session</p>
            </div>
          )}
        </main>

        {/* ── Right Panel ── */}
        <aside className="vac-panel">
          <div className="vac-panel-tabs" role="tablist">
            {['chat', 'report'].map(tab => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                className={`vac-panel-tab ${activeTab === tab ? 'is-active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'chat' ? '💬 Chat' : '📊 Report'}
              </button>
            ))}
          </div>

          <div className="vac-panel-content">

            {/* ── CHAT TAB ── */}
            {activeTab === 'chat' && (
              <div className="vac-chat">

                {/* Quick questions — collapsible dropdown */}
                <div className="vac-quick-actions">
                  <button
                    className="vac-quick-toggle"
                    onClick={() => setShowQuickQ(v => !v)}
                    aria-expanded={showQuickQ}
                  >
                    <span>💡 Quick questions</span>
                    <span style={{
                      display: 'inline-block',
                      transition: 'transform 0.25s ease',
                      transform: showQuickQ ? 'rotate(180deg)' : 'rotate(0deg)',
                      fontSize: '0.75rem',
                      opacity: 0.7,
                    }}>▼</span>
                  </button>
                  {showQuickQ && (
                    <div className="vac-quick-list">
                      {QUICK_QUESTIONS.map(q => (
                        <button
                          key={q}
                          className="vac-quick-btn"
                          onClick={() => { handleSend(q); setShowQuickQ(false); }}
                          disabled={isThinking}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="vac-messages" role="log" aria-live="polite" aria-label="Conversation">
                  {messages.map(m => (
                    <div key={m.id} className={`vac-msg vac-msg--${m.role}`}>
                      <span className="vac-msg-who">{m.role === 'ai' ? 'Aryan' : 'You'}</span>
                      <div className="vac-msg-bubble">{m.text}</div>
                      <span className="vac-msg-time">{m.time}</span>
                    </div>
                  ))}
                  {isThinking && <TypingDots />}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="vac-chat-input">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder="Ask Aryan about your UPSC preparation…"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isThinking || phase !== 'live'}
                    aria-label="Type your question"
                  />
                  <button
                    className="vac-send-btn"
                    onClick={() => handleSend()}
                    disabled={!inputText.trim() || isThinking || phase !== 'live'}
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ── REPORT TAB ── */}
            {activeTab === 'report' && (
              <div>
                <div className="vac-report-header">
                  <h2 className="vac-report-name">
                    {candidateName || report?.candidate_name || 'Candidate'}'s Profile
                  </h2>
                  <p className="vac-report-sub">Psychometric Analysis · UPSC IAS Track</p>
                </div>

                {/* Readiness score */}
                {report?.upsc_readiness && (
                  <div className="vac-score-ring">
                    <ScoreRing score={report.upsc_readiness.score} />
                    <div className="vac-score-info">
                      <p className="vac-score-label">UPSC Readiness</p>
                      <p className="vac-score-value">{report.upsc_readiness.score}<span style={{ fontSize: '1rem', color: 'var(--c-text-muted)' }}>/100</span></p>
                      <p className="vac-score-desc">{report.upsc_readiness.description}</p>
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {report?.strengths?.length > 0 && (
                  <div className="vac-section">
                    <p className="vac-section-title">Strengths</p>
                    <div className="vac-tag-list">
                      {report.strengths.map((s, i) => (
                        <span key={i} className="vac-tag vac-tag--strength">✓ {s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Areas for improvement */}
                {report?.areas_for_improvement?.length > 0 && (
                  <div className="vac-section">
                    <p className="vac-section-title">Areas to Develop</p>
                    <div className="vac-tag-list">
                      {report.areas_for_improvement.map((a, i) => (
                        <span key={i} className="vac-tag vac-tag--weakness">↑ {a}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personality traits */}
                {report?.personality_traits?.length > 0 && (
                  <div className="vac-section">
                    <p className="vac-section-title">Personality Traits</p>
                    <div className="vac-tag-list">
                      {report.personality_traits.map((t, i) => (
                        <span key={i} className="vac-tag vac-tag--trait">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {report?.personalized_recommendations?.length > 0 && (
                  <div className="vac-section">
                    <p className="vac-section-title">Recommendations</p>
                    {report.personalized_recommendations.map((r, i) => (
                      <div key={i} className="vac-rec-item">
                        <span className="vac-rec-num">{i + 1}</span>
                        <p className="vac-rec-text">
                          {r.title && <strong style={{ color: 'var(--c-text)', display: 'block', marginBottom: '0.2rem', fontSize: '0.85rem' }}>{r.title}</strong>}
                          {r.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {!report && (
                  <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
                    No report data available.
                  </p>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ── Footer ── */}
        <footer className="vac-footer">
          <span>Powered by Samkalp Vedhik</span>
          <span>IAS Preparation Mentor · Confidential</span>
        </footer>

      </div>
    </div>
  );
};

export default VideoAvatarCounselling;
