import React, { useState, useEffect } from 'react';
import '../styles/VideoAvatarCounselling.css'; 

const API = `${process.env.REACT_APP_API_URL}`;

const VideoInterview = ({ user, onComplete, onAbort, difficulty = 'Medium' }) => {
  const [beyCallLink, setBeyCallLink] = useState(null);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  const initializationStarted = React.useRef(false);

  useEffect(() => {
    if (initializationStarted.current) return;
    initializationStarted.current = true;

    const init = async () => {
      try {
        const beyRes = await fetch(`${API}/api/beyond-presence/init-interview?user_name=${encodeURIComponent(user?.name || 'Candidate')}`, { method: 'POST' });
        
        if (beyRes.ok) {
          const { beyCallLink } = await beyRes.json();
          setBeyCallLink(beyCallLink);
        } else {
            throw new Error("Failed connecting to Avatar Interview service");
        }
      } catch (err) {
        console.error("Init failed:", err);
        setError("Interview Avatar initialization failed.");
        initializationStarted.current = false;
      }
    };
    init();

    // Start background speech recognition to capture candidate's side of conversation
    const SpeechRecognition = window.SpeechRecognition || window.webkitRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';
      
      recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          setTranscript(prev => prev + " " + result[0].transcript);
        }
      };
      
      try {
        recognition.start();
      } catch (e) { console.warn("SpeechRec start failed:", e); }
    }

    return () => {
      if (recognition) recognition.stop();
    };
  }, [user, difficulty]);

  const handleFinish = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    
    try {
      // If we have a transcript, use it for real analysis. 
      // Otherwise, fallback to a sensible "didn't speak" analysis or mock.
      const userText = transcript.trim() || "Candidate participated in the interview session but was mostly silent or transcript failed.";
      
      const res = await fetch(`${API}/api/interview/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || 0,
          answers: [
            { question: "Overall Interview Performance", answer: userText }
          ]
        })
      });
      
      if (res.ok) {
        const analysis = await res.json();
        onComplete(analysis);
      } else {
        throw new Error("Analysis failed");
      }
    } catch (err) {
      console.error("Finish Error:", err);
      onAbort();
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="vac-container" style={{ width: '100%', height: 'calc(100vh - 64px)', background: '#0e1420', position: 'relative' }}>
        {error ? (
          <div style={{ color: 'red', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{error}</div>
        ) : beyCallLink ? (
            <iframe 
                src={beyCallLink} 
                allow="camera; microphone; autoplay" 
                className="vac-bey-iframe"
                style={{ width: '100%', height: '100%', border: 'none', zIndex: 1 }}
                title="Mock Interview Simulator"
            />
        ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#d4a853' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  border: '3px solid rgba(212,168,83,0.2)',
                  borderTop: '3px solid #d4a853',
                  animation: 'spin 1s linear infinite',
                }} />
                <span style={{ marginLeft: '1rem', fontFamily: 'var(--font-body)' }}>Interviewer is entering the board...</span>
            </div>
        )}

      <button 
        onClick={handleFinish}
        disabled={isFinishing}
        style={{
            position: 'absolute', top: '16px', right: '16px', zIndex: 10,
            background: isFinishing ? '#444' : 'rgba(200, 50, 50, 0.8)', color: 'white', border: 'none',
            padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-body)'
        }}
      >
        {isFinishing ? 'Analyzing...' : 'Finish & Analyze'}
      </button>
    </div>
  );
};

export default VideoInterview;
