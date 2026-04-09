import React, { useState } from 'react';
import '../styles/FacultyDashboardExtended.css'; // Using the consolidated dashboard styles
import logo from '../images/logo.png';

const FacultyDashboard = ({ user, onLogout }) => {
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
          <h1>Faculty Dashboard</h1>
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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    modules: '',
    hours: '',
    category: 'General Studies',
    status: 'Draft'
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    console.log('Creating course:', formData);
    setIsCreateModalOpen(false);
  };

  const renderCreateModal = () => (
    <div className="adm-modal-overlay">
      <div className="adm-modal-content">
        <div className="adm-modal-header">
          <h2>Create New Course</h2>
          <button className="close-modal" onClick={() => setIsCreateModalOpen(false)}>×</button>
        </div>
        <form onSubmit={handleCreateSubmit} className="adm-modal-form">
          <div className="form-group">
            <label>Course Title</label>
            <input 
              type="text" 
              placeholder="e.g. Ancient Indian History" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required 
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Instructor Name</label>
              <input 
                type="text" 
                placeholder="Dr. Name" 
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option>General Studies</option>
                <option>Polity</option>
                <option>History</option>
                <option>Economy</option>
                <option>Geography</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Total Modules</label>
              <input 
                type="number" 
                placeholder="20" 
                value={formData.modules}
                onChange={(e) => setFormData({...formData, modules: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>Duration (Hours)</label>
              <input 
                type="number" 
                placeholder="100" 
                value={formData.hours}
                onChange={(e) => setFormData({...formData, hours: e.target.value})}
                required 
              />
            </div>
          </div>
          <div className="form-group">
            <label>Initial Status</label>
            <div className="status-radio-group">
              <label>
                <input 
                  type="radio" 
                  name="status" 
                  checked={formData.status === 'Draft'} 
                  onChange={() => setFormData({...formData, status: 'Draft'})} 
                /> Draft
              </label>
              <label>
                <input 
                  type="radio" 
                  name="status" 
                  checked={formData.status === 'Published'} 
                  onChange={() => setFormData({...formData, status: 'Published'})} 
                /> Published
              </label>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
            <button type="submit" className="submit-btn">Create Course</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="course-management-page">
      <div className="view-page-header">
        <div>
          <h1>Courses Management</h1>
          <p>Create and manage course content</p>
        </div>
        <button className="create-course-main-btn" onClick={() => setIsCreateModalOpen(true)}>
          <span>+</span> Create New Course
        </button>
      </div>

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
      {isCreateModalOpen && renderCreateModal()}
    </div>
  );

  const testStats = [
    { label: 'Total Tests', value: '48', icon: '📝', color: '#e0f2fe' },
    { label: 'Total Attempts', value: '1,429', icon: '👥', color: '#f0fdf4' },
    { label: 'Avg Score', value: '68.2%', icon: '⏱️', color: '#fff7ed' },
    { label: 'Draft Tests', value: '6', icon: '📋', color: '#fef2f2' },
  ];

  const adminTestData = [
    { id: 1, name: 'CSAT Paper II - Mock Test 1', type: 'Full Length', duration: '120 mins', questions: 80, attempts: 142, avgScore: '68.5%', status: 'Published' },
    { id: 2, name: 'Prelims Mock Test - Series 1', type: 'Full Length', duration: '120 mins', questions: 100, attempts: 198, avgScore: '72.3%', status: 'Published' },
    { id: 3, name: 'Polity Chapter Test - Parliament', type: 'Topic Wise', duration: '45 mins', questions: 30, attempts: 85, avgScore: '64.2%', status: 'Draft' },
  ];

  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testFormData, setTestFormData] = useState({
    name: '',
    type: 'Full Length',
    duration: '',
    questions: '',
    status: 'Draft'
  });

  const handleTestSubmit = (e) => {
    e.preventDefault();
    console.log('Creating test:', testFormData);
    setIsTestModalOpen(false);
  };

  const renderCreateTestModal = () => (
    <div className="adm-modal-overlay">
      <div className="adm-modal-content">
        <div className="adm-modal-header">
          <h2>Create New Test</h2>
          <button className="close-modal" onClick={() => setIsTestModalOpen(false)}>×</button>
        </div>
        <form onSubmit={handleTestSubmit} className="adm-modal-form">
          <div className="form-group">
            <label>Test Name</label>
            <input 
              type="text" 
              placeholder="e.g. History Prelims Series 1" 
              value={testFormData.name}
              onChange={(e) => setTestFormData({...testFormData, name: e.target.value})}
              required 
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Test Type</label>
              <select 
                value={testFormData.type}
                onChange={(e) => setTestFormData({...testFormData, type: e.target.value})}
              >
                <option>Full Length</option>
                <option>Topic Wise</option>
                <option>Previous Year</option>
                <option>Sectional</option>
              </select>
            </div>
            <div className="form-group">
              <label>Duration (Minutes)</label>
              <input 
                type="number" 
                placeholder="120" 
                value={testFormData.duration}
                onChange={(e) => setTestFormData({...testFormData, duration: e.target.value})}
                required 
              />
            </div>
          </div>
          <div className="form-group">
            <label>Number of Questions</label>
            <input 
              type="number" 
              placeholder="100" 
              value={testFormData.questions}
              onChange={(e) => setTestFormData({...testFormData, questions: e.target.value})}
              required 
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={() => setIsTestModalOpen(false)}>Cancel</button>
            <button type="submit" className="submit-btn" style={{ background: '#F2921D' }}>Create Test</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderTests = () => (
    <div className="test-management-page">
      <div className="view-page-header">
        <div>
          <h1>Tests Management</h1>
          <p>Create and manage test papers</p>
        </div>
        <button className="create-course-main-btn" onClick={() => setIsTestModalOpen(true)}>
          <span>+</span> Create New Test
        </button>
      </div>

      <div className="admin-stats-grid">
        {testStats.map((stat) => (
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
          <h2>All Tests</h2>
        </div>

        <table className="adm-table tests-table">
          <thead>
            <tr>
              <th>TEST NAME</th>
              <th>TYPE</th>
              <th>DURATION</th>
              <th>QUESTIONS</th>
              <th>ATTEMPTS</th>
              <th>AVG SCORE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {adminTestData.map((test) => (
              <tr key={test.id}>
                <td style={{ fontWeight: '700', color: '#1e293b' }}>{test.name}</td>
                <td>
                  <span className="test-type-tag">{test.type}</span>
                </td>
                <td>{test.duration}</td>
                <td>{test.questions}</td>
                <td>{test.attempts}</td>
                <td style={{ fontWeight: '700', color: '#10b981' }}>{test.avgScore}</td>
                <td>
                  <span className={`status-pill ${test.status.toLowerCase()}`}>
                    {test.status}
                  </span>
                </td>
                <td>
                  <div className="adm-actions-cell">
                    <button className="icon-btn edit">✎</button>
                    <button className="icon-btn copy">⎘</button>
                    <button className="icon-btn delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isTestModalOpen && renderCreateTestModal()}
    </div>
  );

  const liveClassStats = [
    { label: 'Upcoming Classes', value: '12', icon: '📅', color: '#e0f2fe' },
    { label: 'Total Registrations', value: '512', icon: '👥', color: '#f0fdf4' },
    { label: 'Classes Completed', value: '48', icon: '📹', color: '#fff7ed' },
    { label: 'Total Hours', value: '96', icon: '⏱️', color: '#f5f3ff' },
  ];

  const adminLiveClassData = [
    { id: 1, title: 'Indian Polity - Fundamental Rights', instructor: 'Dr. Rajesh Kumar', date: '2025-04-15', time: '10:00 AM', duration: '2 hours', registered: 145, capacity: 200, status: 'Upcoming' },
    { id: 2, title: 'Current Affairs Discussion - April Week 2', instructor: 'Prof. Meera Singh', date: '2025-04-16', time: '4:00 PM', duration: '1.5 hours', registered: 189, capacity: 200, status: 'Upcoming' },
    { id: 3, title: 'Map Reading Techniques - Special Session', instructor: 'Dr. Amit Sharma', date: '2025-04-14', time: '2:30 PM', duration: '1 hour', registered: 45, capacity: 50, status: 'Upcoming' },
  ];

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classFormData, setClassFormData] = useState({
    title: '',
    instructor: '',
    date: '',
    time: '',
    duration: '',
    capacity: '200'
  });

  const handleClassSubmit = (e) => {
    e.preventDefault();
    console.log('Scheduling class:', classFormData);
    setIsClassModalOpen(false);
  };

  const renderScheduleClassModal = () => (
    <div className="adm-modal-overlay">
      <div className="adm-modal-content">
        <div className="adm-modal-header">
          <h2>Schedule New Class</h2>
          <button className="close-modal" onClick={() => setIsClassModalOpen(false)}>×</button>
        </div>
        <form onSubmit={handleClassSubmit} className="adm-modal-form">
          <div className="form-group">
            <label>Class Title</label>
            <input 
              type="text" 
              placeholder="e.g. Economy Masterclass" 
              value={classFormData.title}
              onChange={(e) => setClassFormData({...classFormData, title: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label>Instructor</label>
            <input 
              type="text" 
              placeholder="Instructor Name" 
              value={classFormData.instructor}
              onChange={(e) => setClassFormData({...classFormData, instructor: e.target.value})}
              required 
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input 
                type="date" 
                value={classFormData.date}
                onChange={(e) => setClassFormData({...classFormData, date: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input 
                type="time" 
                value={classFormData.time}
                onChange={(e) => setClassFormData({...classFormData, time: e.target.value})}
                required 
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Duration (Hours)</label>
              <input 
                type="text" 
                placeholder="2 hours" 
                value={classFormData.duration}
                onChange={(e) => setClassFormData({...classFormData, duration: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>Capacity</label>
              <input 
                type="number" 
                value={classFormData.capacity}
                onChange={(e) => setClassFormData({...classFormData, capacity: e.target.value})}
                required 
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={() => setIsClassModalOpen(false)}>Cancel</button>
            <button type="submit" className="submit-btn" style={{ background: '#F2921D' }}>Schedule Class</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderLiveClasses = () => (
    <div className="live-classes-management">
      <div className="view-page-header">
        <div>
          <h1>Live Classes</h1>
          <p>Schedule and manage live sessions</p>
        </div>
        <button className="create-course-main-btn" onClick={() => setIsClassModalOpen(true)}>
          <span>+</span> Schedule New Class
        </button>
      </div>

      <div className="admin-stats-grid">
        {liveClassStats.map((stat) => (
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
          <h2>All Live Classes</h2>
        </div>

        <table className="adm-table live-table">
          <thead>
            <tr>
              <th>CLASS TITLE</th>
              <th>INSTRUCTOR</th>
              <th>DATE & TIME</th>
              <th>DURATION</th>
              <th>REGISTRATIONS</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {adminLiveClassData.map((live) => (
              <tr key={live.id}>
                <td style={{ fontWeight: '700', color: '#1e293b' }}>{live.title}</td>
                <td>{live.instructor}</td>
                <td>
                  <div style={{ fontWeight: '700' }}>{live.date}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{live.time}</div>
                </td>
                <td>{live.duration}</td>
                <td>
                  <div className="adm-reg-progress">
                    <div className="adm-reg-bar">
                       <div className="adm-reg-fill" style={{ width: `${(live.registered / live.capacity) * 100}%` }}></div>
                    </div>
                    <span>{live.registered}/{live.capacity}</span>
                  </div>
                </td>
                <td>
                  <span className="status-pill upcoming">Upcoming</span>
                </td>
                <td>
                  <div className="adm-actions-cell">
                    <button className="icon-btn edit">✎</button>
                    <button className="icon-btn copy" style={{ color: '#10b981', background: '#ecfdf5' }}>📹</button>
                    <button className="icon-btn delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isClassModalOpen && renderScheduleClassModal()}
    </div>
  );

  const renderReports = () => (
    <div className="reports-management-page">
      <div className="view-page-header">
        <div>
          <h1>Student Reports & Analytics</h1>
          <p>View comprehensive student performance data</p>
        </div>
        <button className="global-search-btn">
          <span>⬇</span> Export Reports
        </button>
      </div>

      <div className="admin-stats-grid">
        {dashboardStats.map((stat) => (
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
      <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontStyle: 'italic' }}>Detailed reports and analytics visualization enabled for faculty.</p>
    </div>
  );

  const renderSettings = () => (
    <div className="settings-management-page">
      <div className="view-page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage platform configurations and security</p>
        </div>
      </div>
      <div className="chart-card">
         <h3>Faculty Account Settings</h3>
         <p>Manage your account preferences and notification settings here.</p>
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
      case 'Tests':
        return renderTests();
      case 'Live Classes':
        return renderLiveClasses();
      case 'Reports':
        return renderReports();
      case 'Settings':
        return renderSettings();
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

        <div className="admin-panel-badge" style={{ backgroundColor: '#fdf2f2', color: '#dc2626' }}>FACULTY DASHBOARD</div>

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
              <div className="adm-name">{user.name || 'Faculty User'}</div>
              <div className="adm-role">Faculty Member</div>
            </div>
            <div className="adm-avatar">👨‍🏫</div>
          </div>
        </header>

        <section className="admin-content-inner">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default FacultyDashboard;
