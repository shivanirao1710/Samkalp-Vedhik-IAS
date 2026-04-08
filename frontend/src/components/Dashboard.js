import React from 'react';
import '../styles/Dashboard.css';


const Dashboard = ({ user, onLogout }) => {
  const menuItems = [
    { name: 'Dashboard', icon: '📊', active: true },
    { name: 'Courses', icon: '📖' },
    { name: 'Tests', icon: '📝' },
    { name: 'Interview', icon: '📹' },
    { name: 'Psychometric Test', icon: '🧠' },
    { name: 'AI Mentor', icon: '🎓' },
    { name: 'Live Classes', icon: '📺' },
    { name: 'AI Doubt Solver', icon: '❓' },
  ];

  const stats = [
    { label: 'Overall Progress', value: '75%', change: '+12%', icon: '🎯', color: '#e0f2fe' },
    { label: 'Learning Hours', value: '42.5h', change: '+8h', icon: '⏱️', color: '#fff7ed' },
    { label: 'Tests Completed', value: '12/18', change: '+5', icon: '📈', color: '#f0fdf4' },
    { label: 'Day Streak', value: '24', change: 'Active', icon: '📅', color: '#f5f3ff' },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">AI</div>
          <h1>Samkalp Vedhik</h1>
        </div>
        
        <nav className="nav-menu">
          {menuItems.map((item) => (
            <a 
              key={item.name} 
              href="#" 
              className={`nav-item ${item.active ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              {item.name}
            </a>
          ))}
        </nav>

        <div className="upgrade-card">
          <h3>Upgrade to Pro</h3>
          <p>Get unlimited access to all features</p>
          <button className="upgrade-btn">Upgrade Now</button>
        </div>
        
        <button 
          onClick={onLogout} 
          className="nav-item" 
          style={{ marginTop: '1rem', border: 'none', background: 'none', width: '100%', cursor: 'pointer' }}
        >
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="search-box">
            <span>🔍</span>
            <input type="text" placeholder="Search courses, tests, topics..." />
          </div>
          
          <div className="user-profile">
            <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>🔔</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{user.email.split('@')[0]}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Student</div>
            </div>
            <div className="avatar">
              {user.email.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <section className="hero-banner">
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Good Morning, {user.email.split('@')[0]}! 👋</h2>
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
              <a href="#" className="view-all">View All</a>
            </div>
            
            <div className="course-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontWeight: '700' }}>Indian Polity & Governance</h4>
                <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: '600' }}>65%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-inner" style={{ width: '65%' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                <span>4 modules</span>
                <a href="#" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>Continue →</a>
              </div>
            </div>
          </section>

          <aside>
            <div className="section-title">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Upcoming Tests</h3>
              <a href="#" className="view-all">View All</a>
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
      </main>
    </div>
  );
};

export default Dashboard;
