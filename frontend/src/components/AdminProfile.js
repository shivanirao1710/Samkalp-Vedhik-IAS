import React, { useState, useEffect } from 'react';
import '../styles/Profile.css';

const AdminProfile = ({ user, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  });

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || ''
      });
    }
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/update/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        setIsEditing(false);
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 2000);
        // We'd normally call onUserUpdate here, but AdminDashboard doesn't have it yet.
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      {showSavedMessage && (
        <div className="save-success-toast" style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          background: '#F2921D',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <span style={{ fontSize: '1.2rem' }}>✅</span>
          <span style={{ fontWeight: '700' }}>Admin Profile Updated!</span>
        </div>
      )}
      <header className="profile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <button onClick={onBack} className="back-btn-minimal">← Back to Panel</button>
        </div>
        <h1>Administrator Profile</h1>
        <p>Manage your account details and platform preferences</p>
      </header>

      <div className="profile-grid">
        <aside className="profile-main-card-wrapper">
          <div className="profile-card profile-main-card">
            <div className="profile-avatar-large" style={{ background: '#F2921D' }}>
              💎
            </div>
            <h2>{user.name || 'Platform Admin'}</h2>
            <div className="profile-subtitle">Super Administrator</div>
            <div className="member-since">
              <span className="icon">🛡️</span> Full Access Account
            </div>
          </div>
        </aside>

        <main className="profile-details-column">
          <div className="profile-card">
            <div className="profile-section-title">
              <h3>Personal Information</h3>
              {!isEditing ? (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  <span className="icon">📝</span> Edit profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button className="save-btn" onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="info-grid">
              <div className="info-group">
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    className="info-field editable"
                    value={editData.name}
                    onChange={e => setEditData({...editData, name: e.target.value})}
                  />
                ) : (
                  <div className="info-field">{editData.name}</div>
                )}
              </div>
              <div className="info-group">
                <label>Email Address</label>
                {isEditing ? (
                  <input
                    className="info-field editable"
                    type="email"
                    value={editData.email}
                    onChange={e => setEditData({...editData, email: e.target.value})}
                  />
                ) : (
                  <div className="info-field">{editData.email}</div>
                )}
              </div>
              <div className="info-group">
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    className="info-field editable"
                    value={editData.phone}
                    onChange={e => setEditData({...editData, phone: e.target.value})}
                  />
                ) : (
                  <div className="info-field">{editData.phone || 'Not set'}</div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminProfile;
