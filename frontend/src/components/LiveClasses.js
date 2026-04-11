import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

const LiveClasses = ({ user }) => {
  const [liveClasses, setLiveClasses] = useState([]);
  const [bookedClassIds, setBookedClassIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveClasses();
    if (user?.id) fetchUserEnrollments();
  }, [user]);

  const fetchUserEnrollments = async () => {
    try {
      const resp = await fetch(`${process.env.REACT_APP_API_URL}/live-classes/user/${user.id}/enrollments`);
      const data = await resp.json();
      setBookedClassIds(data);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
    }
  };

  const fetchLiveClasses = async () => {
    try {
      const resp = await fetch(`${process.env.REACT_APP_API_URL}/live-classes/`);
      const data = await resp.json();
      setLiveClasses(data);
    } catch (err) {
      console.error("Error fetching live classes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSpot = async (classId) => {
    if (!user?.id) return alert("Please log in to book spots");
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/live-classes/${classId}/book?user_id=${user.id}`, {
        method: 'POST'
      });
      if (response.ok) {
        alert("🎉 Spot booked successfully! See you in class.");
        fetchLiveClasses();
        fetchUserEnrollments();
      } else {
        const err = await response.json();
        alert(err.detail || "Failed to book spot");
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Failed to connect to backend");
    }
  };

  return (
    <div className="live-classes-container" style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Live Interactive Sessions</h2>
        <p style={{ color: '#64748b' }}>Join our expert-led sessions and interact in real-time.</p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading live sessions...</div>
      ) : (
        <div className="live-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {liveClasses.map((live) => (
            <div key={live.id} className="live-card" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: 'linear-gradient(135deg, #F2921D 0%, #D93425 100%)', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <span style={{ fontSize: '3.5rem' }}>📺</span>
                <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#fee2e2', color: '#ef4444', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
                  {live.status}
                </span>
              </div>

              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1e293b' }}>{live.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>with {live.instructor}</p>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>📅 {live.date}</span>
                    <span style={{ color: '#64748b' }}>⏰ {live.time}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>⏱️ {live.duration} hours</span>
                    <span style={{ color: '#F2921D', fontWeight: '700' }}>👤 {live.registered}/{live.capacity} Spots</span>
                  </div>

                  <button
                    onClick={() => bookedClassIds.includes(live.id) ? (live.meeting_link ? window.open(live.meeting_link, '_blank') : alert("Meeting link not available yet")) : handleBookSpot(live.id)}
                    disabled={!bookedClassIds.includes(live.id) && live.registered >= live.capacity}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      background: bookedClassIds.includes(live.id) ? '#10b981' : (live.registered >= live.capacity ? '#e2e8f0' : '#F2921D'),
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '700',
                      cursor: (!bookedClassIds.includes(live.id) && live.registered >= live.capacity) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {bookedClassIds.includes(live.id) ? (
                      <><span>✅</span> Join Class</>
                    ) : (
                      live.registered >= live.capacity ? 'Class Full' : 'Book Your Spot'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {liveClasses.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', background: '#f8fafc', borderRadius: '24px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
              <h3 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>No live classes scheduled yet</h3>
              <p style={{ color: '#64748b' }}>Check back soon for new expert-led interactive sessions.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveClasses;
