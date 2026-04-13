import React, { useState, useEffect, useRef } from 'react';
import '../styles/Profile.css';
import { INDIAN_LOCATIONS } from '../constants/locations';

const StudentProfile = ({ user, onUserUpdate, onLogout, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    target_exam: ''
  });

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        target_exam: user.target_exam || ''
      });
    }
  }, [user]);

  const [stats, setStats] = useState({
    courses_completed: "0/0",
    tests_taken: 0,
    interviews_done: 0,
    study_streak: 0
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const fileInputRef = useRef(null);
  const photoMenuRef = useRef(null);

  useEffect(() => {
    fetchStats();

    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (photoMenuRef.current && !photoMenuRef.current.contains(event.target)) {
        setShowPhotoMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [user.id]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/stats/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset if canceling
      setEditData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        target_exam: user.target_exam || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Validation
    if (!editData.name || !editData.name.trim()) return alert("Please enter your full name");
    if (!editData.phone || !editData.phone.trim()) return alert("Please enter your phone number");
    if (!editData.location || !editData.location.trim()) return alert("Please enter your location");

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/update/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onUserUpdate(updatedUser);
        setIsEditing(false);
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 2000);
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      alert("Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/upload-image/${user.id}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onUserUpdate({ ...user, profile_image: data.image_url });
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 2000);
      } else {
        alert("Image upload failed");
      }
    } catch (err) {
      alert("Error uploading image");
    } finally {
      setUploading(false);
      setShowPhotoMenu(false);
    }
  };

  const handleRemovePhoto = async () => {
    setUploading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/remove-image/${user.id}`, {
        method: 'POST'
      });
      if (response.ok) {
        onUserUpdate({ ...user, profile_image: null });
        setShowPhotoMenu(false);
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 2000);
      } else {
        alert("Failed to remove photo");
      }
    } catch (err) {
      alert("Error removing photo");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you absolutely sure? This action cannot be undone and all your data will be permanently deleted.")) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/delete/${user.id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          alert("Account deleted successfully.");
          onLogout();
        } else {
          alert("Failed to delete account.");
        }
      } catch (err) {
        alert("Error deleting account.");
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "January 15, 2026";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  const profileImageSrc = user.profile_image
    ? (user.profile_image.startsWith('/static') ? `${process.env.REACT_APP_API_URL}${user.profile_image}` : user.profile_image)
    : null;

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
          <span style={{ fontWeight: '700' }}>Profile Updated Successfully!</span>
        </div>
      )}
      <header className="profile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <button onClick={onBack} className="back-btn-minimal">← Back to Dashboard</button>
        </div>
        <h1>My Profile</h1>
        <p>Manage your account information and preferences</p>
      </header>

      <div className="profile-grid">
        {/* Left Column - Main Card */}
        <aside className="profile-main-card-wrapper">
          <div className="profile-card profile-main-card">
            <div
              className="profile-avatar-large"
              onClick={handleImageClick}
              style={{
                cursor: 'pointer',
                backgroundImage: profileImageSrc ? `url(${profileImageSrc})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}
            >
              {!profileImageSrc && (user.name || user.email).substring(0, 2).toUpperCase()}
              {uploading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                  ⌛
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageChange}
              accept="image/*"
            />

            <h2>{user.name || user.email.split('@')[0]}</h2>
            <p className="profile-subtitle">UPSC Aspirant</p>

            <div className="member-since">
              <span className="icon">📅</span> Member since {formatDate(user.member_since)}
            </div>

            <div className="photo-actions-wrapper" ref={photoMenuRef} style={{ position: 'relative', display: 'flex', gap: '0.5rem' }}>
              <button
                className="change-photo-btn"
                onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                disabled={uploading}
                style={{ flex: 1 }}
              >
                {uploading ? 'Processing...' : (user.profile_image ? 'Change Photo' : 'Add Profile Photo')}
              </button>

              {user.profile_image && (
                <button
                  className="remove-photo-btn-secondary"
                  onClick={handleRemovePhoto}
                  disabled={uploading}
                  title="Remove photo"
                >
                  <span className="icon">🗑️</span>
                </button>
              )}

              {showPhotoMenu && (
                <div className="photo-dropdown-menu">
                  <button className="photo-menu-item" onClick={handleImageClick}>
                    <span className="icon">📤</span> Upload New
                  </button>
                  {user.profile_image && (
                    <button className="photo-menu-item remove-opt" onClick={handleRemovePhoto}>
                      <span className="icon">🗑️</span> Remove Photo
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="stats-card-grid" style={{ marginTop: '2.5rem', gridTemplateColumns: '1fr', textAlign: 'left' }}>
              <div className="profile-section-title">
                <h3>Learning Stats</h3>
              </div>
              <div className="stat-inline-group">
                <span className="stat-inline-label">Courses Completed</span>
                <span className="stat-inline-value">{stats.courses_completed}</span>
              </div>
              <div className="stat-inline-group">
                <span className="stat-inline-label">Tests Taken</span>
                <span className="stat-inline-value">{stats.tests_taken}</span>
              </div>
              <div className="stat-inline-group">
                <span className="stat-inline-label">Interviews Done</span>
                <span className="stat-inline-value">{stats.interviews_done}</span>
              </div>
              <div className="stat-inline-group">
                <span className="stat-inline-label">Study Streak</span>
                <span className="stat-inline-value stat-highlight">{stats.study_streak} days</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column - Details */}
        <main className="profile-details-column">
          <div className="profile-card">
            <div className="profile-section-title">
              <h3>Personal Information</h3>
              {!isEditing ? (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  <span className="icon">📝</span> Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="cancel-btn" onClick={handleEditToggle}>Cancel</button>
                  <button className="save-btn" onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="info-grid">
              <div className="info-group">
                <label><span className="icon">👤</span> Full Name</label>
                {isEditing ? (
                  <input
                    className="info-field editable"
                    name="name"
                    value={editData.name}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="info-field">{user.name || user.email.split('@')[0]}</div>
                )}
              </div>
              <div className="info-group">
                <label><span className="icon">✉️</span> Email Address</label>
                {isEditing ? (
                  <input
                    className="info-field editable"
                    name="email"
                    type="email"
                    value={editData.email}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="info-field">{user.email}</div>
                )}
              </div>
              <div className="info-group">
                <label><span className="icon">📞</span> Phone Number</label>
                {isEditing ? (
                  <input
                    className="info-field editable"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={editData.phone}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="info-field">{user.phone || <span style={{ color: '#94a3b8' }}>Not set</span>}</div>
                )}
              </div>
              <div className="info-group">
                <label><span className="icon">📍</span> Location</label>
                {isEditing ? (
                  <>
                    <input
                      className="info-field editable"
                      name="location"
                      placeholder="e.g. Kerala, India"
                      list="location-suggestions-student"
                      value={editData.location}
                      onChange={handleInputChange}
                    />
                    <datalist id="location-suggestions-student">
                      {INDIAN_LOCATIONS.map(loc => (
                        <option key={loc} value={loc} />
                      ))}
                    </datalist>
                  </>
                ) : (
                  <div className="info-field">{user.location || <span style={{ color: '#94a3b8' }}>Not set</span>}</div>
                )}
              </div>
            </div>
          </div>

          <div className="profile-card" style={{ marginTop: '2rem' }}>
            <div className="profile-section-title">
              <h3>Target Exam</h3>
            </div>
            <div className="info-group">
              {isEditing ? (
                <input
                  className="info-field editable"
                  name="target_exam"
                  placeholder="e.g. UPSC CSE 2027"
                  value={editData.target_exam}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="info-field">{user.target_exam || <span style={{ color: '#94a3b8' }}>Not set</span>}</div>
              )}
            </div>
          </div>

          <div className="profile-card" style={{ marginTop: '2rem' }}>
            <div className="profile-section-title">
              <h3>Preferences</h3>
            </div>
            <div className="preferences-list">
              <div className="preference-item">
                <div className="pref-info">
                  <h4>Email Notifications</h4>
                  <p>Receive updates about your progress</p>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="pref-info">
                  <h4>Daily Study Reminders</h4>
                  <p>Get reminders for your study plan</p>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="pref-info">
                  <h4>Interview Feedback</h4>
                  <p>Receive detailed AI analysis reports</p>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="profile-card danger-zone" style={{ marginTop: '2rem' }}>
            <div className="profile-section-title">
              <h3>Danger Zone</h3>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="delete-account-btn" onClick={handleDeleteAccount}>Delete Account</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentProfile;
