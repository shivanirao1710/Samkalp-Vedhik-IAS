import React from 'react';
import '../styles/FacultyDashboard.css';
import '../styles/Dashboard.css'; // Reuse some common sidebar styles

const FacultyDashboard = ({ user, onLogout }) => {
  const menuItems = [
    { name: 'Dashboard', icon: '⊞', active: true },
    { name: 'Students', icon: '👥' },
    { name: 'Courses', icon: '📖' },
    { name: 'Tests', icon: '📄' },
    { name: 'Live Classes', icon: '📅' },
    { name: 'Interviews', icon: '📹' },
    { name: 'Reports', icon: '📊' },
    { name: 'Settings', icon: '⚙️' },
  ];

  const stats = [
    { label: 'Total Students', value: '248', change: '+12', icon: '👥', color: '#e0f2fe' },
    { label: 'Active Courses', value: '24', change: '+2', icon: '📖', color: '#f0fdf4' },
    { label: 'Total Tests', value: '156', change: '+8', icon: '📄', color: '#fff7ed' },
    { label: 'Interviews Conducted', value: '892', change: '+45', icon: '📹', color: '#f5f3ff' },
  ];

  const actions = [
    { title: 'Add Course', subtitle: 'Create new course', icon: '＋' },
    { title: 'Schedule Class', subtitle: 'Create live session', icon: '＋' },
    { title: 'Create Test', subtitle: 'Add new test', icon: '＋' },
    { title: 'Review Videos', subtitle: 'Check interviews', icon: '📹' },
  ];

  return (
    <div className="faculty-dashboard">
      {/* Sidebar - Reusing common layout but customized */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon" style={{ background: 'var(--primary)' }}>AI</div>

          <div>
            <h1 style={{ fontSize: '1rem', marginBottom: '0' }}>Samkalp Vedhik</h1>
            <p style={{ fontSize: '0.7rem', color: '#64748b' }}>IAS Academy</p>
          </div>
        </div>

        <div className="sidebar-heading">Admin Panel</div>
        
        <nav className="nav-menu">
          {menuItems.map((item) => (
            <a 
              key={item.name} 
              href="#" 
              className={`nav-item ${item.active ? 'active' : ''}`}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              {item.name}
            </a>
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
            <input type="text" placeholder="Search students, courses, tests..." />
          </div>
          
          <div className="user-profile">
            <span style={{ fontSize: '1.2rem', cursor: 'pointer', position: 'relative' }}>
              🔔
              <span style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, background: 'var(--accent-red)', borderRadius: '50%' }}></span>

            </span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{user.name || 'Admin User'}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Administrator</div>
            </div>
            <div className="admin-badge">🛡️</div>
          </div>
        </header>

        <section className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage students, courses, tests, and interviews</p>
          </div>
          <button className="nav-item" style={{ border: '1px solid #e2e8f0', background: 'white', padding: '0.5rem 1rem'}}>
             🔍 Search
          </button>
        </section>

        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="admin-stat-card">
              <div className="admin-stat-header">
                <div className="admin-stat-icon" style={{ background: stat.color }}>{stat.icon}</div>
                <span className="admin-stat-change">{stat.change}</span>
              </div>
              <div className="admin-stat-value">{stat.value}</div>
              <div className="admin-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="action-grid">
          {actions.map((action) => (
            <button key={action.title} className="action-card">
              <div className="action-icon">{action.icon}</div>
              <div className="action-info">
                <h4>{action.title}</h4>
                <p>{action.subtitle}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="content-section">
          <div className="tabs">
            <div className="tab active">👥 Students</div>
            <div className="tab">🧠 Psychometric Results</div>
            <div className="tab">📅 Live Classes</div>
            <div className="tab">📹 Interview Reviews</div>
          </div>

          <div className="data-table-container">
            <div className="table-header">
              <h2>Student Management</h2>
              <select className="table-filter">
                <option>All Students</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Progress</th>
                  <th>Tests Completed</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ height: '60px' }}>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                    No student data available. Start by adding students or sharing registration link.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FacultyDashboard;
