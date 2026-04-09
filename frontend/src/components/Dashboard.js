import React, { useState } from 'react';
import '../styles/Dashboard.css';
import Courses from './Courses';
import Tests from './Tests';
import PsychometricTest from './PsychometricTest';
import logo from '../images/logo.png';



const Dashboard = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState('Dashboard');

  const menuItems = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'Courses', icon: '📖' },
    { name: 'Tests', icon: '📝' },
    { name: 'Interview', icon: '📹' },
    { name: 'Psychometric Test', icon: '🧠' },
    { name: 'AI Mentor', icon: '🎓' },
    { name: 'Live Classes', icon: '📺' },
    { name: 'AI Doubt Solver', icon: '❓' },
  ];

  const stats = [
    { label: 'Overall Progress', value: '75%', change: '+12%', icon: '🎯', color: '#fff7ed' },
    { label: 'Learning Hours', value: '42.5h', change: '+8h', icon: '⏱️', color: '#fff7ed' },
    { label: 'Tests Completed', value: '12/18', change: '+5', icon: '📈', color: '#f0fdf4' },
    { label: 'Day Streak', value: '24', change: 'Active', icon: '📅', color: '#f5f3ff' },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'Courses':
        return <Courses />;
      case 'Tests':
        return <Tests />;
      case 'Psychometric Test':
        return <PsychometricTest />;
      case 'Dashboard':
      default:
        return (
          <>
            <section className="hero-banner">
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Good Morning, {user.name || user.email.split('@')[0]}! 👋</h2>
              <p style={{ opacity: 0.9 }}>You're on track with your learning goals. Keep up the great work!</p>
            </section>


            <div className="stats-grid">
              {stats.map((stat) => (
                <div key={stat.label} className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon" style={{ backgroundColor: stat.color }}>{stat.icon}</div>
                    <span className="stat-change">{stat.change}</span>
                  </div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="content-row">
              <section>
                <div className="section-title">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Continue Learning</h3>
                  <button onClick={() => setCurrentView('Courses')} className="view-all" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>View All</button>
                </div>

                <div className="course-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontWeight: '700' }}>Indian Polity & Governance</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>65%</span>

                  </div>
                  <div className="progress-bar">
                    <div className="progress-inner" style={{ width: '65%' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                    <span>4 modules</span>
                    <button
                      onClick={() => setCurrentView('Courses')}
                      style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      Continue →
                    </button>

                  </div>
                </div>
              </section>

              <aside>
                <div className="section-title">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Upcoming Tests</h3>
                  <button onClick={() => setCurrentView('Tests')} className="view-all" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>View All</button>
                </div>

                <div className="test-list">
                  <div className="test-item">
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.25rem' }}>Prelims Mock Test - 1</h4>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      100 Questions • 120 mins
                    </div>
                  </div>
                  <div className="test-item">
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.25rem' }}>CSAT Practice Test</h4>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      50 Questions • 60 mins
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        );
    }
  };

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Samkalp Logo" className="brand-logo" />
        </div>



        <nav className="nav-menu">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setCurrentView(item.name)}
              className={`nav-item ${currentView === item.name ? 'active' : ''}`}
              style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <button onClick={onLogout} className="sign-out-btn">
          <span>↪</span> Sign Out
        </button>
      </aside>



      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="search-box">
            <span>🔍</span>
            <input type="text" placeholder="Search courses, tests, topics..." />
          </div>

          <div className="profile-wrapper">
            <div className="user-profile" onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <span className="notification-bell">🔔</span>
              <div className="user-info-text">
                <div className="user-name">{user.name || user.email.split('@')[0]}</div>
                <div className="user-role">Student</div>
              </div>

              <div className="avatar">
                {(user.name || user.email).substring(0, 2).toUpperCase()}
              </div>
            </div>

            {isProfileOpen && (
              <div className="profile-dropdown">
                <button className="dropdown-item">
                  <span className="icon">👤</span> My Profile
                </button>
                <button className="dropdown-item">
                  <span className="icon">⚙️</span> Settings
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-link" onClick={onLogout}>
                  <span className="icon">↪</span> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
