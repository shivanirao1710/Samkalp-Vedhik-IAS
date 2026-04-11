import React, { useState, useEffect } from 'react';
import '../styles/VideoAvatarCounselling.css'; 

const API = 'http://localhost:8000';

const VideoAvatarCounselling = ({ testResultId, report, candidateName, avatarImageUrl, beyCallLink = null, onEndSession }) => {
  const [activeBeyLink, setActiveBeyLink] = useState(beyCallLink);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (beyCallLink) return;

    const initBey = async () => {
      try {
        const res = await fetch(`${API}/api/beyond-presence/init-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportData: report || {}, candidateName: candidateName || 'Candidate' })
        });
        
        if (!res.ok) throw new Error("Bey API missing or failed");

        const data = await res.json();
        if (data.beyCallLink) {
          setActiveBeyLink(data.beyCallLink);
        } else {
            throw new Error("Invalid Beyond Presence link returned");
        }
      } catch (err) {
        console.warn("Failed to init Avatar:", err.message);
        setError("Failed to initialize Avatar Session. Please check backend integration.");
      }
    };
    initBey();
  }, [report, candidateName, beyCallLink]);

  return (
    <div className="vac-container" style={{ width: '100%', height: 'calc(100vh - 64px)', background: '#0e1420', position: 'relative' }}>
      {error ? (
          <div style={{ color: 'red', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{error}</div>
      ) : activeBeyLink ? (
          <iframe
            src={activeBeyLink}
            allow="camera; microphone; autoplay; "
            className="vac-bey-iframe"
            style={{
              width: '100%', height: '100%',
              border: 'none', zIndex: 1
            }}
            title="Beyond Presence avatar session"
          />
      ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#d4a853' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '3px solid rgba(212,168,83,0.2)',
                borderTop: '3px solid #d4a853',
                animation: 'spin 1s linear infinite',
              }} />
              <span style={{ marginLeft: '1rem', fontFamily: 'var(--font-body)' }}>Connecting to Aryan Avatar...</span>
          </div>
      )}
      
      {/* Absolute positioned close button to leave session */}
      <button 
        onClick={onEndSession}
        style={{
            position: 'absolute', top: '16px', right: '16px', zIndex: 10,
            background: 'rgba(200, 50, 50, 0.8)', color: 'white', border: 'none',
            padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-body)'
        }}
      >
        End Session
      </button>
    </div>
  );
};

export default VideoAvatarCounselling;
