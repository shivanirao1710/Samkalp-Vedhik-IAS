import React, { useState, useEffect } from 'react';
import '../styles/shared-layout.css';
import '../styles/AdminDashboard.css';
import logo from '../images/logo.png';
import '../styles/FacultyDashboardExtended.css';
import ThemeToggle from './ThemeToggle';
import AdminProfile from './AdminProfile';
import Settings from './Settings';

const AdminDashboard = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [activeTab, setActiveTab] =
    useState('overview');

  // Faculty Creation
  const [newFaculty, setNewFaculty] =
    useState({
      name: '',
      email: '',
      password: ''
    });

  const [facultySuccess, setFacultySuccess] =
    useState(null);

  // Password Reset
  const [resetData, setResetData] =
    useState({
      userId: null,
      newPassword: ''
    });

  const [showResetModal, setShowResetModal] =
    useState(false);

  // Requests
  const [requests, setRequests] = useState([]);
  const [showRequestsModal, setShowRequestsModal] =
    useState(false);

  const [replyText, setReplyText] =
    useState('');

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const [isProfileOpen, setIsProfileOpen] =
    useState(false);

  // Batch State
  const [batches, setBatches] = useState([]);

  const [newBatch, setNewBatch] = useState({
    name: '',
    description: ''
  });

  const [expandedBatchId, setExpandedBatchId] = useState(null);
  const [expandedFacultyId, setExpandedFacultyId] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchRequests();
    fetchBatches();
  }, []);

  const fetchUsers = async () => {
    try {
      const resp = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/users`
      );

      const data = await resp.json();

      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const resp = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/requests`
      );

      if (resp.ok) {
        setRequests(await resp.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBatches = async () => {
    try {
      const resp = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/batches`
      );

      if (resp.ok) {
        const data = await resp.json();
        setBatches(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (requestId) => {
    if (!replyText) return;

    try {
      const resp = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/requests/${requestId}/reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify({
            reply: replyText
          })
        }
      );

      if (resp.ok) {
        setReplyText('');
        setSelectedRequest(null);
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();

    setFacultySuccess(null);

    try {
      const resp = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/faculty`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify({
            ...newFaculty,
            role: 'faculty'
          })
        }
      );

      if (resp.ok) {
        setFacultySuccess(
          'Faculty account created successfully!'
        );

        setNewFaculty({
          name: '',
          email: '',
          password: ''
        });

        fetchUsers();
      } else {
        const d = await resp.json();

        setError(
          d.detail ||
          'Error creating faculty'
        );
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();

    try {
      const resp = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/batches`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify(newBatch)
        }
      );

      if (resp.ok) {
        setNewBatch({
          name: '',
          description: ''
        });

        fetchBatches();

        alert(
          'Batch created successfully!'
        );
      } else {
        alert('Failed to create batch');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const handleAssignBatch = async (
    userId,
    batchId
  ) => {
    try {
      const resp = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/assign-batch`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify({
            user_id: userId,
            batch_id: batchId
              ? parseInt(batchId)
              : null
          })
        }
      );

      if (resp.ok) {
        fetchUsers();
      } else {
        alert('Failed to assign batch');
      }
    } catch (err) {
      console.error(err);
      alert(
        'Network error assigning batch'
      );
    }
  };

  const handleAssignMentor = async (userId, mentorId) => {
    try {
      const resp = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/assign-mentor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: userId,
            mentor_id: mentorId ? parseInt(mentorId) : null
          })
        }
      );

      if (resp.ok) {
        fetchUsers();
      } else {
        alert('Failed to assign mentor');
      }
    } catch (err) {
      console.error(err);
      alert('Network error assigning mentor');
    }
  };

  const handleResetPassword = async () => {
    try {
      const resp = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify({
            user_id: resetData.userId,
            new_password:
              resetData.newPassword
          })
        }
      );

      if (resp.ok) {
        alert(
          'Password reset success!'
        );

        setShowResetModal(false);
      }
    } catch (err) {
      alert('Reset failed');
    }
  };

  const handleDeleteUser = async (id) => {
    if (
      !window.confirm(
        'Are you sure? This is permanent.'
      )
    )
      return;

    try {
      await fetch(
        `${process.env.REACT_APP_API_URL}/admin/user/${id}`,
        {
          method: 'DELETE'
        }
      );

      fetchUsers();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const renderOverview = () => {
    const totalStudents = users.filter(
      (u) => u.role === 'student'
    ).length;

    const totalFaculty = users.filter(
      (u) => u.role === 'faculty'
    ).length;

    return (
      <div className="admin-overview">
        <h2 className="admin-title">
          Platform Overview
        </h2>

        <div className="admin-stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>

            <p className="stat-val">
              {users.length}
            </p>
          </div>

          <div className="stat-card">
            <h3>Students</h3>

            <p className="stat-val">
              {totalStudents}
            </p>
          </div>

          <div className="stat-card">
            <h3>Faculty</h3>

            <p className="stat-val">
              {totalFaculty}
            </p>
          </div>

          <div className="stat-card">
            <h3>Total Batches</h3>

            <p className="stat-val">
              {batches.length}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderUserTable = (
    title,
    userList,
    facultyList = [],
    showActions = true
  ) => (
    <div
      className="user-table-section"
      style={{
        marginBottom: '3rem'
      }}
    >
      <div
        className="table-header-row"
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}
      >
        <h3
          style={{
            margin: 0,
            color:
              'var(--text-main)',
            fontSize: '1.25rem'
          }}
        >
          {title} ({userList.length})
        </h3>
      </div>

      <div className="user-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>

              {title === 'Students' && (
                <>
                  <th>Assigned Batch</th>
                  <th>Assigned Mentor</th>
                </>
              )}

              {title === 'Faculty Members' && (
                <th>Assigned Students</th>
              )}

              {showActions && (
                <th>Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {userList.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    showActions
                      ? title ===
                        'Students'
                        ? 5
                        : 4
                      : title ===
                        'Students'
                        ? 4
                        : 3
                  }
                  style={{
                    textAlign:
                      'center',
                    padding: '2rem',
                    color:
                      'var(--text-muted)'
                  }}
                >
                  No{' '}
                  {title.toLowerCase()}{' '}
                  found.
                </td>
              </tr>
            ) : (
              userList.map((u) => (
                <tr key={u.id}>
                  <td className="font-bold">
                    {u.name &&
                      u.name !== 'N/A'
                      ? u.name
                      : u.email.split(
                        '@'
                      )[0]}
                  </td>

                  <td>{u.email}</td>

                  <td>
                    <span
                      className={`role-badge ${u.role}`}
                    >
                      {u.role}
                    </span>
                  </td>

                  {title ===
                    'Students' && (
                      <td>
                        <select
                          value={
                            u.batch_id ||
                            ''
                          }
                          onChange={(e) =>
                            handleAssignBatch(
                              u.id,
                              e.target.value
                            )
                          }
                          className="modal-input"
                        >
                          <option value="">
                            Unassigned
                          </option>

                          {batches.map(
                            (batch) => (
                              <option
                                key={
                                  batch.id
                                }
                                value={
                                  batch.id
                                }
                              >
                                {
                                  batch.name
                                }
                              </option>
                            )
                          )}
                        </select>
                      </td>
                    )}

                  {title === 'Students' && (
                    <td>
                      <select
                        value={u.assigned_mentor_id || ''}
                        onChange={(e) =>
                          handleAssignMentor(u.id, e.target.value)
                        }
                        className="modal-input"
                      >
                        <option value="">Unassigned</option>
                        {facultyList.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name && f.name !== 'N/A'
                              ? f.name
                              : f.email.split('@')[0]}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}

                  {title === 'Faculty Members' && (
                    <td>
                      {(() => {
                        const mentees = users.filter(
                          (stu) => stu.assigned_mentor_id === u.id
                        );
                        if (mentees.length === 0) {
                          return (
                            <span style={{ color: 'var(--text-muted)' }}>
                              No Mentees
                            </span>
                          );
                        }
                        return (
                          <div className="mentee-wrapper">
                            <button
                              className="table-btn"
                              style={{
                                background: 'var(--bg-main)',
                                color: 'var(--text-main)',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.75rem',
                                padding: '0.4rem 0.8rem'
                              }}
                              onClick={() =>
                                setExpandedFacultyId(
                                  expandedFacultyId === u.id ? null : u.id
                                )
                              }
                            >
                              {expandedFacultyId === u.id
                                ? 'Hide Students'
                                : `View ${mentees.length} Students`}
                            </button>

                            {expandedFacultyId === u.id && (
                              <div
                                style={{
                                  marginTop: '0.5rem',
                                  padding: '0.75rem',
                                  background: 'var(--bg-card)',
                                  borderRadius: '8px',
                                  border: '1px solid var(--border-color)',
                                  maxHeight: '150px',
                                  overflowY: 'auto'
                                }}
                              >
                                <ul
                                  style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.4rem'
                                  }}
                                >
                                  {mentees.map((m) => (
                                    <li
                                      key={m.id}
                                      style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--text-muted)'
                                      }}
                                    >
                                      • {m.name || m.email.split('@')[0]}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  )}

                  {showActions && (
                    <td className="actions-cell">
                      <button
                        className="table-btn reset"
                        onClick={() => {
                          setResetData({
                            ...resetData,
                            userId:
                              u.id
                          });

                          setShowResetModal(
                            true
                          );
                        }}
                      >
                        Reset Pwd
                      </button>

                      <button
                        className="table-btn delete"
                        onClick={() =>
                          handleDeleteUser(
                            u.id
                          )
                        }
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUserList = () => {
    const facultyList = users.filter(
      (u) => u.role === 'faculty'
    );

    const studentList = users.filter(
      (u) => u.role === 'student'
    );

    const adminList = users.filter(
      (u) => u.role === 'admin'
    );

    return (
      <div className="admin-user-list">
        <h2 className="admin-title">
          User Management
        </h2>

        {renderUserTable(
          'Faculty Members',
          facultyList,
          facultyList
        )}

        {renderUserTable(
          'Students',
          studentList,
          facultyList
        )}

        {adminList.length > 0 &&
          renderUserTable(
            'Administrators',
            adminList,
            facultyList,
            false
          )}
      </div>
    );
  };

  const renderAddFaculty = () => (
    <div className="admin-add-faculty">
      <h2 className="admin-title">
        Onboard New Faculty
      </h2>

      <div className="admin-form-card">
        <form
          onSubmit={handleCreateFaculty}
        >
          <div className="form-group">
            <label>Name</label>

            <input
              type="text"
              required
              value={newFaculty.name}
              onChange={(e) =>
                setNewFaculty({
                  ...newFaculty,
                  name:
                    e.target.value
                })
              }
            />
          </div>

          <div className="form-group">
            <label>
              Email Address
            </label>

            <input
              type="email"
              required
              value={newFaculty.email}
              onChange={(e) =>
                setNewFaculty({
                  ...newFaculty,
                  email:
                    e.target.value
                })
              }
            />
          </div>

          <div className="form-group">
            <label>
              Initial Password
            </label>

            <input
              type="password"
              required
              value={
                newFaculty.password
              }
              onChange={(e) =>
                setNewFaculty({
                  ...newFaculty,
                  password:
                    e.target.value
                })
              }
            />
          </div>

          {facultySuccess && (
            <div className="success-msg">
              {facultySuccess}
            </div>
          )}

          <button
            type="submit"
            className="admin-submit-btn"
          >
            Create Faculty Account
          </button>
        </form>
      </div>
    </div>
  );

  const renderBatches = () => {
    return (
      <div className="admin-batches">
        <h2 className="admin-title">
          Batch Management
        </h2>

        <div
          className="admin-form-card"
          style={{
            marginBottom: '2rem'
          }}
        >
          <h3
            style={{
              marginBottom: '1rem'
            }}
          >
            Create New Batch
          </h3>

          <form
            onSubmit={handleCreateBatch}
          >
            <div className="form-group">
              <label>
                Batch Name
              </label>

              <input
                type="text"
                required
                value={newBatch.name}
                onChange={(e) =>
                  setNewBatch({
                    ...newBatch,
                    name:
                      e.target.value
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>
                Description
              </label>

              <textarea
                value={
                  newBatch.description
                }
                onChange={(e) =>
                  setNewBatch({
                    ...newBatch,
                    description:
                      e.target.value
                  })
                }
              />
            </div>

            <button
              type="submit"
              className="admin-submit-btn"
            >
              Create Batch
            </button>
          </form>
        </div>

        <div className="user-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Batch Name</th>
                <th>Description</th>
                <th>Assigned Students</th>
              </tr>
            </thead>

            <tbody>
              {batches.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    style={{
                      textAlign: 'center'
                    }}
                  >
                    No batches created yet.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => {
                  const assignedStudents = users.filter(
                    (u) => u.batch_id === batch.id
                  );
                  return (
                    <tr key={batch.id}>
                      <td style={{ fontWeight: '700' }}>
                        {batch.name}
                      </td>

                      <td>{batch.description}</td>

                      <td>
                        {assignedStudents.length === 0 ? (
                          <span style={{ color: 'var(--text-muted)' }}>
                            No students
                          </span>
                        ) : (
                          <div className="batch-students-wrapper">
                            <button
                              className="table-btn"
                              style={{
                                background: 'var(--bg-main)',
                                color: 'var(--text-main)',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.75rem',
                                padding: '0.4rem 0.8rem'
                              }}
                              onClick={() =>
                                setExpandedBatchId(
                                  expandedBatchId === batch.id ? null : batch.id
                                )
                              }
                            >
                              {expandedBatchId === batch.id
                                ? 'Hide Students'
                                : `View ${assignedStudents.length} Students`}
                            </button>

                            {expandedBatchId === batch.id && (
                              <div
                                style={{
                                  marginTop: '1rem',
                                  padding: '1rem',
                                  background: 'var(--bg-main)',
                                  borderRadius: '8px',
                                  border: '1px solid var(--border-color)',
                                  maxHeight: '200px',
                                  overflowY: 'auto'
                                }}
                              >
                                <ul
                                  style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem'
                                  }}
                                >
                                  {assignedStudents.map((s) => (
                                    <li
                                      key={s.id}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.85rem'
                                      }}
                                    >
                                      <span
                                        style={{
                                          width: '8px',
                                          height: '8px',
                                          borderRadius: '50%',
                                          background: '#F2921D'
                                        }}
                                      />
                                      {s.name || s.email.split('@')[0]}
                                      <span
                                        style={{
                                          color: 'var(--text-muted)',
                                          fontSize: '0.75rem'
                                        }}
                                      >
                                        ({s.email})
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();

      case 'users':
        return renderUserList();

      case 'faculty-add':
        return renderAddFaculty();

      case 'batches':
        return renderBatches();

      case 'profile':
        return (
          <AdminProfile
            user={user}
            onBack={() =>
              setActiveTab(
                'overview'
              )
            }
          />
        );

      case 'settings':
        return (
          <Settings
            user={user}
            onBack={() =>
              setActiveTab(
                'overview'
              )
            }
          />
        );

      default:
        return renderOverview();
    }
  };

  return (
    <div className="admin-layout">
      <aside
        className="admin-sidebar"
        style={{
          display:
            sidebarOpen
              ? 'flex'
              : 'none'
        }}
      >
        <div
          className="admin-sidebar-logo"
          onClick={() =>
            setActiveTab(
              'overview'
            )
          }
          style={{
            cursor: 'pointer'
          }}
        >
          <img
            src={logo}
            alt="Samkalp Logo"
            className="brand-logo"
          />
        </div>

        <div
          className="admin-panel-badge"
          style={{
            backgroundColor:
              '#fff7ed',
            color: '#F2921D'
          }}
        >
          SUPER ADMIN PANEL
        </div>

        <nav className="admin-nav">
          <button
            className={`adm-nav-item ${activeTab ===
                'overview'
                ? 'active'
                : ''
              }`}
            onClick={() =>
              setActiveTab(
                'overview'
              )
            }
          >
            Dashboard
          </button>

          <button
            className={`adm-nav-item ${activeTab ===
                'users'
                ? 'active'
                : ''
              }`}
            onClick={() =>
              setActiveTab('users')
            }
          >
            Manage Users
          </button>

          <button
            className={`adm-nav-item ${activeTab ===
                'faculty-add'
                ? 'active'
                : ''
              }`}
            onClick={() =>
              setActiveTab(
                'faculty-add'
              )
            }
          >
            Add Faculty
          </button>

          <button
            className={`adm-nav-item ${activeTab ===
                'batches'
                ? 'active'
                : ''
              }`}
            onClick={() =>
              setActiveTab(
                'batches'
              )
            }
          >
            Batches
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
            onClick={onLogout}
            className="common-logout-btn"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-top-bar">
          <div style={{ flex: 1 }}>
          </div>

          <div
            className="admin-profile-section"
            style={{
              display: 'flex',
              alignItems:
                'center',
              gap: '1.5rem'
            }}
          >
            <ThemeToggle />
          </div>
        </header>

        <div
          className="admin-page-content"
          style={{
            padding: '2rem'
          }}
        >
          {renderContent()}
        </div>
      </main>

      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              Reset User Password
            </h3>

            <p>
              Enter a new password
              for user ID:{' '}
              {resetData.userId}
            </p>

            <input
              type="password"
              className="modal-input"
              value={
                resetData.newPassword
              }
              onChange={(e) =>
                setResetData({
                  ...resetData,
                  newPassword:
                    e.target.value
                })
              }
              placeholder="New Secure Password"
            />

            <div className="modal-actions">
              <button
                onClick={() =>
                  setShowResetModal(
                    false
                  )
                }
                className="modal-btn-cancel"
              >
                Cancel
              </button>

              <button
                onClick={
                  handleResetPassword
                }
                className="modal-btn-confirm"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;