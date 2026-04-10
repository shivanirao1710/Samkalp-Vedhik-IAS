import React, { useState, useEffect } from 'react';
import '../styles/shared-layout.css';
import '../styles/AdminDashboard.css';
import logo from '../images/logo.png';
import '../styles/FacultyDashboardExtended.css';
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



  // Admin Requests State
  const [requests, setRequests] = useState([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const resp = await fetch('http://localhost:8000/admin/requests');
      if (resp.ok) setRequests(await resp.json());
    } catch (err) { console.error(err); }
  };

  const handleReply = async (requestId) => {
    if (!replyText) return;
    try {
      const resp = await fetch(`http://localhost:8000/admin/requests/${requestId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText })
      });
      if (resp.ok) {
        setReplyText('');
        setSelectedRequest(null);
        fetchRequests();
      }
    } catch (err) { console.error(err); }
  };

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

  const renderUserTable = (title, userList) => (
    <div className="user-table-section" style={{ marginBottom: '3rem' }}>
      <div className="table-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem' }}>{title} ({userList.length})</h3>
      </div>
      <div className="user-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {userList.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No {title.toLowerCase()} found.</td></tr>
            ) : (
              userList.map(u => (
                <tr key={u.id}>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUserList = () => {
    const facultyList = users.filter(u => u.role === 'faculty');
    const studentList = users.filter(u => u.role === 'student');
    const adminList = users.filter(u => u.role === 'admin');

    return (
      <div className="admin-user-list">
        <h2 className="admin-title">User Management</h2>
        
        {renderUserTable("Faculty Members", facultyList)}
        {renderUserTable("Students", studentList)}
        
        {adminList.length > 0 && renderUserTable("Administrators", adminList)}
      </div>
    );
  };

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
            
            <div className="admin-notification-bell" onClick={() => setShowRequestsModal(true)} style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '10px', width: '40px', height: '40px' }}>
              <span style={{ fontSize: '1.2rem' }}>🔔</span>
              {requests.filter(r => r.status === 'pending').length > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', padding: '2px 6px', background: '#ef4444', color: 'white', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800 }}>
                  {requests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </div>

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

      {/* Faculty Requests Modal */}
      {showRequestsModal && (
        <div className="adm-modal-overlay">
          <div className="adm-modal-content" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="adm-modal-header">
              <h2>Faculty Inquiry Requests</h2>
              <button className="close-modal" onClick={() => setShowRequestsModal(false)}>×</button>
            </div>
            <div className="adm-modal-body" style={{ padding: '0', display: 'grid', gridTemplateColumns: '300px 1fr', height: '500px' }}>
              {/* List */}
              <div style={{ borderRight: '1px solid var(--border-color)', overflowY: 'auto', background: 'var(--bg-main)' }}>
                {requests.length === 0 ? (
                  <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No requests received.</p>
                ) : (
                  requests.map(req => (
                    <div 
                      key={req.id} 
                      onClick={() => setSelectedRequest(req)}
                      style={{ 
                        padding: '1.25rem', 
                        cursor: 'pointer', 
                        borderBottom: '1px solid var(--border-color)',
                        background: selectedRequest?.id === req.id ? 'var(--bg-card)' : 'transparent',
                        borderLeft: selectedRequest?.id === req.id ? '4px solid #F2921D' : '4px solid transparent'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{req.faculty_name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(req.created_at).toLocaleDateString()}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.subject}</div>
                      {req.status === 'pending' && <span style={{ display: 'inline-block', marginTop: '0.5rem', width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></span>}
                    </div>
                  ))
                )}
              </div>

              {/* Detail & Reply */}
              <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}>
                {selectedRequest ? (
                  <>
                    <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{selectedRequest.subject}</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{selectedRequest.message}</p>
                      </div>

                      {selectedRequest.reply && (
                        <div style={{ padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#10b981', marginBottom: '0.5rem' }}>Your Reply:</span>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{selectedRequest.reply}</p>
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                      <textarea 
                        placeholder={selectedRequest.reply ? "Update your reply..." : "Type your reply to faculty..."}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-color)', resize: 'none', marginBottom: '1rem' }}
                        rows="3"
                      />
                      <button 
                        onClick={() => handleReply(selectedRequest.id)}
                        disabled={!replyText}
                        className="admin-submit-btn" 
                        style={{ margin: 0, width: '100%' }}
                      >
                        Send Reply
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    Select a request to view details
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
