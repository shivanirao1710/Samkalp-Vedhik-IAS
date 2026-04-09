import React, { useState, useEffect } from 'react';
import '../styles/AdminDashboard.css';
import logo from '../images/logo.png';
import '../styles/FacultyDashboardExtended.css'; // Use shared styles
import ThemeToggle from './ThemeToggle';

const AdminDashboard = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, faculty-add, settings
  
  // Faculty Creation State
  const [newFaculty, setNewFaculty] = useState({ name: '', email: '', password: '' });
  const [facultySuccess, setFacultySuccess] = useState(null);
  
  // Password Reset State
  const [resetData, setResetData] = useState({ userId: null, newPassword: '' });
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const resp = await fetch('http://127.0.0.1:8000/admin/users');
      const data = await resp.json();
      setUsers(data);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    setFacultySuccess(null);
    try {
      const resp = await fetch('http://127.0.0.1:8000/admin/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newFaculty, role: 'faculty' })
      });
      if (resp.ok) {
        setFacultySuccess("Faculty account created successfully!");
        setNewFaculty({ name: '', email: '', password: '' });
        fetchUsers();
      } else {
        const d = await resp.json();
        setError(d.detail || "Error creating faculty");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const handleResetPassword = async () => {
    try {
      const resp = await fetch('http://127.0.0.1:8000/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: resetData.userId, new_password: resetData.newPassword })
      });
      if (resp.ok) {
        alert("Password reset success!");
        setShowResetModal(false);
      }
    } catch (err) {
      alert("Reset failed");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure? This is permanent.")) return;
    try {
      await fetch(`http://127.0.0.1:8000/admin/user/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const renderOverview = () => {
    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalFaculty = users.filter(u => u.role === 'faculty').length;
    
    return (
      <div className="admin-overview">
        <h2 className="admin-title">Platform Overview</h2>
        <div className="admin-stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-val">{users.length}</p>
          </div>
          <div className="stat-card">
            <h3>Students</h3>
            <p className="stat-val">{totalStudents}</p>
          </div>
          <div className="stat-card">
            <h3>Faculty</h3>
            <p className="stat-val">{totalFaculty}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderUserList = () => (
    <div className="admin-user-list">
      <h2 className="admin-title">User Management</h2>
      <div className="user-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td className="font-bold">{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`role-badge ${u.role}`}>{u.role}</span>
                </td>
                <td className="actions-cell">
                  <button className="table-btn reset" onClick={() => {
                    setResetData({ ...resetData, userId: u.id });
                    setShowResetModal(true);
                  }}>Reset Pwd</button>
                  <button className="table-btn delete" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAddFaculty = () => (
    <div className="admin-add-faculty">
      <h2 className="admin-title">Onboard New Faculty</h2>
      <div className="admin-form-card">
        <form onSubmit={handleCreateFaculty}>
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              required 
              value={newFaculty.name} 
              onChange={e => setNewFaculty({...newFaculty, name: e.target.value})}
              placeholder="Full Name"
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              required 
              value={newFaculty.email} 
              onChange={e => setNewFaculty({...newFaculty, email: e.target.value})}
              placeholder="faculty@samkalp.com"
            />
          </div>
          <div className="form-group">
            <label>Initial Password</label>
            <input 
              type="password" 
              required 
              value={newFaculty.password} 
              onChange={e => setNewFaculty({...newFaculty, password: e.target.value})}
              placeholder="••••••••"
            />
          </div>
          {facultySuccess && <div className="success-msg">{facultySuccess}</div>}
          <button type="submit" className="admin-submit-btn">Create Faculty Account</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="admin-layout">
      {/* Sidebar - Matching Faculty Style */}
      <aside className="admin-sidebar" style={{ display: sidebarOpen ? 'flex' : 'none' }}>
        <div className="admin-sidebar-logo">
          <img src={logo} alt="Samkalp Logo" className="brand-logo" />
        </div>

        <div className="admin-panel-badge" style={{ backgroundColor: '#fff7ed', color: '#F2921D' }}>SUPER ADMIN PANEL</div>

        <nav className="admin-nav">
          <button 
            className={`adm-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
             <span className="adm-icon">⊞</span> Dashboard
          </button>
          <button 
            className={`adm-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
             <span className="adm-icon">👥</span> Manage Users
          </button>
          <button 
            className={`adm-nav-item ${activeTab === 'faculty-add' ? 'active' : ''}`}
            onClick={() => setActiveTab('faculty-add')}
          >
             <span className="adm-icon">＋</span> Add Faculty
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button onClick={onLogout} className="common-logout-btn">
            <span className="icon">↪</span> Sign Out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-top-bar">
          <div style={{ flex: 1 }}></div>
          <div className="admin-profile-section" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <ThemeToggle />
            <div className="adm-user-meta">
              <div className="adm-name">{user.name}</div>
              <div className="adm-role">Platform Admin</div>
            </div>
            <div className="adm-avatar" style={{ backgroundColor: '#F2921D' }}>💎</div>
          </div>
        </header>

        <div className="admin-page-content" style={{ padding: '2rem' }}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUserList()}
          {activeTab === 'faculty-add' && renderAddFaculty()}
        </div>
      </main>

      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Reset User Password</h3>
            <p>Enter a new password for user ID: {resetData.userId}</p>
            <input 
              type="password"
              className="modal-input"
              value={resetData.newPassword}
              onChange={e => setResetData({...resetData, newPassword: e.target.value})}
              placeholder="New Secure Password"
            />
            <div className="modal-actions">
              <button onClick={() => setShowResetModal(false)} className="modal-btn-cancel">Cancel</button>
              <button onClick={handleResetPassword} className="modal-btn-confirm">Update Password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
