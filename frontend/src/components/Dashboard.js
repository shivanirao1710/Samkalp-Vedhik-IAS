import React, { useState } from 'react';
import '../styles/Dashboard.css';
import Courses from './Courses';
import Tests from './Tests';
import PsychometricTest from './PsychometricTest';
import AIMentor from './AIMentor';
import LiveClasses from './LiveClasses';
import ThemeToggle from './ThemeToggle';
import Interview from './Interview';
import StudyMaterials from './StudyMaterials';
import StudentProfile from './StudentProfile';
import Settings from './Settings';
import logo from '../images/logo.png';

const Dashboard = ({ user, onLogout, onUserUpdate }) => {
  const [currentView, setCurrentView] = useState('Dashboard');
  const [isMentorToggle, setIsMentorToggle] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'Courses', icon: '📖' },
    { name: 'Tests', icon: '📝' },
    { name: 'Study Materials', icon: '📚' },
    { name: 'Interview', icon: '📹' },
    { name: 'Psychometric Test', icon: '🧠' },
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
        return <Courses user={user} />;
      case 'Tests':
        return <Tests />;
      case 'Study Materials':
        return <StudyMaterials user={user} />;
      case 'Interview':
        return <Interview />;
      case 'Psychometric Test':
        return <PsychometricTest user={user} />;
      case 'Live Classes':
        return <LiveClasses user={user} />;
      case 'Profile':
        return <StudentProfile user={user} onUserUpdate={onUserUpdate} onLogout={onLogout} onBack={() => setCurrentView('Dashboard')} />;
      case 'Settings':
        return <Settings user={user} onBack={() => setCurrentView('Dashboard')} />;
      case 'Dashboard':
      default:
        return (
          <>
            <section className="hero-banner">
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Good Morning, {user.name || user.email.split('@')[0]}! 👋</h2>
              <p className="hero-subtitle" style={{ opacity: 0.9 }}>You're on track with your learning goals. Keep up the great work!</p>
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

                <div className="section-title" style={{ marginTop: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Live Sessions</h3>
                  <button onClick={() => setCurrentView('Live Classes')} className="view-all" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>View All</button>
                </div>
                <div className="live-item-mini" style={{ padding: '1.25rem', background: '#fff7ed', borderRadius: '16px', border: '1px solid #ffedd5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>📺</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Streaming Soon</span>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>Ethics & Case Studies</h4>
                  <p style={{ fontSize: '0.8rem', color: '#7c2d12', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                    <span>📅 Today</span>
                    <span>⏰ 04:00 PM</span>
                  </p>
                  <button
                    onClick={() => setCurrentView('Live Classes')}
                    style={{ width: '100%', marginTop: '1rem', padding: '0.6rem', background: '#F2921D', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Join Waiting Room
                  </button>
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

        <button onClick={onLogout} className="common-logout-btn">
          <span className="icon">↪</span> Sign Out
        </button>
      </aside>



      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div style={{ flex: 1 }}></div> {/* Spacer to keep profile on the right */}

          <div className="profile-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ThemeToggle />
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
                <button className="dropdown-item" onClick={() => { setCurrentView('Profile'); setIsProfileOpen(false); }}>
                  <span className="icon">👤</span> My Profile
                </button>
                <button className="dropdown-item" onClick={() => { setCurrentView('Settings'); setIsProfileOpen(false); }}>
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

      {/* Floating AI Mentor */}
      <div className="mentor-fab-container">
        {isMentorToggle && (
          <div className="mentor-floating-window">
            <AIMentor user={user} isFloating={true} onClose={() => setIsMentorToggle(false)} />
          </div>
        )}
        <button
          className={`mentor-fab ${isMentorToggle ? 'active' : ''}`}
          onClick={() => setIsMentorToggle(!isMentorToggle)}
          title="Talk to AI Mentor"
        >
          {isMentorToggle ? '✕' : '🎓'}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
