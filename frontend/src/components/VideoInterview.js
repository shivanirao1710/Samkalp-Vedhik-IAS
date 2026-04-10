import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send } from 'lucide-react';
import '../styles/VideoAvatarCounselling.css'; 

const API = 'http://localhost:8000';

const VideoInterview = ({ user, onComplete, onAbort, difficulty = 'Medium' }) => {
  const [phase, setPhase] = useState('connecting'); // connecting | interview | analyzing | results
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(-1); // -1 = Intro
  const [answers, setAnswers] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [camActive, setCamActive] = useState(false);
  const [beyCallLink, setBeyCallLink] = useState(null);
  const [iframeReady, setIframeReady] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  const recognitionRef = useRef(null);
  const userVideoRef = useRef(null);
  const lastUserTranscript = useRef('');

  // 1. Init Session & Fetch Questions
  useEffect(() => {
    const init = async () => {
      try {
        const [qRes, beyRes] = await Promise.all([
          fetch(`${API}/api/interview/questions?level=${difficulty}`),
          fetch(`${API}/api/beyond-presence/init-interview?user_name=${encodeURIComponent(user?.name || 'Candidate')}`, { method: 'POST' })
        ]);
        
        if (qRes.ok && beyRes.ok) {
          const qs = await qRes.json();
          const { beyCallLink } = await beyRes.json();
          setQuestions(qs);
          setBeyCallLink(beyCallLink);
          setPhase('interview');
          // Optimistic iframe ready after 8s (down from 12s)
          setTimeout(() => setIframeReady(true), 8000);
        }
      } catch (err) {
        console.error("Init failed:", err);
      }
    };
    init();
  }, [user, difficulty]);

  // 2. TTS Helper
  const speak = useCallback((text, onEnd) => {
    if (!('speechSynthesis' in window)) {
        if (onEnd) setTimeout(onEnd, 3000);
        return;
    }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    utt.voice = voices.find(v => v.lang.startsWith('en-IN') && v.name.toLowerCase().includes('male')) || voices[0];
    utt.rate = 0.9;
    utt.onend = () => {
        clearTimeout(safetyTimer);
        if (onEnd) onEnd();
    };
    
    const safetyTimer = setTimeout(() => {
        window.speechSynthesis.cancel();
        if (onEnd) onEnd();
    }, text.length * 100 + 4000); 

    window.speechSynthesis.speak(utt);
  }, []);

  // 3. Handle Question Flow
  useEffect(() => {
    if (phase !== 'interview' || !iframeReady) return;
    
    if (currentQIndex === -1) {
        const t = setTimeout(() => {
            setCurrentQIndex(0);
        }, 10000);
        return () => clearTimeout(t);
    }

    if (currentQIndex < questions.length) {
        const q = questions[currentQIndex];
        setIsSpeaking(true);
        speak(q, () => {
            setIsSpeaking(false);
            setMicActive(true);
        });
    }
  }, [currentQIndex, phase, iframeReady, questions, speak]);

  const finishInterview = async (finalAnswers = answers) => {
    setPhase('analyzing');
    try {
        const res = await fetch(`${API}/api/interview/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                answers: finalAnswers
            })
        });
        if (res.ok) {
            const data = await res.json();
            onComplete(data);
        } else {
            throw new Error("Analysis failed");
        }
    } catch (err) {
        console.error("Analysis Error:", err);
        onComplete({
            overall_score: 0,
            communication_skills: 0,
            knowledge_depth: 0,
            analytical_ability: 0,
            feedback: "SYSTEM ERROR: The AI was unable to process your responses.",
            strengths: ["Data error"],
            areas_for_improvement: ["Check mic quality"],
            verdict: "Please retake the interview."
        });
    }
  };

  const handleAnswer = (text) => {
    if (!text.trim() || currentQIndex < 0 || currentQIndex >= questions.length) return;
    
    const currentQ = questions[currentQIndex];
    const newAnswers = [...answers, { question: currentQ, answer: text }];
    setAnswers(newAnswers);
    
    setMicActive(false);
    setUserTranscript('');
    
    if (currentQIndex === questions.length - 1) {
        finishInterview(newAnswers);
    } else {
        setCurrentQIndex(prev => prev + 1);
    }
  };

  const stopEverything = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    setMicActive(false);
    if (userVideoRef.current?.srcObject) {
      userVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setCamActive(false);
    if (onAbort) onAbort();
  };

  // 5. Speech Recognition logic
  useEffect(() => {
    let rec = null;
    if (micActive) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        rec = new SR();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-IN';
        rec.onresult = (e) => {
          let trans = '';
          for (let i = 0; i < e.results.length; i++) trans += e.results[i][0].transcript;
          setUserTranscript(trans);
        };
        rec.start();
        recognitionRef.current = rec;
      }
    } else {
      recognitionRef.current?.stop();
    }
    return () => rec?.stop();
  }, [micActive]);

  useEffect(() => {
    if (micActive && userTranscript && userTranscript !== lastUserTranscript.current) {
      lastUserTranscript.current = userTranscript;
      const t = setTimeout(() => {
        if (userTranscript.trim().length > 10) {
            handleAnswer(userTranscript);
            lastUserTranscript.current = '';
        }
      }, 3000); 
      return () => clearTimeout(t);
    }
  }, [userTranscript, micActive]);

  // 6. Camera
  useEffect(() => {
    if (camActive) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(s => {
        if (userVideoRef.current) userVideoRef.current.srcObject = s;
      });
    } else {
      userVideoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    }
  }, [camActive]);

  if (phase === 'connecting') {
    return (
      <div className="vac-container">
        <div className="vac-connecting">
           <div className="vac-connecting-ring"></div>
           <h2>Preparing Interview Board...</h2>
           <p>Generating UPSC specific questions and assembling the board.</p>
        </div>
      </div>
    );
  }

  if (phase === 'analyzing') {
    return (
      <div className="vac-container">
        <div className="vac-connecting">
           <div className="spinner-ring" style={{ width: 50, height: 50, border: '4px solid #F2921D', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
           <h2>Board is Deliberating...</h2>
           <p>Analyzing your answers, communication style, and knowledge depth.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vac-container">
      <div className="vac-layout">
        <header className="vac-header">
           <div className="vac-logo">Board Interview</div>
           <div className="vac-header-meta">
             <span className="vac-badge vac-badge--live">Phase: {currentQIndex === -1 ? 'Introduction' : `Question ${currentQIndex + 1}/5`}</span>
           </div>
        </header>

        <main className="vac-stage">
          <div className="vac-avatar-container">
            {!iframeReady && (
                <div className="vac-connecting" style={{ position: 'absolute', zIndex: 10, background: '#080b10' }}>
                   <div className="vac-connecting-ring"></div>
                   <span>Chairman is entering the board...</span>
                </div>
            )}
            {beyCallLink && (
                <iframe 
                    src={beyCallLink} 
                    allow="camera; microphone; autoplay" 
                    className="vac-bey-iframe"
                    onLoad={() => setTimeout(() => setIframeReady(true), 1500)}
                    style={{ opacity: iframeReady ? 1 : 0, transition: 'opacity 1s' }}
                />
            )}
            <div style={{ position: 'absolute', top:0, left:0, right:0, height: '20%', background: 'linear-gradient(to bottom, #080b10 60%, transparent)', zIndex: 4 }} />
            <div style={{ position: 'absolute', bottom:0, left:0, right:0, height: '35%', background: 'linear-gradient(to top, #080b10 55%, transparent)', zIndex: 4 }} />
          </div>

          <div className="vac-pip">
             {camActive ? <video ref={userVideoRef} autoPlay playsInline muted /> : <div className="vac-pip-off">Camera Off</div>}
          </div>

          {userTranscript && (
              <div className="vac-transcript-overlay" style={{ 
                position: 'absolute', 
                bottom: '140px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                background: 'rgba(15, 23, 42, 0.9)', 
                backdropFilter: 'blur(8px)',
                color: 'white', 
                padding: '1rem 2rem', 
                borderRadius: '24px', 
                fontSize: '1rem', 
                maxWidth: '70%', 
                textAlign: 'center',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 100,
                animation: 'fadeInUp 0.3s ease-out'
              }}>
                 <span style={{ display: 'block', fontSize: '0.7rem', color: '#3b82f6', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Your Response</span>
                 "{userTranscript}"
                 <div style={{ marginTop: '0.5rem' }}>
                    <button 
                        onClick={() => handleAnswer(userTranscript)}
                        style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                        Submit Answer manually →
                    </button>
                 </div>
              </div>
          )}

          <div className="vac-controls">
            <button className={`vac-ctrl-btn ${micActive ? 'is-active' : ''}`} onClick={() => setMicActive(!micActive)}>
                {micActive ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button className={`vac-ctrl-btn ${camActive ? 'is-active' : ''}`} onClick={() => setCamActive(!camActive)}>
                {camActive ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            <button className="vac-ctrl-btn vac-ctrl-btn--end" onClick={stopEverything}>
                <PhoneOff size={20} />
            </button>
          </div>
        </main>

        <aside className="vac-panel">
           <div className="vac-panel-tabs">
              <button className="vac-panel-tab is-active">Interview Progress</button>
           </div>
           <div className="vac-panel-content" style={{ padding: '2rem' }}>
              <div className="interview-steps">
                 {questions.map((q, idx) => (
                    <div key={idx} className={`step-item ${idx < currentQIndex ? 'done' : idx === currentQIndex ? 'active' : ''}`}>
                       <div className="step-num">{idx + 1}</div>
                       <div className="step-text">Question {idx + 1}</div>
                    </div>
                 ))}
              </div>
              {currentQIndex >= 0 && currentQIndex < questions.length && (
                  <div className="current-q-card" style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                     <h4 style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Current Question</h4>
                     <p style={{ fontWeight: '700', color: '#1e293b' }}>{questions[currentQIndex]}</p>
                  </div>
              )}
           </div>
        </aside>
      </div>
      <style>{`
        .interview-steps { display: flex; flex-direction: column; gap: 1rem; }
        .step-item { display: flex; align-items: center; gap: 1rem; opacity: 0.4; }
        .step-item.active { opacity: 1; transform: scale(1.05); }
        .step-item.done { opacity: 0.8; color: #22c55e; }
        .step-num { width: 32px; height: 32px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        .step-item.active .step-num { background: #3b82f6; color: white; }
        .step-item.done .step-num { background: #22c55e; color: white; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
    </div>
  );
};

export default VideoInterview;
