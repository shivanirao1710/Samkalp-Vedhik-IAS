import React, { useState, useEffect } from 'react';
import '../styles/shared-layout.css';
import '../styles/FacultyDashboardExtended.css';
import ThemeToggle from './ThemeToggle';
import Settings from './Settings';
import FacultyProfile from './FacultyProfile';
import logo from '../images/logo.png';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import '../styles/StudyMaterials.css';
import { scholarshipQuestions } from './ScholarshipTest';

const FacultyDashboard = ({ user, onLogout, onUserUpdate }) => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [activeTab, setActiveTab] = useState('Students');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    // Sync profile data on mount
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/me/${user.id}`);
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
  const [studyMaterialForm, setStudyMaterialForm] = useState({ title: '', description: '', category: 'Art and Culture' });
  const [studyMaterialFiles, setStudyMaterialFiles] = useState([]);
  const [isUploadingMaterials, setIsUploadingMaterials] = useState(false);

  // Current Affairs State
  const [currentAffairs, setCurrentAffairs] = useState([]);
  const [isCAModalOpen, setIsCAModalOpen] = useState(false);

  const getDefaultCATitle = () => `Daily News - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

  const [caForm, setCAForm] = useState({ title: getDefaultCATitle() });
  const [caFile, setCAFile] = useState(null);
  const [isUploadingCA, setIsUploadingCA] = useState(false);
  const [caPreviewItem, setCAPreviewItem] = useState(null);

  const menuItems = [
    { name: 'Dashboard', icon: '⊞' },
    { name: 'Students', icon: '👥' },
    { name: 'Scholarships', icon: '🎓' },
    { name: 'Courses', icon: '📖' },
    { name: 'Tests', icon: '📄' },
    { name: 'Live Classes', icon: '📺' },
    { name: 'Study Materials', icon: '📚' },
    { name: 'Interviews', icon: '📹' },
    { name: 'Reports', icon: '📊' },
    { name: 'Announcements', icon: '🔔' },
    { name: 'Current Affairs', icon: '🌍' },
  ];

  const actions = [
    { title: 'Add Course', subtitle: 'Create new course', icon: '＋', target: 'Courses', trigger: () => setIsCreateModalOpen(true) },
    { title: 'Schedule Class', subtitle: 'Create live session', icon: '＋', target: 'Live Classes' },
    { title: 'Create Test', subtitle: 'Add new test', icon: '＋', target: 'Tests', trigger: () => setIsTestModalOpen(true) },
    { title: 'Add Study Material', subtitle: 'Upload PDFs & E-books', icon: '＋', target: 'Study Materials', trigger: () => setIsStudyMaterialModalOpen(true) },
    { title: 'Send Announcement', subtitle: 'Message all students', icon: '🔔', target: 'Announcements' },
    {
      title: 'Post Daily News', subtitle: 'Upload current affairs', icon: '🌍', target: 'Current Affairs', trigger: () => {
        setCAForm({ title: getDefaultCATitle() });
        setIsCAModalOpen(true);
      }
    },
    { title: 'Psychometric Reports', icon: '🧠', subtitle: 'View student analytics', target: 'Reports' },
    { title: 'Evaluate Scholarships', subtitle: 'Approve or reject', icon: '🎓', target: 'Scholarships' },
  ];

  const [dashboardStats, setDashboardStats] = useState([
    { label: 'Total Students', value: '0', change: '+0', icon: '👥', color: '#e0f2fe' },
    { label: 'Active Courses', value: '0', change: '+0', icon: '📖', color: '#f0fdf4' },
    { label: 'Total tests', value: '0', change: '+0', icon: '📄', color: '#fff7ed' },
    { label: 'Interviews Conducted', value: '0', change: '+0', icon: '📹', color: '#f5f3ff' },
  ]);

  // Live Student Data State
  const [studentData, setStudentData] = useState([]);
  const [studentPageStats, setStudentPageStats] = useState([
    { label: 'Total Students', value: '0', icon: '👥', color: '#e0f2fe' },
    { label: 'Active Students', value: '0', icon: '👤', color: '#f0fdf4' },
    { label: 'New This Month', value: '0', icon: '📅', color: '#fff7ed' },
    { label: 'Inactive', value: '0', icon: '👤', color: '#fef2f2' },
  ]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'info' });
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);

  // Admin Contact State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminRequests, setAdminRequests] = useState([]);
  const [newRequest, setNewRequest] = useState({ subject: '', message: '' });
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);
  const [psychometricReports, setPsychometricReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [selectedStudentReport, setSelectedStudentReport] = useState(null);
  const [isPsyReportModalOpen, setIsPsyReportModalOpen] = useState(false);

  // Interview Results State
  const [allInterviewResults, setAllInterviewResults] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isInterviewReportModalOpen, setIsInterviewReportModalOpen] = useState(false);

  // Scholarships State
  const [pendingScholarships, setPendingScholarships] = useState([]);
  const [viewingAnswersStudent, setViewingAnswersStudent] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ start: '', end: '' });

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/app-settings`);
      if (res.ok) {
        const data = await res.json();
        setScheduleForm({
          start: data.scholarship_start ? data.scholarship_start.slice(0, 16) : '',
          end: data.scholarship_end ? data.scholarship_end.slice(0, 16) : ''
        });
      }
    } catch (err) { console.error(err); }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/app-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scholarship_start: scheduleForm.start,
          scholarship_end: scheduleForm.end
        })
      });
      if (res.ok) {
        alert("Schedule updated successfully!");
        setIsScheduleModalOpen(false);
      }
    } catch (err) { console.error(err); }
  };
  
  const fetchPendingScholarships = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/scholarship/pending`);
      if (res.ok) setPendingScholarships(await res.json());
    } catch (err) { console.error(err); }
  };
  
  const handleEvaluateScholarship = async (userId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this scholarship?`)) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/${userId}/scholarship_evaluate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert(`Scholarship ${status} successfully.`);
        fetchPendingScholarships();
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchStudents();
    fetchAnnouncements();
    fetchAdminRequests();
    fetchCurrentAffairs();
    fetchInterviews();
    fetchPsychometricReports();
    fetchPendingScholarships();
  }, [activeMenu]);

  const fetchPsychometricReports = async () => {
    setIsLoadingReports(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/psychometric/all-reports`);
      if (response.ok) {
        const data = await response.json();
        setPsychometricReports(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching psychometric reports:", error);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const fetchAdminRequests = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/requests/faculty/${user.id}`);
      if (res.ok) setAdminRequests(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!newRequest.subject || !newRequest.message) return alert("Please fill all fields");

    setIsSendingRequest(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRequest,
          faculty_id: user.id,
          faculty_name: user.name || user.email.split('@')[0]
        })
      });
      if (res.ok) {
        alert("Request sent to Admin!");
        setNewRequest({ subject: '', message: '' });
        fetchAdminRequests();
      }
    } catch (err) { console.error(err); }
    finally { setIsSendingRequest(false); }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/notifications/`);
      if (res.ok) setAnnouncements(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchInterviews = async () => {
    setLoadingInterviews(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/interview/all`);
      if (res.ok) {
        const data = await res.json();
        setAllInterviewResults(data);

        // Update dashboard stats
        setDashboardStats(prev => prev.map(s => {
          if (s.label === 'Interviews Conducted') return { ...s, value: data.length.toString() };
          return s;
        }));
      }
    } catch (err) { console.error(err); }
    finally { setLoadingInterviews(false); }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.message) return alert("Please fill all fields");

    setIsSendingAnnouncement(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/notifications/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAnnouncement, sender_id: user.id })
      });
      if (res.ok) {
        alert("Announcement sent to all students!");
        setNewAnnouncement({ title: '', message: '', type: 'info' });
        fetchAnnouncements();
      }
    } catch (err) { console.error(err); }
    finally { setIsSendingAnnouncement(false); }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/notifications/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAnnouncements();
    } catch (err) { console.error(err); }
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/students-detailed`);
      if (response.ok) {
        const data = await response.json();
        setStudentData(data);

        // Calculate stats
        const total = data.length;
        const suspended = data.filter(s => s.is_suspended).length;
        const active = total - suspended;

        setStudentPageStats([
          { label: 'Total Students', value: total.toString(), icon: '👥', color: '#e0f2fe' },
          { label: 'Active Students', value: active.toString(), icon: '👤', color: '#f0fdf4' },
          { label: 'New This Month', value: '1', icon: '📅', color: '#fff7ed' },
          { label: 'Suspended', value: suspended.toString(), icon: '🚫', color: '#fef2f2' },
        ]);

        setDashboardStats(prev => prev.map(s => {
          if (s.label === 'Total Students') return { ...s, value: total.toString() };
          return s;
        }));
      }
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleToggleSuspension = async (studentId, currentStatus) => {
    const action = currentStatus ? "unsuspend" : "suspend";
    if (!window.confirm(`Are you sure you want to ${action} this student's account?`)) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/user/${studentId}/toggle-suspension`, {
        method: 'POST'
      });
      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchStudents(); // Refresh student list
      } else {
        alert("Failed to update student status.");
      }
    } catch (err) {
      console.error("Error toggling suspension:", err);
      alert("Failed to connect to server.");
    }
  };

  const fetchCurrentAffairs = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/current-affairs/`);
      if (res.ok) setCurrentAffairs(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleCASubmit = async (e) => {
    e.preventDefault();
    if (!caFile) return alert("Please select a file.");

    setIsUploadingCA(true);
    const fd = new FormData();
    fd.append('title', caForm.title || caFile.name.split('.')[0]);
    fd.append('file', caFile);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/current-affairs/`, { method: 'POST', body: fd });
      if (res.ok) {
        alert("Daily Current Affairs uploaded!");
        setIsCAModalOpen(false);
        setCAFile(null);
        setCAForm({ title: getDefaultCATitle() });
        fetchCurrentAffairs();
      }
    } catch (err) {
      console.error('Error uploading CA:', err);
    } finally {
      setIsUploadingCA(false);
    }
  };

  const handleDeleteCA = async (id) => {
    if (!window.confirm("Delete this daily update?")) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/current-affairs/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCurrentAffairs();
    } catch (err) { console.error(err); }
  };

  const fetchGeneralStats = async () => {
    try {
      const [coursesRes, testsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/courses/`),
        fetch(`${process.env.REACT_APP_API_URL}/tests/`)
      ]);

      const courses = await coursesRes.json();
      const tests = await testsRes.json();

      setDashboardStats(prev => prev.map(s => {
        if (s.label === 'Active Courses') return { ...s, value: courses.length.toString() };
        if (s.label === 'Total tests') return { ...s, value: tests.length.toString() };
        return s;
      }));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchGeneralStats();
  }, []);

  const renderDashboard = () => (
    <>
      <div className="admin-dash-header">
        <div>
          <h1>Faculty Dashboard</h1>
          <p>Manage students, courses, tests, and interviews</p>
        </div>
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
        <input
          type="text"
          placeholder="Search students by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {studentData
              .filter(student =>
                (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (student.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((student) => {
                const report = psychometricReports.find(r => r.user_id === student.id);
                return (
                  <tr key={student.id}>
                    <td>
                      <div className="adm-student-cell">
                        <div className="adm-student-avatar" style={{ backgroundColor: student.color }}>
                          {(student.name || '??').substring(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: '700' }}>{student.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info-cell">
                        <div className="contact-item">✉️ {student.email}</div>
                        <div className="contact-item">📞 {student.phone}</div>
                      </div>
                    </td>
                    <td>{student.enrolled_date}</td>
                    <td>
                      <span className="course-count-tag">{student.courses} Courses</span>
                    </td>
                    <td>
                      <span className={`status-pill ${(student.status || 'Active').toLowerCase()}`}>
                        {student.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="edit-course-btn"
                          style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.75rem',
                            background: student.is_suspended ? '#f0fdf4' : '#fef2f2',
                            color: student.is_suspended ? '#16a34a' : '#ef4444',
                            border: `1px solid ${student.is_suspended ? '#bcf0da' : '#fee2e2'}`,
                            fontWeight: '700'
                          }}
                          onClick={() => handleToggleSuspension(student.id, student.is_suspended)}
                        >
                          {student.is_suspended ? '🔓 Unsuspend' : '🚫 Suspend'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            {studentData.filter(student =>
              (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (student.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No students found matching "{searchTerm}"
                  </td>
                </tr>
              )}
          </tbody>
        </table>

      </div>
      {isPsyReportModalOpen && selectedStudentReport && (
        <div className="adm-modal-overlay">
          <div className="adm-modal-content" style={{ maxWidth: '850px', maxHeight: '90vh', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              color: 'white',
              padding: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <div>
                <h2 style={{ color: 'white', margin: 0, fontSize: '1.75rem' }}>Psychometric Analysis</h2>
                <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8 }}>Comprehensive profile for <strong>{selectedStudentReport.user_name}</strong></p>
              </div>
              <button
                className="close-modal"
                onClick={() => setIsPsyReportModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
              >×</button>
            </div>

            <div style={{ padding: '2rem', flex: 1, overflowY: 'auto', background: 'var(--bg-card)' }}>
              {/* Overall Profile */}
              <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>🧠 Overall Psychological Profile</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>{selectedStudentReport.report?.overall_profile}</p>
              </div>

              {/* Score Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {Object.entries(selectedStudentReport.report?.scores || {}).map(([key, data]) => (
                  <div key={key} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0, textTransform: 'capitalize', fontSize: '0.9rem', color: 'var(--text-main)' }}>{key.replace('_', ' ')}</h4>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '900',
                        color: data.score > 70 ? '#F2921D' : data.score > 40 ? '#f59e0b' : '#ef4444'
                      }}>{data.score}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-card)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                      <div style={{ width: `${data.score}%`, height: '100%', background: data.score > 70 ? '#F2921D' : data.score > 40 ? '#f59e0b' : '#ef4444' }} />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>{data.description}</p>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: 'var(--text-main)' }}>🚀 Key Recommendations</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {(selectedStudentReport.report?.personalized_recommendations || []).map((rec, i) => (
                  <div key={i} style={{ borderLeft: '4px solid #F2921D', padding: '1rem', background: 'var(--bg-main)', borderRadius: '0 8px 8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <strong style={{ color: 'var(--text-main)' }}>{rec.title}</strong>
                      <span style={{ fontSize: '0.7rem', fontWeight: '900', color: '#F2921D' }}>{rec.priority?.toUpperCase()} PRIORITY</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              padding: '1.5rem 2rem',
              background: 'var(--bg-card)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                className="cancel-btn"
                onClick={() => setIsPsyReportModalOpen(false)}
                style={{ padding: '0.85rem 1.5rem', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontWeight: '700' }}
              >
                Close Analysis
              </button>
              <button
                className="submit-btn"
                style={{ minWidth: '180px', background: '#F2921D', color: 'white' }}
                onClick={() => downloadPsyReportPDF(selectedStudentReport)}
              >
                📥 Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const courseStats = [
    { label: 'Total Courses', value: '18', icon: '📚', color: '#e0f2fe' },
    { label: 'Total Enrollments', value: '1,245', icon: '👥', color: '#fff7ed' },
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
    category: 'Art and Culture',
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
      const res = await fetch(`${process.env.REACT_APP_API_URL}/study-materials/`);
      setStudyMaterials(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleStudyMaterialSubmit = async (e) => {
    e.preventDefault();
    if (!studyMaterialFiles || studyMaterialFiles.length === 0) {
      alert("Please select at least one file.");
      return;
    }

    setIsUploadingMaterials(true);
    let successCount = 0;

    for (const file of studyMaterialFiles) {
      const fd = new FormData();
      const titleToUse = studyMaterialFiles.length === 1 && studyMaterialForm.title
        ? studyMaterialForm.title
        : file.name.split('.').slice(0, -1).join('.');

      fd.append('title', titleToUse);
      fd.append('description', studyMaterialForm.description);
      fd.append('category', studyMaterialForm.category);
      fd.append('file', file);

      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/study-materials/`, { method: 'POST', body: fd });
        if (res.ok) {
          successCount++;
        }
      } catch (err) {
        console.error('Error uploading file:', err);
      }
    }

    setIsUploadingMaterials(false);

    if (successCount > 0) {
      alert(`Successfully uploaded ${successCount} material(s)`);
      setIsStudyMaterialModalOpen(false);
      setStudyMaterialFiles([]);
      setStudyMaterialForm({ title: '', description: '', category: 'Art and Culture' });
      fetchStudyMaterials();
    } else {
      alert("Failed to upload materials. Please try again.");
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/study-materials/${id}`, { method: 'DELETE' });
      if (res.ok) fetchStudyMaterials();
    } catch (err) { console.error(err); }
  };

  const fetchLiveCourses = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/courses/`);
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

      const res = await fetch(`${process.env.REACT_APP_API_URL}/courses/`, {
        method: 'POST',
        body: fd
      });

      if (res.ok) {
        alert('Course created successfully! It is now visible in the Student Dashboard.');
        setIsCreateModalOpen(false);
        setFormData({ title: '', author: '', modules: '', hours: '', category: 'Art and Culture', status: 'Draft', description: '' });
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
        ? `${process.env.REACT_APP_API_URL}${course.image_url}`
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

      const res = await fetch(`${process.env.REACT_APP_API_URL}/courses/${editCourse.id}`, {
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
      const res = await fetch(`${process.env.REACT_APP_API_URL}/courses/${course.id}`, { method: 'DELETE' });
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
                <option>Art and Culture</option>
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
                ? `${process.env.REACT_APP_API_URL}${course.image_url}`
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
    { label: 'Total Attempts', value: '1,429', icon: '👥', color: '#fff7ed' },
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

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.endsWith('.docx')) {
      setIsBulkUploading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        try {
          const result = await mammoth.convertToHtml({ arrayBuffer });
          const html = result.value;

          const response = await fetch(`${process.env.REACT_APP_API_URL}/tests/parse-ai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: html })
          });

          setIsBulkUploading(false);

          if (response.ok) {
            const newQuestions = await response.json();
            if (newQuestions.length > 0) {
              setTestFormData(prev => ({
                ...prev,
                questions: [...prev.questions, ...newQuestions]
              }));
              alert(`Success: ${newQuestions.length} questions extracted!`);
            } else {
              alert('No questions found.');
            }
          } else {
            const err = await response.json();
            alert("Error: " + (err.detail || "Failed to process"));
          }
        } catch (err) {
          console.error(err);
          setIsBulkUploading(false);
          alert("Error processing document.");
        }
      };
      reader.onerror = () => {
        setIsBulkUploading(false);
        alert("Failed to read file.");
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a .docx file.");
    }
  };


  const [isCreatingTest, setIsCreatingTest] = useState(false);

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
      setIsCreatingTest(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tests/`, {
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
        // REFRESH DATA IMMEDIATELY
        fetchTests();
        fetchGeneralStats();
      } else {
        const err = await response.json();
        alert("Error: " + (err.detail || "Failed to create test"));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to connect to backend");
    } finally {
      setIsCreatingTest(false);
    }
  };

  const [isBulkUploading, setIsBulkUploading] = useState(false);

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
            <div style={{ marginBottom: '1.5rem' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b' }}>Added Questions</span>
                  <span style={{
                    background: testFormData.questions.length > 0 ? 'linear-gradient(135deg, #F2921D, #D93425)' : '#e2e8f0',
                    color: testFormData.questions.length > 0 ? '#fff' : '#94a3b8',
                    padding: '2px 10px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '800'
                  }}>
                    {testFormData.questions.length}
                  </span>
                </div>
                {testFormData.questions.length > 0 && (
                  <span style={{ fontSize: '0.75rem', color: '#F2921D', fontWeight: '700' }}>✓ Questions ready</span>
                )}
              </div>

              {/* Questions List Box */}
              <div style={{
                maxHeight: '220px',
                overflowY: 'auto',
                background: '#0f172a',
                borderRadius: '16px',
                border: '1.5px solid #334155',
                padding: testFormData.questions.length === 0 ? '2rem' : '0.5rem',
                position: 'relative'
              }}>
                {isBulkUploading && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 2000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '16px'
                  }}>
                    <div className="bulk-upload-pulse" style={{
                      width: '64px',
                      height: '64px',
                      border: '4px solid #F2921D',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      marginBottom: '1.5rem',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <h2 style={{ color: '#F2921D', margin: 0, fontWeight: '900', letterSpacing: '1px' }}>UPLOADING...</h2>
                    <p style={{ color: '#94a3b8', marginTop: '0.8rem', fontWeight: '500' }}>Please stay on this page</p>
                  </div>
                )}
                {testFormData.questions.length === 0 ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>No questions added yet.</p>
                    <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.25rem' }}>Add manually below or bulk upload via Word.</p>
                  </div>
                ) : (
                  testFormData.questions.map((q, idx) => {
                    const correctOpt = q.options.find(o => o.is_correct);
                    return (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '0.85rem 0.75rem',
                        borderBottom: idx < testFormData.questions.length - 1 ? '1px solid #1e293b' : 'none',
                        borderRadius: '10px',
                        background: 'transparent',
                        transition: 'background 0.15s'
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Number Badge */}
                        <span style={{
                          minWidth: '26px',
                          height: '26px',
                          background: 'linear-gradient(135deg, #F2921D, #D93425)',
                          color: '#fff',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          flexShrink: 0,
                          marginTop: '1px'
                        }}>
                          {idx + 1}
                        </span>

                        {/* Question Text + Correct Answer */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            margin: '0 0 0.3rem 0',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: '#f1f5f9',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {q.text}
                          </p>
                          {correctOpt && (
                            <span style={{
                              fontSize: '0.72rem',
                              color: '#F2921D',
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              ✓ {correctOpt.text}
                            </span>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const newQs = [...testFormData.questions];
                            newQs.splice(idx, 1);
                            setTestFormData({ ...testFormData, questions: newQs });
                          }}
                          style={{
                            background: 'rgba(239,68,68,0.12)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            color: '#f87171',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            flexShrink: 0,
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#f87171'; }}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>


            <div className="bulk-upload-zone" style={{ border: '1.5px dashed #F2921D', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', background: '#fff7ed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ color: '#F2921D', margin: '0 0 0.5rem 0' }}>Bulk Upload via Docx</h4>
                <p style={{ fontSize: '0.85rem', color: '#c2410c', margin: 0 }}>Easily upload questions from Word documents. Bold the correct option.</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{
                  background: isBulkUploading ? '#f59e0b' : '#F2921D',
                  color: '#fff',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: isBulkUploading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  opacity: isBulkUploading ? 0.7 : 1
                }}>
                  {isBulkUploading ? 'Uploading...' : 'Upload Word File'}
                  <input type="file" accept=".docx" onChange={handleBulkUpload} style={{ display: 'none' }} disabled={isBulkUploading} />
                </label>
              </div>
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
              <button type="button" className="cancel-btn" onClick={() => setTestModalStep(1)} disabled={isCreatingTest}>Back</button>
              <button
                type="button"
                className="submit-btn"
                style={{
                  background: isCreatingTest ? '#D93425' : '#F2921D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  cursor: isCreatingTest ? 'not-allowed' : 'pointer',
                  opacity: isCreatingTest ? 0.9 : 1
                }}
                onClick={handleTestSubmit}
                disabled={isCreatingTest || testFormData.questions.length === 0}
              >
                {isCreatingTest ? (
                  <>
                    <span style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.35)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.7s linear infinite',
                      flexShrink: 0
                    }} />
                    Uploading Test...
                  </>
                ) : (
                  `Create Final Test (${testFormData.questions.length} Qs)`
                )}
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tests/`);
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tests/${test.id}/questions`);
      const data = await response.json();
      setTestQuestions(data);
    } catch (error) {
      console.error("Error fetching test questions:", error);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tests/questions/${questionId}`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tests/${testId}`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tests/questions/${editingQuestion.id}`, {
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
        const refreshed = await fetch(`${process.env.REACT_APP_API_URL}/tests/${testToManage.id}/questions`);
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
            <label style={{ color: 'var(--text-main)', fontWeight: 'bolder' }}>Question Text</label>
            <textarea
              style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1.5px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
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
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
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
            width: 'fit-content',
            flex: '0 0 auto',
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
            <div key={q.id} className="detailed-question-card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '700' }}>Q{idx + 1}: {q.text}</h4>
                  <div className="options-display-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{ padding: '0.75rem', borderRadius: '10px', background: opt.is_correct ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-main)', border: opt.is_correct ? '1.5px solid #22c55e' : '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: '700', color: opt.is_correct ? '#22c55e' : 'var(--text-muted)' }}>{String.fromCharCode(65 + oIdx)}</span>
                        <span style={{ color: 'var(--text-main)' }}>{opt.text}</span>
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
          {testQuestions.length === 0 && <p style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-main)', color: 'var(--text-muted)', borderRadius: '16px', border: '1.5px dashed var(--border-color)' }}>No questions found in this test.</p>}
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
                  <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>{test.title}</td>
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
      const resp = await fetch(`${process.env.REACT_APP_API_URL}/live-classes/`);
      const data = await resp.json();
      setLiveClasses(data);
    } catch (err) {
      console.error("Error fetching live classes:", err);
    }
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/live-classes/`, {
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
      await fetch(`${process.env.REACT_APP_API_URL}/live-classes/${id}`, { method: 'DELETE' });
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/live-classes/${editingClassId}`, {
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
              <label style={{ fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Duration (Hours)</label>
              <input
                type="number"
                step="0.5"
                value={editClassFormData.duration}
                onChange={(e) => setEditClassFormData({ ...editClassFormData, duration: e.target.value })}
                required
                style={{ background: 'var(--bg-main)', color: 'var(--text-main)', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Capacity</label>
              <input
                type="number"
                value={editClassFormData.capacity}
                onChange={(e) => setEditClassFormData({ ...editClassFormData, capacity: e.target.value })}
                required
                style={{ background: 'var(--bg-main)', color: 'var(--text-main)', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}
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
            <label style={{ fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Class Title</label>
            <input
              type="text"
              placeholder="e.g. Economy Masterclass"
              value={classFormData.title}
              onChange={(e) => setClassFormData({ ...classFormData, title: e.target.value })}
              required
              style={{ background: 'var(--bg-main)', color: 'var(--text-main)', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}
            />
          </div>
          <div className="form-group">
            <label style={{ fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Instructor</label>
            <input
              type="text"
              placeholder="Instructor Name"
              value={classFormData.instructor}
              onChange={(e) => setClassFormData({ ...classFormData, instructor: e.target.value })}
              required
              style={{ background: 'var(--bg-main)', color: 'var(--text-main)', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}
            />
          </div>
          <div className="form-group">
            <label style={{ fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Meeting Link (Zoom, Google Meet, etc.)</label>
            <input
              type="url"
              placeholder="https://zoom.us/j/..."
              value={classFormData.meeting_link}
              onChange={(e) => setClassFormData({ ...classFormData, meeting_link: e.target.value })}
              required
              style={{ background: 'var(--bg-main)', color: 'var(--text-main)', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}
            />
          </div>
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label style={{ fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Date</label>
              <input
                type="date"
                value={classFormData.date}
                onChange={(e) => setClassFormData({ ...classFormData, date: e.target.value })}
                required
                style={{ background: 'var(--bg-main)', color: 'var(--text-main)', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Time</label>
              <input
                type="time"
                value={classFormData.time}
                onChange={(e) => setClassFormData({ ...classFormData, time: e.target.value })}
                required
                style={{ background: 'var(--bg-main)', color: 'var(--text-main)', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}
              />
            </div>
          </div>
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="form-group">
              <label style={{ fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Duration (Hours)</label>
              <input
                type="number"
                step="0.5"
                placeholder="2"
                value={classFormData.duration}
                onChange={(e) => setClassFormData({ ...classFormData, duration: e.target.value })}
                required
                style={{ background: 'var(--bg-main)', color: 'var(--text-main)', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Capacity</label>
              <input
                type="number"
                value={classFormData.capacity}
                onChange={(e) => setClassFormData({ ...classFormData, capacity: e.target.value })}
                required
                style={{ background: 'var(--bg-main)', color: 'var(--text-main)', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}
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

  const downloadPsyReportPDF = async (studentReport) => {
    if (!studentReport || !studentReport.report) return;
    const { report, user_name } = studentReport;
    const scores = report.scores || {};
    const allScores = [
      { label: 'Personality', key: 'personality', icon: '🧩' },
      { label: 'Cognitive Strength', key: 'cognitive_strength', icon: '🧠' },
      { label: 'Learning Style', key: 'learning_style', icon: '📚' },
      { label: 'Motivation', key: 'motivation', icon: '🔥' },
      { label: 'Stress Management', key: 'stress_management', icon: '🌿' },
      { label: 'Time Management', key: 'time_management', icon: '⏰' },
    ];

    const scoreRows = allScores.map(({ label, key }) => {
      const s = scores[key] || {};
      const score = s.score || 0;
      const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
      return `
        <div style="margin-bottom:18px; padding:16px; border:1px solid #e2e8f0; border-radius:12px; break-inside:avoid;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; width: 100%;">
            <strong style="font-size:14px; font-family: Inter, sans-serif;">${label}</strong>
            <span style="font-size:13px; font-weight:700; color:${color};">${score}/100</span>
          </div>
          <div style="background:#f1f5f9; border-radius:99px; height:8px; overflow:hidden; width: 100%;">
            <div style="width:${score}%; height:100%; background:${color}; border-radius:99px;"></div>
          </div>
          <p style="font-size:12px; color:#64748b; margin:10px 0 0 0; line-height:1.4;">${s.description || ''}</p>
        </div>
      `;
    }).join('');

    const strengths = (report.strengths || []).map(s => `<li style="margin-bottom:8px;">${s}</li>`).join('');
    const improvements = (report.areas_for_improvement || []).map(a => `<li style="margin-bottom:8px;">${a}</li>`).join('');

    const htmlContent = `
      <div style="font-family: 'Inter', sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 30px; background: white;">
        <div style="background: linear-gradient(135deg, #F2921D, #D93425); color: white; border-radius:20px; padding:40px; margin-bottom:30px; text-align: center;">
          <h1 style="font-size:32px; font-weight:900; margin:0 0 10px 0;">Student Psychometric Profile</h1>
          <p style="margin:5px 0; font-size:16px; opacity:0.9;">Student: <strong>${user_name}</strong></p>
          <p style="margin:5px 0; font-size:14px; opacity:0.8;">Report Analysis by Samkalp Vedhik AI</p>
        </div>
        
        <div style="background:#f8fafc; border-radius:16px; padding:25px; margin-bottom:30px; border:1px solid #e2e8f0;">
          <h2 style="font-size:18px; margin:0 0 12px 0; color: #1e293b;">Overall Psychological Profile</h2>
          <p style="color:#475569; font-size:14px; line-height:1.7; margin: 0;">${report.overall_profile || ''}</p>
        </div>

        <h2 style="font-size:20px; margin:0 0 20px 0; color: #1e293b; border-bottom: 2px solid #F2921D; padding-bottom: 8px; width: fit-content;">Dimensional Analysis</h2>
        ${scoreRows}

        <div style="page-break-before:always; padding-top:20px;"></div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:30px; width: 100%;">
          <div style="background:#f0fdf4; border-radius:16px; padding:20px; border: 1px solid #dcfce7; flex: 1;">
            <h3 style="font-size:16px; color:#166534; margin:0 0 15px 0;">💪 Core Strengths</h3>
            <ul style="margin:0; padding-left:20px; font-size:14px; color:#166534; line-height: 1.6;">${strengths}</ul>
          </div>
          <div style="background:#fff7ed; border-radius:16px; padding:20px; border: 1px solid #ffedd5; flex: 1;">
            <h3 style="font-size:16px; color:#9a3412; margin:0 0 15px 0;">🎯 Development Areas</h3>
            <ul style="margin:0; padding-left:20px; font-size:14px; color:#9a3412; line-height: 1.6;">${improvements}</ul>
          </div>
        </div>

        <div style="background:#eff6ff; border-radius:16px; padding:25px; margin-top:20px; border: 1px solid #dbeafe;">
          <h3 style="font-size:16px; color:#1e40af; margin:0 0 10px 0;">📅 Mentoring Focus & Recommendation</h3>
          <p style="font-size:14px; color:#1e40af; line-height:1.7; margin: 0;">${report.study_plan_suggestion || ''}</p>
        </div>

        <div style="text-align:center; padding:40px 0; margin-top:40px; border-top:1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
          Report generated for Faculty review purposes. Confidential. &copy; Samkalp Vedhik IAS Academy
        </div>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = htmlContent;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Psychometric_Report_${user_name.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'avoid-all'] }
    };

    if (window.html2pdf) {
      await window.html2pdf().set(opt).from(element).save();
    } else {
      console.warn("html2pdf not found, falling back to print");
      window.print();
    }
  };

  const renderReports = () => (
    <div className="reports-management-page">
      <div className="view-page-header">
        <div style={{ flex: 1 }}>
          <h1>Student Reports & Analytics</h1>
          <p>View comprehensive student performance data</p>
        </div>
        <button className="global-search-btn" onClick={fetchPsychometricReports}>
          <span>🔄</span> Refresh Data
        </button>
      </div>

      <div className="admin-stats-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <div className="adm-stat-icon-wrap" style={{ backgroundColor: '#fdf2f8' }}>👤</div>
          </div>
          <div className="adm-stat-info">
            <div className="adm-stat-value">{psychometricReports.length}</div>
            <div className="adm-stat-label">Total Reports</div>
          </div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <div className="adm-stat-icon-wrap" style={{ backgroundColor: '#f0fdf4' }}>✅</div>
          </div>
          <div className="adm-stat-info">
            <div className="adm-stat-value">{psychometricReports.filter(r => r.report?.upsc_readiness?.score >= 70).length}</div>
            <div className="adm-stat-label">Ready Students</div>
          </div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <div className="adm-stat-icon-wrap" style={{ backgroundColor: '#fff7ed' }}>📈</div>
          </div>
          <div className="adm-stat-info">
            <div className="adm-stat-value">{psychometricReports.filter(r => r.report?.upsc_readiness?.score < 40).length}</div>
            <div className="adm-stat-label">Needs Support</div>
          </div>
        </div>
      </div>

      <div className="admin-management-section" style={{ marginTop: '2rem' }}>
        <div className="table-header-row" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>Student Psychometric Reports</h2>
        </div>

        <table className="adm-table">
          <thead>
            <tr>
              <th>STUDENT NAME</th>
              <th>READINESS</th>
              <th>TOP STYLE</th>
              <th>SCORE</th>
              <th>SUBMITTED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingReports ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>Fetching records...</td></tr>
            ) : psychometricReports.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>No student reports found.</td></tr>
            ) : (
              psychometricReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="adm-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                        {report.user_name?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{report.user_name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${report.report?.upsc_readiness?.level?.toLowerCase() || 'published'}`}>
                      {report.report?.upsc_readiness?.level || 'Intermediate'}
                    </span>
                  </td>
                  <td>{report.report?.scores?.learning_style?.style || 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '40px', height: '6px', background: 'var(--bg-main)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${report.report?.upsc_readiness?.score || 0}%`, height: '100%', background: '#F2921D' }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>{report.report?.upsc_readiness?.score || 0}%</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(report.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="edit-course-btn"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                      onClick={() => {
                        setSelectedStudentReport(report);
                        setIsPsyReportModalOpen(true);
                      }}
                    >
                      👁️ View Full Report
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isPsyReportModalOpen && selectedStudentReport && (
        <div className="adm-modal-overlay">
          <div className="adm-modal-content" style={{ maxWidth: '850px', maxHeight: '90vh', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              color: 'white',
              padding: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <div>
                <h2 style={{ color: 'white', margin: 0, fontSize: '1.75rem' }}>Psychometric Analysis</h2>
                <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8 }}>Comprehensive profile for <strong>{selectedStudentReport.user_name}</strong></p>
              </div>
              <button
                className="close-modal"
                onClick={() => setIsPsyReportModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
              >×</button>
            </div>

            <div style={{ padding: '2rem', flex: 1, overflowY: 'auto', background: 'var(--bg-card)' }}>
              {/* Overall Profile */}
              <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>🧠 Overall Psychological Profile</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>{selectedStudentReport.report?.overall_profile}</p>
              </div>

              {/* Score Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {Object.entries(selectedStudentReport.report?.scores || {}).map(([key, data]) => (
                  <div key={key} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0, textTransform: 'capitalize', fontSize: '0.9rem', color: 'var(--text-main)' }}>{key.replace('_', ' ')}</h4>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '900',
                        color: data.score > 70 ? '#22c55e' : data.score > 40 ? '#f59e0b' : '#ef4444'
                      }}>{data.score}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-card)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                      <div style={{ width: `${data.score}%`, height: '100%', background: data.score > 70 ? '#22c55e' : data.score > 40 ? '#f59e0b' : '#ef4444' }} />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>{data.description}</p>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: 'var(--text-main)' }}>🚀 Key Recommendations</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {(selectedStudentReport.report?.personalized_recommendations || []).map((rec, i) => (
                  <div key={i} style={{ borderLeft: '4px solid #F2921D', padding: '1rem', background: 'var(--bg-main)', borderRadius: '0 8px 8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <strong style={{ color: 'var(--text-main)' }}>{rec.title}</strong>
                      <span style={{ fontSize: '0.7rem', fontWeight: '900', color: '#F2921D' }}>{rec.priority?.toUpperCase()} PRIORITY</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              padding: '1.5rem 2rem',
              background: 'var(--bg-card)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                className="cancel-btn"
                onClick={() => setIsPsyReportModalOpen(false)}
                style={{ padding: '0.85rem 1.5rem', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontWeight: '700' }}
              >
                Close Analysis
              </button>
              <button
                className="submit-btn"
                style={{ minWidth: '180px', background: '#F2921D', color: 'white' }}
                onClick={() => downloadPsyReportPDF(selectedStudentReport)}
              >
                📥 Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderInterviews = () => (
    <div className="interview-management-page">
      <div className="view-page-header">
        <div style={{ flex: 1 }}>
          <h1>Candidate Interview Reports</h1>
          <p>Review and analyze student mock interview performances</p>
        </div>
        <button className="global-search-btn" onClick={fetchInterviews}>
          🔄 Refresh Results
        </button>
      </div>

      <div className="admin-stats-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <div className="adm-stat-icon-wrap" style={{ backgroundColor: '#f5f3ff' }}>📹</div>
          </div>
          <div className="adm-stat-info">
            <div className="adm-stat-value">{allInterviewResults.length}</div>
            <div className="adm-stat-label">Total Interviews</div>
          </div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <div className="adm-stat-icon-wrap" style={{ backgroundColor: '#f0fdf4' }}>📈</div>
          </div>
          <div className="adm-stat-info">
            <div className="adm-stat-value">
              {allInterviewResults.length > 0
                ? Math.round(allInterviewResults.reduce((acc, r) => acc + (r.overall_score || 0), 0) / allInterviewResults.length)
                : 0}%
            </div>
            <div className="adm-stat-label">Average Score</div>
          </div>
        </div>
      </div>

      <div className="admin-management-section">
        <div className="table-header-row">
          <h2>Latest Submissions</h2>
        </div>

        <table className="adm-table">
          <thead>
            <tr>
              <th>CANDIDATE</th>
              <th>DATE & TIME</th>
              <th>OVERALL SCORE</th>
              <th>SUMMARY</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loadingInterviews ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Loading reports...</td></tr>
            ) : allInterviewResults.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No interview reports found.</td></tr>
            ) : (
              allInterviewResults.map((result) => (
                <tr key={result.id}>
                  <td>
                    <div style={{ fontWeight: '700', color: '#1e293b' }}>{result.candidate_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: #{result.user_id}</div>
                  </td>
                  <td>{result.date}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        fontWeight: '800',
                        color: result.overall_score >= 70 ? '#10b981' : (result.overall_score >= 40 ? '#f59e0b' : '#ef4444')
                      }}>
                        {result.overall_score}%
                      </span>
                      <div style={{ width: '60px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${result.overall_score}%`,
                          height: '100%',
                          background: result.overall_score >= 70 ? '#10b981' : (result.overall_score >= 40 ? '#f59e0b' : '#ef4444')
                        }}></div>
                      </div>
                    </div>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <p style={{ fontSize: '0.85rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {result.feedback}
                    </p>
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => {
                        setSelectedReport(result);
                        setIsInterviewReportModalOpen(true);
                      }}
                      style={{ background: '#fff7ed', border: '1px solid #F2921D', color: '#F2921D', padding: '0.4rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isInterviewReportModalOpen && selectedReport && (
        <div className="adm-modal-overlay">
          <div className="adm-modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="adm-modal-header" style={{ borderBottom: '1px solid #f1f5f9', padding: '1.5rem 2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>Detailed Interview Analysis</h2>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Candidate: <strong>{selectedReport.candidate_name}</strong> • {selectedReport.date}</p>
              </div>
              <button className="close-modal" onClick={() => setIsInterviewReportModalOpen(false)}>×</button>
            </div>

            <div className="report-modal-body" style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ textAlign: 'center', padding: '1.5rem', background: '#fff7ed', borderRadius: '16px', border: '1px solid #fed7aa' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9a3412', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Communication</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#F2921D' }}>{selectedReport.communication_skills}/100</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1.5rem', background: '#fff7ed', borderRadius: '16px', border: '1px solid #fed7aa' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9a3412', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Knowledge</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#F2921D' }}>{selectedReport.knowledge_depth}/100</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1.5rem', background: '#fff7ed', borderRadius: '16px', border: '1px solid #fed7aa' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9a3412', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Analytical</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#F2921D' }}>{selectedReport.analytical_ability}/100</div>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📋</span> Faculty Feedback
                </h3>
                <p style={{ color: '#475569', lineHeight: '1.6', background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  {selectedReport.feedback}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.5rem', borderRadius: '16px' }}>
                  <h4 style={{ color: '#166534', marginBottom: '0.75rem', fontWeight: '700' }}>💪 Strengths</h4>
                  <ul style={{ paddingLeft: '1.25rem', color: '#166534' }}>
                    {selectedReport.strengths && selectedReport.strengths.length > 0
                      ? selectedReport.strengths.map((s, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{s}</li>)
                      : <li>No major strengths noted</li>}
                  </ul>
                </div>
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '1.5rem', borderRadius: '16px' }}>
                  <h4 style={{ color: '#9a3412', marginBottom: '0.75rem', fontWeight: '700' }}>🎯 Areas for Improvement</h4>
                  <ul style={{ paddingLeft: '1.25rem', color: '#9a3412' }}>
                    {selectedReport.areas_for_improvement && selectedReport.areas_for_improvement.length > 0
                      ? selectedReport.areas_for_improvement.map((a, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{a}</li>)
                      : <li>No major improvements noted</li>}
                  </ul>
                </div>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1.5rem', borderRadius: '16px' }}>
                <h4 style={{ color: '#1e40af', marginBottom: '0.5rem', fontWeight: '700' }}>⚖️ Panel Verdict</h4>
                <p style={{ color: '#1e40af', lineHeight: '1.5' }}>{selectedReport.verdict}</p>
              </div>
            </div>

            <div className="modal-actions" style={{ padding: '1.5rem 2rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="submit-btn"
                onClick={() => setIsInterviewReportModalOpen(false)}
                style={{ background: '#F2921D', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', width: '100%' }}
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
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

      <div className="materials-container-grouped faculty-materials" style={{ marginTop: '2rem' }}>
        {studyMaterials.length === 0 ? (
          <div className="no-materials" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>No Materials Found</h3>
            <p>Upload your first study material to get started</p>
          </div>
        ) : (
          Object.entries(
            studyMaterials.reduce((acc, m) => {
              acc[m.category] = acc[m.category] || [];
              acc[m.category].push(m);
              return acc;
            }, {})
          ).map(([groupName, mats]) => {
            if (mats.length === 0) return null;
            const rowId = `scroll-row-${groupName.replace(/\s+/g, '-')}`;

            const scrollRow = (direction) => {
              const container = document.getElementById(rowId);
              if (container) {
                const scrollAmount = 350;
                container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
              }
            };

            const getIconClass = (type) => {
              const lowerProp = String(type || '').toLowerCase();
              if (lowerProp.includes('pdf')) return 'icon-pdf ebook-style';
              if (lowerProp.includes('video') || lowerProp.includes('mp4')) return 'icon-video';
              if (lowerProp.includes('presentation') || lowerProp.includes('ppt')) return 'icon-presentation';
              if (lowerProp.includes('word') || lowerProp.includes('doc')) return 'icon-word';
              if (lowerProp.includes('image') || lowerProp.includes('jpg') || lowerProp.includes('png')) return 'icon-image';
              if (lowerProp.includes('ebook') || lowerProp.includes('epub')) return 'icon-pdf ebook-style';
              return 'icon-document';
            };

            const getIcon = (type) => {
              const lowerProp = String(type || '').toLowerCase();
              if (lowerProp.includes('pdf')) return '📖';
              if (lowerProp.includes('video') || lowerProp.includes('mp4')) return '▶️';
              if (lowerProp.includes('presentation') || lowerProp.includes('ppt')) return '📊';
              if (lowerProp.includes('word') || lowerProp.includes('doc')) return '📝';
              if (lowerProp.includes('image') || lowerProp.includes('jpg') || lowerProp.includes('png')) return '🖼️';
              if (lowerProp.includes('ebook') || lowerProp.includes('epub')) return '📖';
              return '📁';
            };

            return (
              <div key={groupName} className="material-group" style={{ marginBottom: '3rem' }}>
                <div className="material-group-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 className="material-group-title">{groupName}</h2>
                    <span className="material-group-count">{mats.length} Item{mats.length !== 1 ? 's' : ''}</span>
                  </div>
                  {mats.length > 4 && (
                    <button className="see-all-btn" onClick={() => {
                      const container = document.getElementById(rowId);
                      if (container) {
                        container.classList.toggle('expanded');
                      }
                    }}>See All</button>
                  )}
                </div>
                <div className="materials-row-container">
                  {mats.length > 4 && (
                    <button className="scroll-arrow left" onClick={() => scrollRow('left')}>‹</button>
                  )}
                  <div id={rowId} className="materials-row">
                    {mats.map(mat => (
                      <div key={mat.id} className="material-card" style={{ position: 'relative' }}>
                        <button
                          className="delete-material-btn"
                          onClick={() => handleDeleteMaterial(mat.id)}
                          title="Delete Material"
                          style={{
                            position: 'absolute', top: '10px', right: '10px',
                            background: '#fef2f2', border: '1px solid #fee2e2',
                            color: '#ef4444', width: '32px', height: '32px',
                            borderRadius: '50%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', zIndex: 10,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            fontSize: '1rem'
                          }}>
                          🗑️
                        </button>

                        <div className={`material-icon ${getIconClass(mat.file_type || mat.file_url || '')}`}>
                          {getIcon(mat.file_type || mat.file_url || '')}
                        </div>
                        <div className="material-category">{mat.category}</div>
                        <h3 className="material-title">{mat.title}</h3>
                        <p className="material-desc">{mat.description || 'No description provided.'}</p>
                      </div>
                    ))}
                  </div>
                  {mats.length > 4 && (
                    <button className="scroll-arrow right" onClick={() => scrollRow('right')}>›</button>
                  )}
                </div>
              </div>
            );
          })
        )}
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
                <label>Title <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>(Optional for bulk max. Defaults to filename)</span></label>
                <input type="text" value={studyMaterialForm.title} onChange={e => setStudyMaterialForm({ ...studyMaterialForm, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>Description <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Applied to all)</span></label>
                <textarea rows="2" value={studyMaterialForm.description} onChange={e => setStudyMaterialForm({ ...studyMaterialForm, description: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label>Category <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>(Applied to all)</span></label>
                <select value={studyMaterialForm.category} onChange={e => setStudyMaterialForm({ ...studyMaterialForm, category: e.target.value })}>
                  <option>Art and Culture</option>
                  <option>Polity</option>
                  <option>History</option>
                  <option>Economy</option>
                  <option>Geography</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>Files (Select Multiple)</label>
                <input required type="file" multiple onChange={e => setStudyMaterialFiles(Array.from(e.target.files))} style={{ padding: '1rem', border: '1px dashed var(--border-color)', width: '100%', borderRadius: '12px', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                {studyMaterialFiles.length > 0 && <p style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '0.5rem' }}>{studyMaterialFiles.length} file(s) selected.</p>}
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsStudyMaterialModalOpen(false)}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={isUploadingMaterials} style={{ background: 'var(--bg-gradient)' }}>
                  {isUploadingMaterials ? 'Uploading...' : 'Upload Files'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderAnnouncements = () => (
    <div className="announcements-management-page">
      <div className="admin-dash-header">
        <div>
          <h1>Global Announcements</h1>
          <p>Send messages to all enrolled students instantly</p>
        </div>
      </div>

      <div className="admin-management-section">
        <div className="adm-card" style={{ padding: '2rem', marginBottom: '2rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ color: 'var(--text-main)' }}>Send New Announcement</h3>
          <form onSubmit={handleSendAnnouncement} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label style={{ color: 'var(--text-muted)' }}>Announcement Title</label>
              <input
                type="text"
                placeholder="e.g. Test Schedule Updated"
                value={newAnnouncement.title}
                onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
              />
            </div>
            <div className="form-group">
              <label style={{ color: 'var(--text-muted)' }}>Message Content</label>
              <textarea
                rows="4"
                placeholder="Write your message here..."
                value={newAnnouncement.message}
                onChange={e => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', resize: 'vertical' }}
              />
            </div>
            <div className="form-row" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Urgency Level</label>
                <select
                  value={newAnnouncement.type}
                  onChange={e => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
                  style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', height: '48px' }}
                >
                  <option value="info">Information (Blue)</option>
                  <option value="success">Important (Green)</option>
                  <option value="warning">Urgent (Orange/Red)</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <button
                  type="submit"
                  className="admin-submit-btn"
                  disabled={isSendingAnnouncement}
                  style={{ margin: 0, height: '48px', width: '100%', background: 'var(--bg-gradient)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  {isSendingAnnouncement ? 'Sending...' : '📢 Broadcast Message'}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="adm-card" style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div className="table-header-row" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ color: 'var(--text-main)' }}>Previous Announcements</h3>
          </div>
          <div style={{ padding: '1.5rem' }}>
            {announcements.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No announcements sent yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {announcements.map(ann => (
                  <div key={ann.id} style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          background: ann.type === 'warning' ? '#fee2e2' : (ann.type === 'success' ? '#dcfce7' : '#e0f2fe'),
                          color: ann.type === 'warning' ? '#ef4444' : (ann.type === 'success' ? '#10b981' : '#3b82f6')
                        }}>
                          {ann.type}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(ann.created_at).toLocaleString()}</span>
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#10b981',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          background: '#dcfce7',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          marginLeft: '0.5rem'
                        }}>
                          📖 Read by {ann.read_count || 0}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{ann.title}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>{ann.message}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem', color: 'var(--text-muted)' }}
                      title="Delete announcement"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentAffairsManagement = () => (
    <div className="current-affairs-management">
      <div className="view-page-header">
        <div style={{ flex: 1 }}>
          <h1>Daily Current Affairs</h1>
          <p>Upload daily news updates and exam insights for students</p>
        </div>
        <button className="create-course-main-btn" onClick={() => {
          setCAForm({ title: getDefaultCATitle() });
          setIsCAModalOpen(true);
        }}>
          <span>+</span> Post Daily Update
        </button>
      </div>

      <div className="admin-management-section" style={{ marginTop: '2rem' }}>
        <div className="adm-card" style={{ background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Recent Daily Updates</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {currentAffairs.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No updates posted yet.</p>
            ) : (
              currentAffairs.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>🌍</div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)' }}>{item.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Posted on: {new Date(item.published_date).toLocaleString()}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => setCAPreviewItem(item)} style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.85rem', cursor: 'pointer' }}>View</button>
                    <button onClick={() => handleDeleteCA(item.id)} style={{ padding: '0.5rem', borderRadius: '10px', background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isCAModalOpen && (
        <div className="adm-modal-overlay">
          <div className="adm-modal-content" style={{ maxWidth: '500px' }}>
            <div className="adm-modal-header">
              <h2>Post Daily Update</h2>
              <button className="close-modal" onClick={() => setIsCAModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCASubmit} className="adm-modal-form" style={{ padding: '2rem' }}>
              <div className="form-group">
                <label>Update Title</label>
                <input
                  type="text"
                  placeholder="e.g. Daily News - April 11, 2026"
                  value={caForm.title}
                  onChange={e => setCAForm({ ...caForm, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>File (PDF Preferred)</label>
                <input
                  type="file"
                  onChange={e => setCAFile(e.target.files[0])}
                  required
                  style={{ padding: '0.8rem', border: '1.5px dashed var(--border-color)', borderRadius: '12px', width: '100%' }}
                />
              </div>
              <div className="modal-actions" style={{ marginTop: '2rem' }}>
                <button type="button" className="cancel-btn" onClick={() => setIsCAModalOpen(false)}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={isUploadingCA} style={{ background: 'var(--bg-gradient)' }}>
                  {isUploadingCA ? 'Uploading...' : '🚀 Post Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {caPreviewItem && (() => {
        const rawUrl = caPreviewItem.content_url || '';
        // content_url is either a full Azure https:// URL or a local /static/ path
        const absoluteUrl = rawUrl.startsWith('http')
          ? rawUrl
          : `${process.env.REACT_APP_API_URL}${rawUrl}`;
        // Route through our backend proxy which serves with Content-Disposition: inline
        const viewerUrl = `${process.env.REACT_APP_API_URL}/view-file/?url=${encodeURIComponent(absoluteUrl)}`;

        return (
          <div className="adm-modal-overlay">
            <div className="adm-modal-content" style={{ maxWidth: '96%', height: '96vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
              <div className="adm-modal-header" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Preview: {caPreviewItem.title}</h2>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <a
                    href={absoluteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: '0.5rem 1.25rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22c55e', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', textDecoration: 'none' }}
                  >
                    🔗 Open in New Tab
                  </a>
                  <button className="close-modal" onClick={() => setCAPreviewItem(null)}>×</button>
                </div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-main)', borderRadius: '0 0 24px 24px', overflow: 'hidden' }}>
                <iframe
                  src={viewerUrl}
                  title="CA Preview"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            </div>
          </div>
        );
      })()}


    </div>
  );

  const renderScholarships = () => (
    <div className="student-management-page">
      <div className="admin-dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Scholarship Evaluation</h1>
          <p>Review and approve pending scholarship tests</p>
        </div>
        <button 
          onClick={() => { fetchSettings(); setIsScheduleModalOpen(true); }} 
          style={{ background: '#F2921D', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <span>📅</span> Schedule Test
        </button>
      </div>
      
      <div className="admin-management-section">
        <div className="table-header-row">
          <h2>All Evaluations</h2>
        </div>
        
        <table className="adm-table students-full">
          <thead>
            <tr>
              <th>STUDENT NAME</th>
              <th>EMAIL</th>
              <th>TEST SCORE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {pendingScholarships.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No scholarships to evaluate.
                </td>
              </tr>
            ) : pendingScholarships.map(student => (
              <tr key={student.id}>
                <td><span style={{ fontWeight: '700' }}>{student.name || 'Unnamed'}</span></td>
                <td>{student.email}</td>
                <td>
                  <span style={{ fontWeight: '900', color: student.scholarship_score >= 80 ? '#16a34a' : '#ef4444' }}>
                    {student.scholarship_score}/100
                  </span>
                </td>
                <td>
                  <span className={`status-pill ${student.scholarship_status === 'approved' ? 'published' : (student.scholarship_status === 'rejected' || student.scholarship_status === 'rejected_acknowledged') ? 'inactive' : 'pending'}`} style={{ 
                    background: student.scholarship_status === 'approved' ? '#dcfce7' : (student.scholarship_status === 'rejected' || student.scholarship_status === 'rejected_acknowledged') ? '#fee2e2' : '#fef9c3', 
                    color: student.scholarship_status === 'approved' ? '#166534' : (student.scholarship_status === 'rejected' || student.scholarship_status === 'rejected_acknowledged') ? '#991b1b' : '#854d0e', 
                    padding: '0.25rem 0.75rem', borderRadius: '12px', fontWeight: 'bold' 
                  }}>
                    {student.scholarship_status === 'under_evaluation' ? 'Pending' : (student.scholarship_status === 'rejected_acknowledged' ? 'Rejected' : student.scholarship_status.charAt(0).toUpperCase() + student.scholarship_status.slice(1))}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => setViewingAnswersStudent(student)}
                      style={{ padding: '0.5rem 1rem', background: '#F2921D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >View Answers</button>
                    {student.scholarship_status === 'under_evaluation' && (
                      <>
                        <button 
                          onClick={() => handleEvaluateScholarship(student.id, 'approved')}
                          style={{ padding: '0.5rem 1rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >Approve</button>
                        <button 
                          onClick={() => handleEvaluateScholarship(student.id, 'rejected')}
                          style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >Reject</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewingAnswersStudent && (
        <div className="adm-modal-overlay">
          <div className="adm-modal-content" style={{ maxWidth: '600px' }}>
            <div className="adm-modal-header">
              <h2>Answers by {viewingAnswersStudent.name}</h2>
              <button className="close-modal" onClick={() => setViewingAnswersStudent(null)}>×</button>
            </div>
            <div style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {(() => {
                let answers = {};
                try {
                  answers = JSON.parse(viewingAnswersStudent.scholarship_answers_json || '{}');
                } catch(e){}
                
                if (Object.keys(answers).length === 0) {
                  return <p style={{ textAlign: 'center', color: '#64748b' }}>No answers recorded for this student.</p>;
                }

                return Object.entries(answers).map(([qIndex, ans]) => {
                  const qText = scholarshipQuestions[qIndex]?.question || `Question ${parseInt(qIndex) + 1}`;
                  const isCorrect = scholarshipQuestions[qIndex]?.answer === ans;
                  return (
                    <div key={qIndex} style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>{parseInt(qIndex) + 1}. {qText}</p>
                      <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                        Student selected: <span style={{ color: isCorrect ? '#16a34a' : '#ef4444', fontWeight: 'bold' }}>{ans}</span> {isCorrect ? '✓' : '✗'}
                      </p>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {isScheduleModalOpen && (
        <div className="adm-modal-overlay">
          <div className="adm-modal-content" style={{ maxWidth: '500px' }}>
            <div className="adm-modal-header">
              <h2>Schedule Scholarship Test</h2>
              <button className="close-modal" onClick={() => setIsScheduleModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleScheduleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Start Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={scheduleForm.start}
                  onChange={(e) => setScheduleForm({...scheduleForm, start: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
              </div>
              <div className="form-group">
                <label>End Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={scheduleForm.end}
                  onChange={(e) => setScheduleForm({...scheduleForm, end: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
              </div>
              <button type="submit" className="submit-btn" style={{ background: '#F2921D', color: 'white' }}>
                Save Schedule
              </button>
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
      case 'Announcements':
        return renderAnnouncements();
      case 'Current Affairs':
        return renderCurrentAffairsManagement();
      case 'Interviews':
        return renderInterviews();
      case 'Scholarships':
        return renderScholarships();
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
              onClick={() => {
                setActiveMenu(item.name);
                setIsProfileOpen(false);
              }}
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
            <button
              className="adm-header-btn"
              onClick={() => setIsAdminModalOpen(true)}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: 'var(--text-main)' }}
            >
              <span>🛡️</span> Contact Admin
            </button>
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

        <section className="admin-content-inner" onClick={() => setIsProfileOpen(false)}>
          {renderContent()}
        </section>
      </main>

      {/* Admin Contact Modal */}
      {isAdminModalOpen && (
        <div className="adm-modal-overlay">
          <div className="adm-modal-content" style={{ maxWidth: '700px' }}>
            <div className="adm-modal-header">
              <h2>Contact System Administrator</h2>
              <button className="close-modal" onClick={() => setIsAdminModalOpen(false)}>×</button>
            </div>

            <div className="adm-modal-body" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', padding: '2rem' }}>
              {/* Send Form */}
              <div style={{ borderRight: '1px solid #f1f5f9', paddingRight: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>New Request</h3>
                <form onSubmit={handleSendRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Access issue, Test deletion"
                      value={newRequest.subject}
                      onChange={e => setNewRequest({ ...newRequest, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea
                      rows="4"
                      placeholder="Describe your request..."
                      value={newRequest.message}
                      onChange={e => setNewRequest({ ...newRequest, message: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1.5px solid #e2e8f0' }}
                    />
                  </div>
                  <button type="submit" className="admin-submit-btn" disabled={isSendingRequest} style={{ margin: 0 }}>
                    {isSendingRequest ? 'Sending...' : '📬 Send to Admin'}
                  </button>
                </form>
              </div>

              {/* History */}
              <div>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Inquiry History</h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {adminRequests.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '0.9rem' }}>No previous requests.</p>
                  ) : (
                    adminRequests.map(req => (
                      <div key={req.id} style={{ padding: '1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{req.subject}</span>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: req.status === 'replied' ? '#dcfce7' : '#fee2e2',
                            color: req.status === 'replied' ? '#10b981' : '#ef4444'
                          }}>{req.status}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>{req.message}</p>
                        {req.reply && (
                          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'white', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#10b981', marginBottom: '0.25rem' }}>Admin Reply:</span>
                            <p style={{ fontSize: '0.85rem', color: '#1e293b' }}>{req.reply}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
