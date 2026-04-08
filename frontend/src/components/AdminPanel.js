import React, { useState } from 'react';
import '../styles/AdminPanel.css';
import logo from '../images/logo.png';

const AdminPanel = ({ user, onLogout, onBackToStudent }) => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
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

  const dashboardStats = [
    { label: 'Total Students', value: '248', change: '+12', icon: '👥', color: '#e0f2fe' },
    { label: 'Active Courses', value: '24', change: '+2', icon: '📖', color: '#f0fdf4' },
    { label: 'Total tests', value: '156', change: '+8', icon: '📄', color: '#fff7ed' },
    { label: 'Interviews Conducted', value: '892', change: '+45', icon: '📹', color: '#f5f3ff' },
  ];

  const studentPageStats = [
    { label: 'Total Students', value: '245', icon: '👥', color: '#e0f2fe' },
    { label: 'Active Students', value: '198', icon: '👤', color: '#f0fdf4' },
    { label: 'New This Month', value: '24', icon: '📅', color: '#fff7ed' },
    { label: 'Inactive', value: '12', icon: '👤', color: '#fef2f2' },
  ];

  const actions = [
    { title: 'Add Course', subtitle: 'Create new course', icon: '＋' },
    { title: 'Schedule Class', subtitle: 'Create live session', icon: '＋' },
    { title: 'Create Test', subtitle: 'Add new test', icon: '＋' },
    { title: 'Review Videos', icon: '📹', subtitle: 'Check interviews' },
  ];

  const studentData = [
    { id: 1, name: 'Ananya Singh', email: 'ananya@example.com', phone: '+91 98765 43210', date: '2024-12-15', courses: '6 courses', tests: 24, status: 'Active', color: '#F2921D' },
    { id: 2, name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 98765 43211', date: '2024-12-10', courses: '4 courses', tests: 12, status: 'Active', color: '#0ea5e9' },
    { id: 3, name: 'Priya Patel', email: 'priya@example.com', phone: '+91 98765 43212', date: '2024-11-28', courses: '8 courses', tests: 32, status: 'Active', color: '#10b981' },
    { id: 4, name: 'Amit Kumar', email: 'amit@example.com', phone: '+91 98765 43213', date: '2024-11-20', courses: '2 courses', tests: 8, status: 'Inactive', color: '#64748b' },
  ];

  const renderDashboard = () => (
    <>
      <div className="admin-dash-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage students, courses, tests, and interviews</p>
        </div>
        <button className="global-search-btn">🔍 Search</button>
      </div>

      <div className="admin-stats-grid">
        {dashboardStats.map((stat) => (
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
              {studentData.map((student) => (
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
                        <div className="adm-prog-fill" style={{ width: '65%' }}></div>
                      </div>
                      <span>65%</span>
                    </div>
                  </td>
                  <td>{student.tests}</td>
                  <td>2 hours ago</td>
                  <td>
                    <button className="adm-row-action">⋮</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderStudents = () => (
    <div className="student-management-page">
      <div className="admin-dash-header">
        <div>
          <h1>Student Management</h1>
          <p>View and manage enrolled students</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        {studentPageStats.map((stat) => (
          <div key={stat.label} className="adm-stat-card">
            <div className="adm-stat-top">
              <div className="adm-stat-icon-wrap" style={{ backgroundColor: stat.color }}>
                {stat.icon}
              </div>
            </div>
            <div className="adm-stat-info">
              <div className="adm-stat-value">{stat.value}</div>
              <div className="adm-stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="student-search-bar">
        <span>🔍</span>
        <input type="text" placeholder="Search students by name, email, or phone..." />
      </div>

      <div className="admin-management-section">
        <div className="table-header-row">
          <h2>All Students</h2>
        </div>

        <table className="adm-table students-full">
          <thead>
            <tr>
              <th>STUDENT NAME</th>
              <th>CONTACT INFO</th>
              <th>ENROLLED DATE</th>
              <th>COURSES</th>
              <th>TESTS COMPLETED</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {studentData.map((student) => (
              <tr key={student.id}>
                <td>
                  <div className="adm-student-cell">
                    <div className="adm-student-avatar" style={{ backgroundColor: student.color }}>
                      {student.name.substring(0, 2).toUpperCase()}
                    </div>
                    {student.name}
                  </div>
                </td>
                <td>
                  <div className="contact-info-cell">
                    <div className="contact-item">✉️ {student.email}</div>
                    <div className="contact-item">📞 {student.phone}</div>
                  </div>
                </td>
                <td>{student.date}</td>
                <td>
                  <span className="course-count-tag">{student.courses}</span>
                </td>
                <td>{student.tests}</td>
                <td>
                  <span className={`status-pill ${student.status.toLowerCase()}`}>
                    {student.status}
                  </span>
                </td>
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
  );

  const courseStats = [
    { label: 'Total Courses', value: '18', icon: '📚', color: '#e0f2fe' },
    { label: 'Total Enrollments', value: '1,245', icon: '👥', color: '#f0fdf4' },
    { label: 'Total Hours', value: '850', icon: '⏱️', color: '#fff7ed' },
    { label: 'Draft Courses', value: '4', icon: '📝', color: '#fef2f2' },
  ];

  const adminCourseData = [
    { 
      id: 1, 
      title: 'Indian Polity & Governance', 
      author: 'Dr. Rajesh Kumar', 
      students: 245, 
      modules: 24, 
      hours: 120, 
      status: 'Published',
      image: 'course_polity_thumb_1775669670972.png'
    },
    { 
      id: 2, 
      title: 'Modern Indian History', 
      author: 'Prof. Meera Singh', 
      students: 198, 
      modules: 20, 
      hours: 100, 
      status: 'Published',
      image: 'course_history_thumb_1775669750158.png'
    },
    { 
      id: 3, 
      title: 'Indian Economy', 
      author: 'Dr. Amit Sharma', 
      students: 312, 
      modules: 28, 
      hours: 150, 
      status: 'Draft',
      image: 'course_economy_thumb_1775669777507.png'
    }
  ];

  const renderCourses = () => (
    <div className="course-management-page">
      <div className="admin-stats-grid">
        {courseStats.map((stat) => (
          <div key={stat.label} className="adm-stat-card">
            <div className="adm-stat-top">
              <div className="adm-stat-icon-wrap" style={{ backgroundColor: stat.color }}>
                {stat.icon}
              </div>
            </div>
            <div className="adm-stat-info">
              <div className="adm-stat-value">{stat.value}</div>
              <div className="adm-stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-management-section">
        <div className="table-header-row">
          <h2>All Courses</h2>
        </div>

        <div className="admin-courses-grid">
          {adminCourseData.map((course) => (
            <div key={course.id} className="admin-course-card">
              <div className="course-preview-img">
                {/* Use the dynamically generated path if possible, or a local path */}
                <img src={require(`../images/${course.image}`).default || course.image} alt={course.title} />
                <span className={`status-badge ${course.status.toLowerCase()}`}>
                  {course.status}
                </span>
              </div>
              <div className="course-card-body">
                <h3>{course.title}</h3>
                <p className="author">by {course.author}</p>
                <div className="course-mini-stats">
                  <div className="mini-item">
                    <span className="val">{course.students}</span>
                    <span className="lbl">Students</span>
                  </div>
                  <div className="mini-item">
                    <span className="val">{course.modules}</span>
                    <span className="lbl">Modules</span>
                  </div>
                  <div className="mini-item">
                    <span className="val">{course.hours}</span>
                    <span className="lbl">Hours</span>
                  </div>
                </div>
                <div className="course-card-actions">
                  <button className="edit-course-btn">
                     <span>✎</span> Edit
                  </button>
                  <button className="delete-course-btn">
                     <span>🗑️</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeMenu) {
      case 'Dashboard':
        return renderDashboard();
      case 'Students':
        return renderStudents();
      case 'Courses':
        return renderCourses();
      default:
        return renderDashboard();
    }
  };

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
              onClick={() => setActiveMenu(item.name)}
              className={`adm-nav-item ${activeMenu === item.name ? 'active' : ''}`}
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
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default AdminPanel;
