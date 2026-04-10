import React, { useState, useEffect } from 'react';
import '../styles/FacultyDashboardExtended.css'; // Using the consolidated dashboard styles
import ThemeToggle from './ThemeToggle';
import Settings from './Settings';
import FacultyProfile from './FacultyProfile';
import logo from '../images/logo.png';

const FacultyDashboard = ({ user, onLogout, onUserUpdate }) => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [activeTab, setActiveTab] = useState('Students');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    // Sync profile data on mount
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8000/users/me/${user.id}`);
        if (response.ok) {
          const updatedUser = await response.json();
          onUserUpdate(updatedUser);
        }
      } catch (err) {
        console.error("Failed to sync faculty profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // Study Materials State
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [isStudyMaterialModalOpen, setIsStudyMaterialModalOpen] = useState(false);
  const [studyMaterialForm, setStudyMaterialForm] = useState({ title: '', description: '', category: 'General Studies' });
  const [studyMaterialFile, setStudyMaterialFile] = useState(null);

  const menuItems = [
    { name: 'Dashboard', icon: '⊞' },
    { name: 'Students', icon: '👥' },
    { name: 'Courses', icon: '📖' },
    { name: 'Tests', icon: '📄' },
    { name: 'Live Classes', icon: '📺' },
    { name: 'Study Materials', icon: '📚' },
    { name: 'Interviews', icon: '📹' },
    { name: 'Reports', icon: '📊' },
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
    { title: 'Add Course', subtitle: 'Create new course', icon: '＋', target: 'Courses', trigger: () => setIsCreateModalOpen(true) },
    { title: 'Schedule Class', subtitle: 'Create live session', icon: '＋', target: 'Live Classes' },
    { title: 'Create Test', subtitle: 'Add new test', icon: '＋', target: 'Tests', trigger: () => setIsTestModalOpen(true) },
    { title: 'Review Videos', icon: '📹', subtitle: 'Check interviews', target: 'Interviews' },
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
          <button
            key={action.title}
            className="adm-action-card"
            onClick={() => {
              setActiveMenu(action.target);
              if (action.trigger) action.trigger();
            }}
          >
            <div className="adm-action-icon">{action.icon}</div>
            <div className="adm-action-text">
              <h3>{action.title}</h3>
              <p>{action.subtitle}</p>
            </div>
          </button>
        ))}
      </div>
    </>
  );

  const renderStudents = () => (
    <div className="student-management-page">
      <div className="admin-dash-header">

        <div style={{ flex: 1 }}>
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
    status: 'Draft',
    description: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveCourses, setLiveCourses] = useState([]);

  useEffect(() => {
    fetchLiveCourses();
    fetchStudyMaterials();
  }, []);

  const fetchStudyMaterials = async () => {
    try {
      const res = await fetch('http://localhost:8000/study-materials/');
      setStudyMaterials(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleStudyMaterialSubmit = async (e) => {
    e.preventDefault();
    if (!studyMaterialFile) {
      alert("Please select a file.");
      return;
    }
    const fd = new FormData();
    fd.append('title', studyMaterialForm.title);
    fd.append('description', studyMaterialForm.description);
    fd.append('category', studyMaterialForm.category);
    fd.append('file', studyMaterialFile);

    try {
      const res = await fetch('http://localhost:8000/study-materials/', { method: 'POST', body: fd });
      if (res.ok) {
        setIsStudyMaterialModalOpen(false);
        setStudyMaterialFile(null);
        setStudyMaterialForm({ title: '', description: '', category: 'General Studies' });
        fetchStudyMaterials();
      } else {
        alert("Failed to upload material");
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`http://localhost:8000/study-materials/${id}`, { method: 'DELETE' });
      if (res.ok) fetchStudyMaterials();
    } catch (err) { console.error(err); }
  };

  const fetchLiveCourses = async () => {
    try {
      const res = await fetch('http://localhost:8000/courses/');
      const data = await res.json();
      setLiveCourses(data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description || formData.category);
      fd.append('modules', formData.modules || 0);
      fd.append('lessons', formData.hours || 0);
      fd.append('status', formData.status === 'Published' ? 'in_progress' : 'not_started');
      fd.append('progress', 0);
      if (thumbnailFile) fd.append('thumbnail', thumbnailFile);

      const res = await fetch('http://localhost:8000/courses/', {
        method: 'POST',
        body: fd
      });

      if (res.ok) {
        alert('Course created successfully! It is now visible in the Student Dashboard.');
        setIsCreateModalOpen(false);
        setFormData({ title: '', author: '', modules: '', hours: '', category: 'General Studies', status: 'Draft', description: '' });
        setThumbnailFile(null);
        setThumbnailPreview(null);
        fetchLiveCourses();
      } else {
        const err = await res.json();
        alert('Error: ' + (err.detail || 'Failed to create course'));
      }
    } catch (error) {
      console.error('Course creation error:', error);
      alert('Failed to connect to backend');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Edit & Delete state ──────────────────────────────────────────
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '', description: '', modules: '', hours: '', status: 'Draft'
  });
  const [editThumbnailFile, setEditThumbnailFile] = useState(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const openEditModal = (course) => {
    setEditCourse(course);
    const statusLabel = course.status === 'in_progress' ? 'Published' : 'Draft';
    setEditFormData({
      title: course.title || '',
      description: course.description || '',
      modules: course.modules || '',
      hours: course.lessons || '',
      status: statusLabel
    });
    // Show existing thumbnail as preview
    if (course.image_url) {
      const src = course.image_url.startsWith('/static')
        ? `http://localhost:8000${course.image_url}`
        : course.image_url;
      setEditThumbnailPreview(src);
    } else {
      setEditThumbnailPreview(null);
    }
    setEditThumbnailFile(null);
    setIsEditModalOpen(true);
  };

  const handleEditThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditThumbnailFile(file);
    setEditThumbnailPreview(URL.createObjectURL(file));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editCourse) return;
    setIsEditSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', editFormData.title);
      fd.append('description', editFormData.description);
      fd.append('modules', editFormData.modules || 0);
      fd.append('lessons', editFormData.hours || 0);
      fd.append('status', editFormData.status === 'Published' ? 'in_progress' : 'not_started');
      fd.append('progress', editCourse.progress || 0);
      if (editThumbnailFile) fd.append('thumbnail', editThumbnailFile);

      const res = await fetch(`http://localhost:8000/courses/${editCourse.id}`, {
        method: 'PUT',
        body: fd
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        setEditCourse(null);
        fetchLiveCourses();
      } else {
        const err = await res.json();
        alert('Error: ' + (err.detail || 'Failed to update course'));
      }
    } catch (error) {
      console.error('Edit error:', error);
      alert('Failed to connect to backend');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDeleteCourse = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`http://localhost:8000/courses/${course.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLiveCourses();
      } else {
        const err = await res.json();
        alert('Error: ' + (err.detail || 'Failed to delete course'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to connect to backend');
    }
  };

  const renderEditModal = () => (
    <div className="adm-modal-overlay">
      <div className="adm-modal-content" style={{ maxWidth: '640px' }}>
        <div className="adm-modal-header">
          <h2>Edit Course</h2>
          <button className="close-modal" onClick={() => setIsEditModalOpen(false)}>×</button>
        </div>
        <form onSubmit={handleEditSubmit} className="adm-modal-form">

          {/* Thumbnail */}
          <div className="form-group">
            <label>Course Thumbnail</label>
            <div
              className="thumbnail-upload-zone"
              onClick={() => document.getElementById('edit-thumbnail-input').click()}
              style={{
                border: '2px dashed #F2921D',
                borderRadius: '14px',
                padding: editThumbnailPreview ? '0' : '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                background: editThumbnailPreview ? 'transparent' : '#fffbf5',
                position: 'relative',
                minHeight: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {editThumbnailPreview ? (
                <>
                  <img
                    src={editThumbnailPreview}
                    alt="Thumbnail preview"
                    style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '12px', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', borderRadius: '12px', opacity: 0, transition: 'opacity 0.2s'
                  }} className="thumb-hover-overlay">
                    <span style={{ color: '#fff', fontWeight: 700 }}>🖼️ Change Image</span>
                  </div>
                </>
              ) : (
                <div>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🖼️</div>
                  <div style={{ fontWeight: 600, color: '#F2921D' }}>Click to upload thumbnail</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>PNG, JPG, WEBP up to 5MB</div>
                </div>
              )}
            </div>
            <input
              id="edit-thumbnail-input"
              type="file"
              accept="image/*"
              onChange={handleEditThumbnailChange}
              style={{ display: 'none' }}
            />
          </div>

          <div className="form-group">
            <label>Course Title</label>
            <input
              type="text"
              placeholder="e.g. Ancient Indian History"
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="2"
              placeholder="Brief description of the course..."
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', resize: 'vertical', fontFamily: 'inherit', fontSize: '1rem', outline: 'none' }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Total Modules</label>
              <input
                type="number"
                placeholder="20"
                value={editFormData.modules}
                onChange={(e) => setEditFormData({ ...editFormData, modules: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Duration (Hours)</label>
              <input
                type="number"
                placeholder="100"
                value={editFormData.hours}
                onChange={(e) => setEditFormData({ ...editFormData, hours: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <div className="status-radio-group">
              <label>
                <input
                  type="radio" name="edit-status"
                  checked={editFormData.status === 'Draft'}
                  onChange={() => setEditFormData({ ...editFormData, status: 'Draft' })}
                /> Draft
              </label>
              <label>
                <input
                  type="radio" name="edit-status"
                  checked={editFormData.status === 'Published'}
                  onChange={() => setEditFormData({ ...editFormData, status: 'Published' })}
                /> Published
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={isEditSubmitting}
              style={{ background: 'linear-gradient(135deg, #F2921D 0%, #D93425 100%)' }}>
              {isEditSubmitting ? 'Saving...' : '✓ Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderCreateModal = () => (
    <div className="adm-modal-overlay">
      <div className="adm-modal-content" style={{ maxWidth: '640px' }}>
        <div className="adm-modal-header">
          <h2>Create New Course</h2>
          <button className="close-modal" onClick={() => setIsCreateModalOpen(false)}>×</button>
        </div>
        <form onSubmit={handleCreateSubmit} className="adm-modal-form">

          {/* Thumbnail Upload */}
          <div className="form-group">
            <label>Course Thumbnail</label>
            <div
              className="thumbnail-upload-zone"
              onClick={() => document.getElementById('course-thumbnail-input').click()}
              style={{
                border: '2px dashed #F2921D',
                borderRadius: '14px',
                padding: thumbnailPreview ? '0' : '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                background: thumbnailPreview ? 'transparent' : '#fffbf5',
                position: 'relative',
                minHeight: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {thumbnailPreview ? (
                <>
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '12px', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', borderRadius: '12px', opacity: 0,
                    transition: 'opacity 0.2s'
                  }}
                    className="thumb-hover-overlay"
                  >
                    <span style={{ color: '#fff', fontWeight: 700 }}>🖼️ Change Image</span>
                  </div>
                </>
              ) : (
                <div>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🖼️</div>
                  <div style={{ fontWeight: 600, color: '#F2921D' }}>Click to upload thumbnail</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>PNG, JPG, WEBP up to 5MB</div>
                </div>
              )}
            </div>
            <input
              id="course-thumbnail-input"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              style={{ display: 'none' }}
            />
          </div>

          <div className="form-group">
            <label>Course Title</label>
            <input
              type="text"
              placeholder="e.g. Ancient Indian History"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="2"
              placeholder="Brief description of the course..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Instructor Name</label>
              <input
                type="text"
                placeholder="Dr. Name"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, modules: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Duration (Hours)</label>
              <input
                type="number"
                placeholder="100"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
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
                  onChange={() => setFormData({ ...formData, status: 'Draft' })}
                /> Draft
              </label>
              <label>
                <input
                  type="radio"
                  name="status"
                  checked={formData.status === 'Published'}
                  onChange={() => setFormData({ ...formData, status: 'Published' })}
                /> Published
              </label>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="course-management-page">
      <div className="view-page-header">

        <div style={{ flex: 1 }}>
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
          {liveCourses.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <p style={{ fontWeight: 600 }}>No courses yet. Click "Create New Course" to add one!</p>
            </div>
          )}
          {liveCourses.map((course) => {
            const thumbSrc = course.image_url
              ? (course.image_url.startsWith('/static')
                ? `http://localhost:8000${course.image_url}`
                : course.image_url)
              : null;
            const statusLabel = course.status === 'in_progress' ? 'Published' : course.status === 'completed' ? 'Completed' : 'Draft';
            return (
              <div key={course.id} className="admin-course-card">
                <div className="course-preview-img" style={!thumbSrc ? { background: 'linear-gradient(135deg, #F2921D 0%, #f59e0b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}}>
                  {thumbSrc ? (
                    <img src={thumbSrc} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '3rem' }}>📖</span>
                  )}
                  <span className={`status-badge ${statusLabel.toLowerCase()}`}>
                    {statusLabel}
                  </span>
                </div>
                <div className="course-card-body">
                  <h3>{course.title}</h3>
                  <p className="author" style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{course.description || 'No description'}</p>
                  <div className="course-mini-stats">
                    <div className="mini-item">
                      <span className="val">{course.modules}</span>
                      <span className="lbl">Modules</span>
                    </div>
                    <div className="mini-item">
                      <span className="val">{course.lessons}</span>
                      <span className="lbl">Hours</span>
                    </div>
                    <div className="mini-item">
                      <span className="val">{course.progress}%</span>
                      <span className="lbl">Progress</span>
                    </div>
                  </div>
                  <div className="course-card-actions">
                    <button className="edit-course-btn" onClick={() => openEditModal(course)}>
                      <span>✎</span> Edit
                    </button>
                    <button className="delete-course-btn" onClick={() => handleDeleteCourse(course)}>
                      <span>🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {isCreateModalOpen && renderCreateModal()}
      {isEditModalOpen && renderEditModal()}
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
  const [testModalStep, setTestModalStep] = useState(1); // 1: Info, 2: Questions
  const [testFormData, setTestFormData] = useState({
    name: '',
    type: 'Full Length',
    duration: '',
    questions: [],
    status: 'Draft'
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    explanation: '',
    options: [
      { text: '', is_correct: true },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false }
    ]
  });

  const addQuestionToTest = () => {
    if (!currentQuestion.text || currentQuestion.options.some(opt => !opt.text)) {
      alert("Please fill in question text and all options");
      return;
    }
    setTestFormData({
      ...testFormData,
      questions: [...testFormData.questions, currentQuestion]
    });
    // Reset current question
    setCurrentQuestion({
      text: '',
      explanation: '',
      options: [
        { text: '', is_correct: true },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false }
      ]
    });
  };

  const handleTestSubmit = async (e) => {
    e.preventDefault();

    let submissionQuestions = [...testFormData.questions];

    // Check if there's a typed question that wasn't added yet
    if (currentQuestion.text && !submissionQuestions.find(q => q.text === currentQuestion.text)) {
      const confirmAdd = window.confirm("You have a question typed but not added. Would you like to add it before submitting?");
      if (confirmAdd) {
        if (currentQuestion.options.some(opt => !opt.text)) {
          alert("Please fill in all options for the current question before adding it.");
          return;
        }
        submissionQuestions.push(currentQuestion);
      }
    }

    if (submissionQuestions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/tests/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: testFormData.name,
          category: testFormData.type,
          duration_mins: parseInt(testFormData.duration),
          questions: submissionQuestions
        })
      });

      if (response.ok) {
        alert("Test created successfully!");
        setIsTestModalOpen(false);
        setTestModalStep(1);
        setTestFormData({
          name: '',
          type: 'Full Length',
          duration: '',
          questions: [],
          status: 'Draft'
        });
      } else {
        const err = await response.json();
        alert("Error: " + (err.detail || "Failed to create test"));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to connect to backend");
    }
  };

  const renderCreateTestModal = () => (
    <div className="adm-modal-overlay">
      <div className="adm-modal-content" style={{ maxWidth: testModalStep === 2 ? '800px' : '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="adm-modal-header">
          <h2>{testModalStep === 1 ? 'Step 1: Test Details' : 'Step 2: Add Questions'}</h2>
          <button className="close-modal" onClick={() => { setIsTestModalOpen(false); setTestModalStep(1); }}>×</button>
        </div>

        {testModalStep === 1 ? (
          <div className="adm-modal-form">
            <div className="form-group">
              <label>Test Name</label>
              <input
                type="text"
                placeholder="e.g. History Prelims Series 1"
                value={testFormData.name}
                onChange={(e) => setTestFormData({ ...testFormData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Test Type</label>
                <select
                  value={testFormData.type}
                  onChange={(e) => setTestFormData({ ...testFormData, type: e.target.value })}
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
                  onChange={(e) => setTestFormData({ ...testFormData, duration: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={() => setIsTestModalOpen(false)}>Cancel</button>
              <button
                type="button"
                className="submit-btn"
                style={{ background: '#F2921D' }}
                onClick={() => setTestModalStep(2)}
                disabled={!testFormData.name || !testFormData.duration}
              >
                Next: Add Questions
              </button>
            </div>
          </div>
        ) : (
          <div className="adm-modal-form">
            <div className="added-questions-list" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Added Questions ({testFormData.questions.length})</strong>
              {testFormData.questions.length === 0 && <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No questions added yet.</p>}
              {testFormData.questions.map((q, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                    {idx + 1}. {q.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newQs = [...testFormData.questions];
                      newQs.splice(idx, 1);
                      setTestFormData({ ...testFormData, questions: newQs });
                    }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="question-entry-zone" style={{ border: '1.5px dashed #F2921D', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', background: '#fffefc' }}>
              <div className="form-group">
                <label style={{ color: '#F2921D' }}>Add New Question</label>
                <textarea
                  style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #F2921D' }}
                  rows="3"
                  value={currentQuestion.text}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                  placeholder="Enter the question here..."
                />
              </div>

              <div className="options-entry-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {currentQuestion.options.map((opt, idx) => (
                  <div key={idx} className="opt-input-wrap" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="radio"
                      name="correct-opt"
                      checked={opt.is_correct}
                      onChange={() => {
                        const newOpts = currentQuestion.options.map((o, i) => ({ ...o, is_correct: i === idx }));
                        setCurrentQuestion({ ...currentQuestion, options: newOpts });
                      }}
                    />
                    <input
                      type="text"
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...currentQuestion.options];
                        newOpts[idx].text = e.target.value;
                        setCurrentQuestion({ ...currentQuestion, options: newOpts });
                      }}
                      style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #e2e8f0' }}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addQuestionToTest}
                style={{ width: '100%', padding: '0.75rem', marginTop: '1.5rem', background: '#f1f5f9', border: 'none', borderRadius: '10px', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
              >
                + Add Question to List
              </button>
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={() => setTestModalStep(1)}>Back</button>
              <button
                type="button"
                className="submit-btn"
                style={{ background: '#10b981' }}
                onClick={handleTestSubmit}
              >
                Create Final Test ({testFormData.questions.length} Qs)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const [fetchedTests, setFetchedTests] = useState([]);
  const [isManagingQuestions, setIsManagingQuestions] = useState(false);
  const [testToManage, setTestToManage] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch('http://localhost:8000/tests/');
      const data = await response.json();
      setFetchedTests(data);
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };

  const manageQuestions = async (test) => {
    setTestToManage(test);
    setIsManagingQuestions(true);
    try {
      const response = await fetch(`http://localhost:8000/tests/${test.id}/questions`);
      const data = await response.json();
      setTestQuestions(data);
    } catch (error) {
      console.error("Error fetching test questions:", error);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const response = await fetch(`http://localhost:8000/tests/questions/${questionId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setTestQuestions(testQuestions.filter(q => q.id !== questionId));
        fetchTests(); // Refresh test list to update question count
      } else {
        alert("Failed to delete question");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm("Are you sure you want to delete this entire test? This will remove all questions and cannot be undone.")) return;
    try {
      const response = await fetch(`http://localhost:8000/tests/${testId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchTests();
      } else {
        alert("Failed to delete test");
      }
    } catch (error) {
      console.error("Delete test error:", error);
    }
  };

  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] = useState(false);

  const openEditQuestion = (question) => {
    setEditingQuestion({
      ...question,
      options: question.options.map(o => ({ ...o })) // Clone options
    });
    setIsEditQuestionModalOpen(true);
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/tests/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: editingQuestion.text,
          explanation: editingQuestion.explanation,
          options: editingQuestion.options
        })
      });

      if (response.ok) {
        setIsEditQuestionModalOpen(false);
        // Refresh question list
        const refreshed = await fetch(`http://localhost:8000/tests/${testToManage.id}/questions`);
        const data = await refreshed.json();
        setTestQuestions(data);
      } else {
        alert("Failed to update question");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const renderEditQuestionModal = () => (
    <div className="adm-modal-overlay">
      <div className="adm-modal-content" style={{ maxWidth: '800px' }}>
        <div className="adm-modal-header">
          <h2>Edit Question</h2>
          <button className="close-modal" onClick={() => setIsEditQuestionModalOpen(false)}>×</button>
        </div>
        <form onSubmit={handleUpdateQuestion} className="adm-modal-form">
          <div className="form-group">
            <label>Question Text</label>
            <textarea
              style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}
              rows="3"
              value={editingQuestion.text}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
              required
            />
          </div>
          <div className="options-entry-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {editingQuestion.options.map((opt, idx) => (
              <div key={idx} className="opt-input-wrap" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="edit-correct-opt"
                  checked={opt.is_correct}
                  onChange={() => {
                    const newOpts = editingQuestion.options.map((o, i) => ({ ...o, is_correct: i === idx }));
                    setEditingQuestion({ ...editingQuestion, options: newOpts });
                  }}
                />
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => {
                    const newOpts = [...editingQuestion.options];
                    newOpts[idx].text = e.target.value;
                    setEditingQuestion({ ...editingQuestion, options: newOpts });
                  }}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #e2e8f0' }}
                  required
                />
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={() => setIsEditQuestionModalOpen(false)}>Cancel</button>
            <button type="submit" className="submit-btn" style={{ background: '#F2921D' }}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderManageQuestionsView = () => (
    <div className="test-management-page">
      <div className="view-page-header">
        <button
          onClick={() => setIsManagingQuestions(false)}
          className="back-btn"
          style={{
            background: '#F2921D',
            border: 'none',
            padding: '0.65rem 1.2rem',
            borderRadius: '10px',
            cursor: 'pointer',
            marginRight: '1.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            fontWeight: 'bold',
            color: '#ffffff',
            boxShadow: '0 2px 4px rgba(242, 146, 29, 0.2)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          ← Back to Tests
        </button>
        <div style={{ flex: 1 }}>
          <h1>Managing: {testToManage.title}</h1>
          <p>{testQuestions.length} Questions currently in this test paper</p>
        </div>
      </div>

      <div className="admin-management-section" style={{ marginTop: '2rem' }}>
        <div className="questions-grid-detailed" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {testQuestions.map((q, idx) => (
            <div key={q.id} className="detailed-question-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '700' }}>Q{idx + 1}: {q.text}</h4>
                  <div className="options-display-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{ padding: '0.75rem', borderRadius: '10px', background: opt.is_correct ? '#f0fdf4' : '#f8fafc', border: opt.is_correct ? '1.5px solid #22c55e' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: '700', color: opt.is_correct ? '#16a34a' : '#64748b' }}>{String.fromCharCode(65 + oIdx)}</span>
                        <span>{opt.text}</span>
                        {opt.is_correct && <span style={{ marginLeft: 'auto', backgroundColor: '#22c55e', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem' }}>Correct</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginLeft: '2rem' }}>
                  <button
                    onClick={() => openEditQuestion(q)}
                    style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', width: '40px', height: '40px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Edit Question"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    style={{ background: '#fee2e2', color: '#ef4444', border: 'none', width: '40px', height: '40px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Delete Question"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
          {testQuestions.length === 0 && <p style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '166px', border: '1.5px dashed #e2e8f0' }}>No questions found in this test.</p>}
        </div>
      </div>
      {isEditQuestionModalOpen && renderEditQuestionModal()}
    </div>
  );

  const renderTests = () => {
    if (isManagingQuestions) return renderManageQuestionsView();

    return (
      <div className="test-management-page">
        <div className="view-page-header">
          <div style={{ flex: 1 }}>
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
            <h2>All Tests ({fetchedTests.length})</h2>
          </div>

          <table className="adm-table tests-table">
            <thead>
              <tr>
                <th>TEST NAME</th>
                <th>TYPE</th>
                <th>DURATION</th>
                <th>QUESTIONS</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {fetchedTests.map((test) => (
                <tr key={test.id}>
                  <td style={{ fontWeight: '700', color: '#1e293b' }}>{test.title}</td>
                  <td>
                    <span className="test-type-tag">{test.category}</span>
                  </td>
                  <td>{test.duration_mins} mins</td>
                  <td>{test.total_questions}</td>
                  <td>
                    <span className={`status-pill ${test.status?.toLowerCase() || 'published'}`}>
                      {test.status || 'Published'}
                    </span>
                  </td>
                  <td>
                    <div className="adm-actions-cell">
                      <button className="icon-btn edit" onClick={() => manageQuestions(test)} title="Manage Questions">✎</button>
                      <button className="icon-btn delete" onClick={() => handleDeleteTest(test.id)} title="Delete Test">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {fetchedTests.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No tests created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {isTestModalOpen && renderCreateTestModal()}
      </div>
    );
  };

  const liveClassStats = [
    { label: 'Upcoming Classes', value: '12', icon: '📅', color: '#e0f2fe' },
    { label: 'Total Registrations', value: '512', icon: '👥', color: '#f0fdf4' },
    { label: 'Classes Completed', value: '48', icon: '📹', color: '#fff7ed' },
    { label: 'Total Hours', value: '96', icon: '⏱️', color: '#f5f3ff' },
  ];

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [liveClasses, setLiveClasses] = useState([]);
  const [classFormData, setClassFormData] = useState({
    title: '',
    instructor: '',
    date: '',
    time: '',
    duration: '',
    capacity: '200',
    meeting_link: ''
  });

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    try {
      const resp = await fetch('http://localhost:8000/live-classes/');
      const data = await resp.json();
      setLiveClasses(data);
    } catch (err) {
      console.error("Error fetching live classes:", err);
    }
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/live-classes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classFormData)
      });
      if (response.ok) {
        setIsClassModalOpen(false);
        setClassFormData({ title: '', instructor: '', date: '', time: '', duration: '', capacity: '200' });
        fetchLiveClasses();
      } else {
        alert("Failed to schedule class");
      }
    } catch (err) {
      console.error("Error scheduling class:", err);
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm("Delete this scheduled class?")) return;
    try {
      await fetch(`http://localhost:8000/live-classes/${id}`, { method: 'DELETE' });
      fetchLiveClasses();
    } catch (err) {
      console.error("Error deleting class:", err);
    }
  };

  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);
  const [editClassFormData, setEditClassFormData] = useState({
    title: '', instructor: '', date: '', time: '', duration: '', capacity: '200', meeting_link: ''
  });

  const openEditClassModal = (live) => {
    setEditingClassId(live.id);
    setEditClassFormData({
      title: live.title,
      instructor: live.instructor,
      date: live.date,
      time: live.time,
      duration: live.duration,
      capacity: live.capacity,
      meeting_link: live.meeting_link || ''
    });
    setIsEditClassModalOpen(true);
  };

  const handleEditClassSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/live-classes/${editingClassId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editClassFormData)
      });
      if (response.ok) {
        setIsEditClassModalOpen(false);
        fetchLiveClasses();
      } else {
        alert("Failed to update class");
      }
    } catch (err) {
      console.error("Error updating class:", err);
    }
  };

  const renderEditClassModal = () => (
    <div className="adm-modal-overlay">
      <div className="adm-modal-content" style={{ maxWidth: '900px' }}>
        <div className="adm-modal-header" style={{ borderBottom: 'none', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Edit Scheduled Class</h2>
          <button className="close-modal" onClick={() => setIsEditClassModalOpen(false)}>×</button>
        </div>
        <form onSubmit={handleEditClassSubmit} className="adm-modal-form">
          <div className="form-group">
            <label style={{ fontWeight: '700', marginBottom: '0.75rem' }}>Class Title</label>
            <input
              type="text"
              placeholder="e.g. Economy Masterclass"
              value={editClassFormData.title}
              onChange={(e) => setEditClassFormData({ ...editClassFormData, title: e.target.value })}
              required
              style={{ background: '#f8fafc', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}
            />
          </div>
          <div className="form-group">
            <label style={{ fontWeight: '700', marginBottom: '0.75rem' }}>Instructor</label>
            <input
              type="text"
              placeholder="Instructor Name"
              value={editClassFormData.instructor}
              onChange={(e) => setEditClassFormData({ ...editClassFormData, instructor: e.target.value })}
              required
              style={{ background: '#f8fafc', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}
            />
          </div>
          <div className="form-group">
            <label style={{ fontWeight: '700', marginBottom: '0.75rem' }}>Meeting Link</label>
            <input
              type="url"
              placeholder="https://zoom.us/..."
              value={editClassFormData.meeting_link}
              onChange={(e) => setEditClassFormData({ ...editClassFormData, meeting_link: e.target.value })}
              required
              style={{ background: '#f8fafc', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}
            />
          </div>
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label style={{ fontWeight: '700', marginBottom: '0.75rem' }}>Date</label>
              <input
                type="date"
                value={editClassFormData.date}
                onChange={(e) => setEditClassFormData({ ...editClassFormData, date: e.target.value })}
                required
                style={{ background: '#f8fafc', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontWeight: '700', marginBottom: '0.75rem' }}>Time</label>
              <input
                type="time"
                value={editClassFormData.time}
                onChange={(e) => setEditClassFormData({ ...editClassFormData, time: e.target.value })}
                required
                style={{ background: '#f8fafc', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}
              />
            </div>
          </div>
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="form-group">
              <label style={{ fontWeight: '700', marginBottom: '0.75rem' }}>Duration (Hours)</label>
              <input
                type="number"
                step="0.5"
                value={editClassFormData.duration}
                onChange={(e) => setEditClassFormData({ ...editClassFormData, duration: e.target.value })}
                required
                style={{ background: '#f8fafc', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontWeight: '700', marginBottom: '0.75rem' }}>Capacity</label>
              <input
                type="number"
                value={editClassFormData.capacity}
                onChange={(e) => setEditClassFormData({ ...editClassFormData, capacity: e.target.value })}
                required
                style={{ background: '#f8fafc', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}
              />
            </div>
          </div>
          <div className="modal-actions" style={{ marginTop: '2.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <button type="button" className="cancel-btn" onClick={() => setIsEditClassModalOpen(false)} style={{ padding: '1rem 2rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white', fontWeight: 'bold', color: '#64748b' }}>Cancel</button>
            <button type="submit" className="submit-btn" style={{ flex: 1, padding: '1.15rem', background: '#F2921D', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '800' }}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderScheduleClassModal = () => (
    <div className="adm-modal-overlay">
      <div className="adm-modal-content" style={{ maxWidth: '900px' }}>
        <div className="adm-modal-header" style={{ borderBottom: 'none', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Schedule New Class</h2>
          <button className="close-modal" onClick={() => setIsClassModalOpen(false)}>×</button>
        </div>
        <form onSubmit={handleClassSubmit} className="adm-modal-form">
          <div className="form-group">
            <label style={{ fontWeight: '700', marginBottom: '0.75rem' }}>Class Title</label>
            <input
              type="text"
              placeholder="e.g. Economy Masterclass"
              value={classFormData.title}
              onChange={(e) => setClassFormData({ ...classFormData, title: e.target.value })}
              required
              style={{ background: '#f8fafc', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}
            />
          </div>
          <div className="form-group">
            <label style={{ fontWeight: '700', marginBottom: '0.75rem' }}>Instructor</label>
            <input
              type="text"
              placeholder="Instructor Name"
              value={classFormData.instructor}
              onChange={(e) => setClassFormData({ ...classFormData, instructor: e.target.value })}
              required
              style={{ background: '#f8fafc', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}
            />
          </div>
          <div className="form-group">
            <label style={{ fontWeight: '700', marginBottom: '0.75rem' }}>Meeting Link (Zoom, Google Meet, etc.)</label>
            <input
              type="url"
              placeholder="https://zoom.us/j/..."
              value={classFormData.meeting_link}
              onChange={(e) => setClassFormData({ ...classFormData, meeting_link: e.target.value })}
              required
              style={{ background: '#f8fafc', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}
            />
          </div>
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label style={{ fontWeight: '700', marginBottom: '0.75rem' }}>Date</label>
              <input
                type="date"
                value={classFormData.date}
                onChange={(e) => setClassFormData({ ...classFormData, date: e.target.value })}
                required
                style={{ background: '#f8fafc', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontWeight: '700', marginBottom: '0.75rem' }}>Time</label>
              <input
                type="time"
                value={classFormData.time}
                onChange={(e) => setClassFormData({ ...classFormData, time: e.target.value })}
                required
                style={{ background: '#f8fafc', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}
              />
            </div>
          </div>
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="form-group">
              <label style={{ fontWeight: '700', marginBottom: '0.75rem' }}>Duration (Hours)</label>
              <input
                type="number"
                step="0.5"
                placeholder="2"
                value={classFormData.duration}
                onChange={(e) => setClassFormData({ ...classFormData, duration: e.target.value })}
                required
                style={{ background: '#f8fafc', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontWeight: '700', marginBottom: '0.75rem' }}>Capacity</label>
              <input
                type="number"
                value={classFormData.capacity}
                onChange={(e) => setClassFormData({ ...classFormData, capacity: e.target.value })}
                required
                style={{ background: '#f8fafc', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}
              />
            </div>
          </div>
          <div className="modal-actions" style={{ marginTop: '2.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <button type="button" className="cancel-btn" onClick={() => setIsClassModalOpen(false)} style={{ padding: '1rem 2rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white', fontWeight: 'bold', color: '#64748b' }}>Cancel</button>
            <button type="submit" className="submit-btn" style={{ flex: 1, padding: '1.15rem', background: '#F2921D', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '800' }}>Schedule Class</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderLiveClasses = () => (
    <div className="live-classes-management">
      <div className="view-page-header">


        <div style={{ flex: 1 }}>
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
          <h2>All Live Classes ({liveClasses.length})</h2>
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
            {liveClasses.map((live) => (
              <tr key={live.id}>
                <td style={{ fontWeight: '700', color: '#1e293b' }}>{live.title}</td>
                <td>{live.instructor}</td>
                <td>
                  <div style={{ fontWeight: '700' }}>{live.date}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{live.time}</div>
                </td>
                <td>{live.duration} hours</td>
                <td>
                  <div className="adm-reg-progress">
                    <div className="adm-reg-bar">
                      <div className="adm-reg-fill" style={{ width: `${(live.registered / live.capacity) * 100}%` }}></div>
                    </div>
                    <span>{live.registered}/{live.capacity}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-pill ${live.status.toLowerCase()}`}>{live.status}</span>
                </td>
                <td>
                  <div className="adm-actions-cell">
                    <button className="icon-btn edit" onClick={() => openEditClassModal(live)}>✎</button>
                    <button
                      className="icon-btn copy"
                      style={{ color: '#10b981', background: '#ecfdf5' }}
                      onClick={() => live.meeting_link ? window.open(live.meeting_link, '_blank') : alert("No meeting link set!")}
                      title="Start/Join Class"
                    >
                      📹
                    </button>
                    <button className="icon-btn delete" onClick={() => handleDeleteClass(live.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
            {liveClasses.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No live classes scheduled yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isClassModalOpen && renderScheduleClassModal()}
      {isEditClassModalOpen && renderEditClassModal()}
    </div>
  );

  const renderReports = () => (
    <div className="reports-management-page">
      <div className="view-page-header">

        <div style={{ flex: 1 }}>
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
    <Settings user={user} onBack={() => setActiveMenu('Dashboard')} />
  );
  
  const renderProfile = () => (
    <FacultyProfile user={user} onUserUpdate={onUserUpdate} onLogout={onLogout} onBack={() => setActiveMenu('Dashboard')} />
  );

  const renderStudyMaterials = () => (
    <div className="course-management-page">
      <div className="view-page-header">
        <div style={{ flex: 1 }}>
          <h1>Study Materials</h1>
          <p>Upload and manage study materials for students</p>
        </div>
        <button className="create-course-main-btn" onClick={() => setIsStudyMaterialModalOpen(true)}>
          <span>+</span> Upload Material
        </button>
      </div>

      <div className="admin-management-section">
        <div className="table-header-row">
          <h2>All Materials</h2>
        </div>
        <div className="admin-courses-grid">
          {studyMaterials.length === 0 && <div style={{ padding: '2rem', color: '#64748b' }}>No materials found.</div>}
          {studyMaterials.map(m => (
            <div key={m.id} className="admin-course-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h3>{m.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0', flex: 1 }}>{m.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <span className="status-badge published" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>{m.category}</span>
                <button onClick={() => handleDeleteMaterial(m.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 600 }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isStudyMaterialModalOpen && (
        <div className="adm-modal-overlay">
          <div className="adm-modal-content" style={{ maxWidth: '640px' }}>
            <div className="adm-modal-header">
              <h2>Upload Study Material</h2>
              <button className="close-modal" onClick={() => setIsStudyMaterialModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleStudyMaterialSubmit} className="adm-modal-form">
              <div className="form-group">
                <label>Title</label>
                <input required type="text" value={studyMaterialForm.title} onChange={e => setStudyMaterialForm({ ...studyMaterialForm, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="2" value={studyMaterialForm.description} onChange={e => setStudyMaterialForm({ ...studyMaterialForm, description: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={studyMaterialForm.category} onChange={e => setStudyMaterialForm({ ...studyMaterialForm, category: e.target.value })}>
                  <option>General Studies</option>
                  <option>Polity</option>
                  <option>History</option>
                  <option>Economy</option>
                  <option>Geography</option>
                </select>
              </div>
              <div className="form-group">
                <label>File (PDF, PPT, Videos, EPUB, MOBI, AZW3)</label>
                <input required type="file" onChange={e => setStudyMaterialFile(e.target.files[0])} style={{ padding: '1rem', border: '1px dashed #ccc', width: '100%', borderRadius: '12px' }} />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsStudyMaterialModalOpen(false)}>Cancel</button>
                <button type="submit" className="submit-btn" style={{ background: 'var(--bg-gradient)' }}>Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
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
      case 'Study Materials':
        return renderStudyMaterials();
      case 'Reports':
        return renderReports();
      case 'Settings':
        return renderSettings();
      case 'Profile':
        return renderProfile();
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
          <button onClick={onLogout} className="common-logout-btn">
            <span className="icon">↪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-top-bar">
          <div style={{ flex: 1 }}></div>

          <div className="profile-wrapper admin-profile-section" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ThemeToggle />
            <span className="adm-noti">🔔</span>
            <div className="user-profile" onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
              <div className="adm-user-meta">
                <div className="adm-name">{user.name || user.email.split('@')[0]}</div>
                <div className="adm-role">Faculty Member</div>
              </div>
              <div className="adm-avatar">{(user.name || user.email).substring(0, 2).toUpperCase()}</div>
            </div>

            {isProfileOpen && (
              <div className="profile-dropdown" style={{ top: '100%' }}>
                <button className="dropdown-item" onClick={() => { setActiveMenu('Profile'); setIsProfileOpen(false); }}>
                  <span className="icon">👤</span> My Profile
                </button>
                <button className="dropdown-item" onClick={() => { setActiveMenu('Settings'); setIsProfileOpen(false); }}>
                  <span className="icon">⚙️</span> Settings
                </button>
              </div>
            )}
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
