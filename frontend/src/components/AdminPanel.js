import React, { useState } from 'react';
import '../styles/AdminPanel.css';
import logo from '../images/logo.png';

const AdminPanel = ({ user, onLogout, onBackToStudent }) => {
  const [activeTab, setActiveTab] = useState('Students');

  const menuItems = [
    { name: 'Dashboard', icon: '⊞' },
    { name: 'Students', icon: '👥' },
    { name: 'Courses', icon: '📖' },
    { name: 'Tests', icon: '📄' },
    { name: 'Live Classes', icon: '📺' },
    { name: 'Interviews', icon: '📹' },
    { name: 'Reports', icon: '📊' },
    { name: 'Settings', icon: '⚙️' },
  ];

  const stats = [
    { label: 'Total Students', value: '248', change: '+12', icon: '👥', color: '#e0f2fe' },
    { label: 'Active Courses', value: '24', change: '+2', icon: '📖', color: '#f0fdf4' },
    { label: 'Total tests', value: '156', change: '+8', icon: '📄', color: '#fff7ed' },
    { label: 'Interviews Conducted', value: '892', change: '+45', icon: '📹', color: '#f5f3ff' },
  ];

  const actions = [
    { title: 'Add Course', subtitle: 'Create new course', icon: '＋' },
    { title: 'Schedule Class', subtitle: 'Create live session', icon: '＋' },
    { title: 'Create Test', subtitle: 'Add new test', icon: '＋' },
    { title: 'Review Videos', icon: '📹', subtitle: 'Check interviews' },
  ];

  const students = [
    { id: 1, name: 'Rahul Sharma', email: 'rahul.sharma@example.com', progress: 65, tests: 12, lastActive: '2 hours ago', color: '#0ea5e9' },
    { id: 2, name: 'Priya Patel', email: 'priya.patel@example.com', progress: 82, tests: 18, lastActive: '1 day ago', color: '#0284c7' },
    { id: 3, name: 'Amit Kumar', email: 'amit.kumar@example.com', progress: 45, tests: 8, lastActive: '3 hours ago', color: '#0ea5e9' },
    { id: 4, name: 'Sneha Reddy', email: 'sneha.reddy@example.com', progress: 91, tests: 24, lastActive: '30 minutes ago', color: '#0ea5e9' },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <img src={logo} alt="Samkalp Logo" className="brand-logo" />
        </div>

        <div className="admin-panel-badge">ADMIN PANEL</div>

        <nav className="admin-nav">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`adm-nav-item ${item.name === 'Dashboard' ? 'active' : ''}`}
            >
              <span className="adm-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
           <button onClick={onBackToStudent} className="back-student-btn">
             Return to Dashboard
           </button>
           <button onClick={onLogout} className="adm-sign-out-btn">
             Logout
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-top-bar">
          <div className="admin-search">
            <span>🔍</span>
            <input type="text" placeholder="Search students, courses, tests..." />
          </div>

          <div className="admin-profile-section">
            <span className="adm-noti">🔔</span>
            <div className="adm-user-meta">
              <div className="adm-name">Admin User</div>
              <div className="adm-role">Administrator</div>
            </div>
            <div className="adm-avatar">🛡️</div>
          </div>
        </header>

        <section className="admin-content-inner">
          <div className="admin-dash-header">
            <div>
              <h1>Admin Dashboard</h1>
              <p>Manage students, courses, tests, and interviews</p>
            </div>
            <button className="global-search-btn">🔍 Search</button>
          </div>

          <div className="admin-stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="adm-stat-card">
                <div className="adm-stat-top">
                  <div className="adm-stat-icon-wrap" style={{ backgroundColor: stat.color }}>
                    {stat.icon}
                  </div>
                  <span className="adm-stat-growth">{stat.change}</span>
                </div>
                <div className="adm-stat-info">
                  <div className="adm-stat-value">{stat.value}</div>
                  <div className="adm-stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-actions-grid">
            {actions.map((action) => (
              <button key={action.title} className="adm-action-card">
                <div className="adm-action-icon">{action.icon}</div>
                <div className="adm-action-text">
                  <h3>{action.title}</h3>
                  <p>{action.subtitle}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="admin-management-section">
            <div className="admin-tabs">
              {['Students', 'Psychometric Results', 'Live Classes', 'Interview Reviews'].map(tab => (
                <button 
                  key={tab} 
                  className={`adm-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'Students' && '👥 '}
                  {tab === 'Psychometric Results' && '🧠 '}
                  {tab === 'Live Classes' && '📅 '}
                  {tab === 'Interview Reviews' && '📹 '}
                  {tab}
                </button>
              ))}
            </div>

            <div className="admin-table-container">
              <div className="table-header-row">
                <h2>Student Management</h2>
                <select className="adm-filter-select">
                  <option>All Students</option>
                </select>
              </div>

              <table className="adm-table">
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
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="adm-student-cell">
                          <div className="adm-student-avatar" style={{ backgroundColor: student.color }}>
                            {student.name.substring(0, 2).toUpperCase()}
                          </div>
                          {student.name}
                        </div>
                      </td>
                      <td>{student.email}</td>
                      <td>
                        <div className="adm-progress-wrap">
                          <div className="adm-prog-bar">
                            <div className="adm-prog-fill" style={{ width: `${student.progress}%` }}></div>
                          </div>
                          <span>{student.progress}%</span>
                        </div>
                      </td>
                      <td>{student.tests}</td>
                      <td>{student.lastActive}</td>
                      <td>
                        <button className="adm-row-action">⋮</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="adm-pagination">
                <span>Showing 4 of 248 students</span>
                <div className="adm-pagination-btns">
                  <button disabled>Previous</button>
                  <button className="active">Next</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminPanel;
