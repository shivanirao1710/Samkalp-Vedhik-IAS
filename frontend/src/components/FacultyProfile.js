import React, { useState, useEffect } from 'react';
import '../styles/Profile.css';
import { City } from 'country-state-city';

const FacultyProfile = ({ user, onUserUpdate, onLogout, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    department: ''
  });

  const [locationOptions, setLocationOptions] = useState([]);
  const [locationSearch, setLocationSearch] = useState('');

  useEffect(() => {
    if (locationSearch.length > 2) {
      const cities = City.getAllCities()
        .filter(city => 
          city.name.toLowerCase().includes(locationSearch.toLowerCase())
        )
        .slice(0, 100)
        .map(city => `${city.name}, ${city.stateCode}, ${city.countryCode}`);
      setLocationOptions(cities);
    }
  }, [locationSearch]);

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        department: user.department || 'Art and Culture'
      });
    }
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

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
    // Validation
    if (!editData.name.trim()) return alert("Please enter your full name");
    if (!editData.phone.trim()) return alert("Please enter your phone number");
    if (!editData.location.trim()) return alert("Please enter your location");

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
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 2000);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "January 2024";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handlePhotoRemoveAction = () => {
    onUserUpdate({ ...user, profile_image: null });
    setShowPhotoMenu(false);
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000);
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
              <span className="icon">📅</span> Joined {formatDate(user.member_since)}
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
                      onClick={handlePhotoRemoveAction}
                    >
                      <span className="icon">🗑️</span> Remove photo
                    </button>
                  )}
                </div>
              )}
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
                      placeholder="City, State, Country"
                      list="location-suggestions"
                      value={editData.location}
                      onChange={(e) => {
                        handleInputChange(e);
                        setLocationSearch(e.target.value);
                      }}
                    />
                    <datalist id="location-suggestions">
                      {locationOptions.map((opt, idx) => (
                        <option key={idx} value={opt} />
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

export default FacultyProfile;
