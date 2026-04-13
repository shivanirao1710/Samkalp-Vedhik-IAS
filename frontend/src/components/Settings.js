import React, { useState } from 'react';
import '../styles/Profile.css';

const Settings = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState('Security');
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || document.body.classList.contains('dark-mode');
  });

  const handleThemeChange = (mode) => {
    const isDark = mode === 'dark';
    if (isDark) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
    setIsDarkMode(isDark);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      alert("New passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/update-password/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwordData.current,
          new_password: passwordData.new
        }),
      });

      if (res.ok) {
        alert("Password completely updated!");
        setPasswordData({ current: '', new: '', confirm: '' });
      } else {
        const errorData = await res.json();
        alert(`Failed to update password: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <button onClick={onBack} className="back-btn-minimal">← Back to Dashboard</button>
        </div>
        <h1>Settings</h1>
        <p>Manage your security, notifications, and application preferences</p>
      </header>

      <div className="profile-grid">
        {/* Sidebar Navigation */}
        <aside className="profile-main-card-wrapper">
          <div className="profile-card profile-main-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', textAlign: 'left' }}>
              <button
                className={`settings-tab-btn ${activeTab === 'Security' ? 'active' : ''}`}
                onClick={() => setActiveTab('Security')}
              >
                🔒 Security & Password
              </button>
              <button
                className={`settings-tab-btn ${activeTab === 'Notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('Notifications')}
              >
                🔔 Notification Preferences
              </button>
              <button
                className={`settings-tab-btn ${activeTab === 'Appearance' ? 'active' : ''}`}
                onClick={() => setActiveTab('Appearance')}
              >
                🎨 Appearance & Display
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="profile-details-column">
          {activeTab === 'Security' && (
            <div className="profile-card">
              <div className="profile-section-title">
                <h3>Change Password</h3>
              </div>
              <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="info-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    className="info-field editable"
                    value={passwordData.current}
                    onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                    required
                  />
                </div>
                <div className="info-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    className="info-field editable"
                    value={passwordData.new}
                    onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                    required
                  />
                </div>
                <div className="info-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    className="info-field editable"
                    value={passwordData.confirm}
                    onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="submit" className="save-btn" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="profile-card">
              <div className="profile-section-title">
                <h3>Notification Settings</h3>
              </div>
              <div className="preferences-list">
                <div className="preference-item">
                  <div className="pref-info">
                    <h4>Course Announcements</h4>
                    <p>Alerts when new modules are unlocked</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="preference-item">
                  <div className="pref-info">
                    <h4>Test Deadlines</h4>
                    <p>Reminders 24hrs before mock exams close</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="preference-item">
                  <div className="pref-info">
                    <h4>Promotional Emails</h4>
                    <p>Updates on new batches and discounts</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="profile-card">
                <div className="profile-section-title">
                  <h3>Display Themes</h3>
                </div>
                <div className="preferences-list">
                  <div className="preference-item" style={{ alignItems: 'flex-start' }}>
                    <div className="pref-info">
                      <h4>Application Theme</h4>
                      <p>Customize the visual layout of Samkalp Vedhik</p>

                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <div
                          onClick={() => handleThemeChange('light')}
                          style={{
                            border: !isDarkMode ? '2px solid #F2921D' : '2px solid var(--border-color)',
                            padding: '1rem 1.5rem', borderRadius: '12px',
                            cursor: 'pointer', background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: '700',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          ☀️ Light Mode
                        </div>
                        <div
                          onClick={() => handleThemeChange('dark')}
                          style={{
                            border: isDarkMode ? '2px solid #F2921D' : '2px solid var(--border-color)',
                            padding: '1rem 1.5rem', borderRadius: '12px',
                            cursor: 'pointer', background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: '700',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          🌙 Dark Mode
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-card">
                <div className="profile-section-title">
                  <h3>Font & Typography</h3>
                </div>
                <div className="preferences-list">
                  <div className="preference-item">
                    <div className="pref-info">
                      <h4>Interface Font Size</h4>
                      <p>Adjust text size for better readability</p>
                    </div>
                    <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      {['Small', 'Standard', 'Large'].map((size) => (
                        <button
                          key={size}
                          onClick={() => {
                            const root = document.documentElement;
                            root.style.setProperty('--base-font-size', size === 'Small' ? '14px' : size === 'Large' ? '18px' : '16px');
                            localStorage.setItem('font-size', size);
                            // Re-render handled by local state if needed, but CSS var is instant
                            window.location.reload(); // Simplest way to apply across all components
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            border: 'none',
                            background: (localStorage.getItem('font-size') || 'Standard') === size ? '#F2921D' : 'transparent',
                            color: (localStorage.getItem('font-size') || 'Standard') === size ? 'white' : 'var(--text-muted)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-card">
                <div className="profile-section-title">
                  <h3>Accessibility & Motion</h3>
                </div>
                <div className="preferences-list">
                  <div className="preference-item">
                    <div className="pref-info">
                      <h4>Reduce Motion</h4>
                      <p>Minimize animations and transitions</p>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        defaultChecked={localStorage.getItem('reduce-motion') === 'true'} 
                        onChange={(e) => {
                          localStorage.setItem('reduce-motion', e.target.checked);
                          if (e.target.checked) document.documentElement.classList.add('reduce-motion');
                          else document.documentElement.classList.remove('reduce-motion');
                        }}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="preference-item">
                    <div className="pref-info">
                      <h4>High Contrast Mode</h4>
                      <p>Increase contrast for text and icons</p>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        defaultChecked={localStorage.getItem('high-contrast') === 'true'} 
                        onChange={(e) => {
                          localStorage.setItem('high-contrast', e.target.checked);
                          if (e.target.checked) document.documentElement.classList.add('high-contrast');
                          else document.documentElement.classList.remove('high-contrast');
                        }}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
