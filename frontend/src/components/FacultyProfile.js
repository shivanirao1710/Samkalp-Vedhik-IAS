import React, { useState, useEffect } from 'react';
import '../styles/Profile.css';

const FacultyProfile = ({ user, onUserUpdate, onLogout, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    location: user.location || '',
    department: user.department || 'Art and Culture'
  });
  
  const [stats, setStats] = useState({
    courses_taught: 4,
    students_mentored: 245,
    interviews_done: 89,
    faculty_rating: "4.8/5"
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        department: user.department || 'Art and Culture'
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setShowPhotoMenu(false);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/upload-image/${user.id}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onUserUpdate({ ...user, profile_image: data.image_url });
      } else {
        alert("Failed to upload image.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error connecting to server for upload.");
    } finally {
      setUploading(false);
    }
  };

  const profileImageSrc = user.profile_image 
    ? (user.profile_image.startsWith('/static') ? `${process.env.REACT_APP_API_URL}${user.profile_image}` : user.profile_image)
    : null;

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <button onClick={onBack} className="back-btn-minimal">← Back to Dashboard</button>
        </div>
        <h1>My Profile</h1>
        <p>Manage your faculty details, contact information, and account settings</p>
      </header>

      <div className="profile-grid">
        {/* Left Column - ID Card */}
        <aside className="profile-main-card-wrapper">
          <div className="profile-card profile-main-card">
            {profileImageSrc ? (
              <img src={profileImageSrc} alt="Profile" className="profile-avatar-large" style={{ objectFit: 'cover' }} />
            ) : (
              <div className="profile-avatar-large">
                {user.name ? user.name.substring(0, 2).toUpperCase() : '👨‍🏫'}
              </div>
            )}
            
            <h2>{user.name || user.email.split('@')[0]}</h2>
            <div className="profile-subtitle">Faculty Member</div>
            
            <div className="member-since">
              <span className="icon">📅</span> Joined January 2024
            </div>

            <div className="photo-actions-wrapper" style={{ position: 'relative' }}>
              <button 
                className="change-photo-btn" 
                onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : (profileImageSrc ? 'Change Photo' : 'Add New Photo')}
              </button>
              
              {showPhotoMenu && (
                <div className="photo-dropdown-menu">
                  <label className="photo-menu-item">
                    <span className="icon">📁</span> Upload from computer
                    <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
                  </label>
                  {profileImageSrc && (
                    <button 
                      className="photo-menu-item remove-opt" 
                      onClick={() => {
                        onUserUpdate({ ...user, profile_image: null });
                        setShowPhotoMenu(false);
                      }}
                    >
                      <span className="icon">🗑️</span> Remove photo
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="profile-stats-divider" style={{ borderTop: '1px solid #e2e8f0', margin: '2rem 0', width: '100%' }}></div>
            
            <div style={{ width: '100%', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '1rem' }}>Faculty Stats</h3>
              <div className="stat-inline-group">
                <span className="stat-inline-label">Courses Taught</span>
                <span className="stat-inline-value">{stats.courses_taught}</span>
              </div>
              <div className="stat-inline-group">
                <span className="stat-inline-label">Students Mentored</span>
                <span className="stat-inline-value">{stats.students_mentored}</span>
              </div>
              <div className="stat-inline-group">
                <span className="stat-inline-label">Interviews Done</span>
                <span className="stat-inline-value">{stats.interviews_done}</span>
              </div>
              <div className="stat-inline-group">
                <span className="stat-inline-label">Faculty Rating</span>
                <span className="stat-inline-value stat-highlight">{stats.faculty_rating}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column - Details */}
        <main className="profile-details-column">
          <div className="profile-card">
            <div className="profile-section-title">
              <h3>Professional Information</h3>
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
                    value={editData.phone}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="info-field">{user.phone || <span style={{color: '#94a3b8'}}>Not set</span>}</div>
                )}
              </div>
              <div className="info-group">
                <label><span className="icon">📍</span> Location</label>
                {isEditing ? (
                  <input
                    className="info-field editable"
                    name="location"
                    placeholder="City, Country"
                    value={editData.location}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="info-field">{user.location || <span style={{color: '#94a3b8'}}>Not set</span>}</div>
                )}
              </div>
            </div>
          </div>

          <div className="profile-card" style={{ marginTop: '2rem' }}>
            <div className="profile-section-title">
              <h3>Department</h3>
            </div>
            <div className="info-group">
              {isEditing ? (
                <input
                  className="info-field editable"
                  name="department"
                  value={editData.department}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="info-field">{editData.department}</div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default FacultyProfile;
