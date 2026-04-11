import React, { useState, useEffect } from 'react';
import '../styles/shared-layout.css';
import '../styles/Dashboard.css';
import Courses from './Courses';
import Tests from './Tests';
import PsychometricTest from './PsychometricTest';
import AIMentor from './AIMentor';
import LiveClasses from './LiveClasses';
import ThemeToggle from './ThemeToggle';
import Interview from './Interview';
import StudyMaterials from './StudyMaterials';
import StudentProfile from './StudentProfile';
import Settings from './Settings';
import AIDoubtSolver from './AIDoubtSolver';
import CurrentAffairs from './CurrentAffairs';
import logo from '../images/logo.png';

const Dashboard = ({ user, onLogout, onUserUpdate }) => {
  const [currentView, setCurrentView] = useState('Dashboard');
  const [isMentorToggle, setIsMentorToggle] = useState(false);

  // Live Data States
  const [dashboardStats, setDashboardStats] = useState({
    overallProgress: '0%',
    learningHours: '0h',
    testsCompleted: '0/0',
    dayStreak: '0'
  });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [latestCA, setLatestCA] = useState(null);
  const [showCAPopup, setShowCAPopup] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchLatestCA();
    return () => clearInterval(timer);
  }, []);

  const fetchLatestCA = async () => {
    try {
        const res = await fetch('http://localhost:8000/current-affairs/');
        if (res.ok) {
            const data = await res.json();
            if (data.length > 0) {
                setLatestCA(data[0]);
                // Show popup if it's from today or yesterday
                const uploadDate = new Date(data[0].published_date);
                const diffDays = Math.abs(new Date() - uploadDate) / (1000 * 60 * 60 * 24);
                if (diffDays <= 2) {
                    setTimeout(() => setShowCAPopup(true), 2000); // Wait 2s for login feel
                }
            }
        }
    } catch (err) { console.error(err); }
  };

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const markAsRead = async (notiId) => {
    try {
      const resp = await fetch(`http://localhost:8000/notifications/${notiId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      if (resp.ok) {
        setNotifications(prev => prev.map(n => n.id === notiId ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Only fetch if we are actually viewing the main dashboard summary
      if (currentView !== 'Dashboard') return;

      setLoading(true);
      try {
        // 1. Sync profile
        const profileResp = await fetch(`http://localhost:8000/users/me/${user.id}`);
        if (profileResp.ok) {
          const updatedUser = await profileResp.json();
          onUserUpdate(updatedUser);
        }

        // 2. Fetch Stats
        const statsResp = await fetch(`http://localhost:8000/users/stats/${user.id}`);
        if (statsResp.ok) {
          const statsData = await statsResp.json();
          setDashboardStats({
            overallProgress: '0%',
            learningHours: statsData.study_streak > 0 ? (statsData.study_streak * 1.5).toFixed(1) + 'h' : '0h',
            testsCompleted: `${statsData.tests_taken}/20`,
            dayStreak: statsData.study_streak.toString()
          });
        }

        // 3. Fetch Enrolled Courses
        const courseResp = await fetch(`http://localhost:8000/courses/student/${user.id}`);
        if (courseResp.ok) {
          const courses = await courseResp.json();
          setEnrolledCourses(courses.filter(c => c.is_enrolled));
        }

        // 4. Fetch Tests
        const testsResp = await fetch(`http://localhost:8000/tests/`);
        if (testsResp.ok) {
          const tests = await testsResp.json();
          setUpcomingTests(tests.slice(0, 2));
        }

        // 5. Fetch Live Sessions
        const liveResp = await fetch(`http://localhost:8000/live-classes/`);
        if (liveResp.ok) {
          const sessions = await liveResp.json();
          setLiveSessions(sessions.slice(0, 1));
        }

        // 6. Fetch Notifications
        const notiResp = await fetch(`http://localhost:8000/notifications/?user_id=${user.id}`);
        if (notiResp.ok) {
          const notis = await notiResp.json();
          setNotifications(notis);
          setUnreadCount(notis.filter(n => !n.is_read).length);
        }

      } catch (err) {
        console.error("Dashboard data sync error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.id, currentView]); // RE-FETCH WHEN USER CLICKS BACK ON DASHBOARD

  const menuItems = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'Courses', icon: '📖' },
    { name: 'Study Materials', icon: '📚' },
    { name: 'Mock Tests', icon: '📝' },
    { name: 'Mock Interview', icon: '📹' },
    { name: 'Psychometric Test', icon: '🧠' },
    { name: 'Live Classes', icon: '📺' },
    { name: 'Current Affairs', icon: '🌍' },
    { name: 'AI Doubt Solver', icon: '❓' },
  ];

  const statCards = [
    { label: 'Overall Progress', value: dashboardStats.overallProgress, change: '+2%', icon: '🎯', color: '#fff7ed' },
    { label: 'Learning Hours', value: dashboardStats.learningHours, change: '+1.5h', icon: '⏱️', color: '#fff7ed' },
    { label: 'Tests Completed', value: dashboardStats.testsCompleted, change: 'total', icon: '📈', color: '#f0fdf4' },
    { label: 'Day Streak', value: dashboardStats.dayStreak, change: 'Active', icon: '📅', color: '#f5f3ff' },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'Courses':
        return <Courses user={user} />;
      case 'Mock Tests':
        return <Tests />;
      case 'Study Materials':
        return <StudyMaterials user={user} />;
      case 'Mock Interview':
        return <Interview user={user} />;
      case 'Psychometric Test':
        return <PsychometricTest user={user} />;
      case 'Live Classes':
        return <LiveClasses user={user} />;
      case 'AI Doubt Solver':
        return <AIDoubtSolver user={user} />;
      case 'Current Affairs':
        return <CurrentAffairs user={user} />;
      case 'Profile':
        return <StudentProfile user={user} onUserUpdate={onUserUpdate} onLogout={onLogout} onBack={() => setCurrentView('Dashboard')} />;
      case 'Settings':
        return <Settings user={user} onBack={() => setCurrentView('Dashboard')} />;
      case 'Dashboard':
      default:
        const mainCourse = enrolledCourses.length > 0 ? enrolledCourses[0] : null;

        return (
          <>
            <section className="hero-banner">
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Good Morning, {user.name || user.email.split('@')[0]}! 👋</h2>
              <p className="hero-subtitle" style={{ opacity: 0.9 }}>
                {enrolledCourses.length > 0
                  ? `You are currently enrolled in ${enrolledCourses.length} courses. Keep going!`
                  : "Welcome to Samkalp Vedhik. Find a course to start your mission!"}
              </p>
            </section>


            <div className="stats-grid">
              {statCards.map((stat) => (
                <div key={stat.label} className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon" style={{ backgroundColor: stat.color }}>{stat.icon}</div>
                    <span className="stat-change" style={{ color: '#F2921D' }}>{stat.change}</span>
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
                  <button onClick={() => setCurrentView('Courses')} className="view-all" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>View All</button>
                </div>

                {mainCourse ? (
                  <div className="course-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontWeight: '700' }}>{mainCourse.title}</h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>{mainCourse.progress || 0}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-inner" style={{ width: `${mainCourse.progress || 0}%` }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                      <span>{mainCourse.modules} modules</span>
                      <button
                        onClick={() => setCurrentView('Courses')}
                        style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '700', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        Continue Learning →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="course-card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You haven't enrolled in any courses yet.</p>
                    <button onClick={() => setCurrentView('Courses')} className="admin-submit-btn" style={{ width: 'auto', padding: '0.5rem 2rem' }}>Browse Courses</button>
                  </div>
                )}
              </section>

              <aside>
                <div className="section-title">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Upcoming Tests</h3>
                  <button onClick={() => setCurrentView('Tests')} className="view-all" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>View All</button>
                </div>

                <div className="test-list">
                  {upcomingTests.length > 0 ? (
                    upcomingTests.map(test => (
                      <div key={test.id} className="test-item">
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.25rem' }}>{test.title}</h4>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {test.category} • {test.duration_mins} mins
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="test-item" style={{ opacity: 0.6 }}>No tests scheduled</div>
                  )}
                </div>

                <div className="section-title" style={{ marginTop: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Live Sessions</h3>
                  <button onClick={() => setCurrentView('Live Classes')} className="view-all" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>View All</button>
                </div>

                {liveSessions.length > 0 ? (
                  <div className="live-item-mini" style={{ padding: '1.25rem', background: '#fff7ed', borderRadius: '16px', border: '1px solid #ffedd5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>📺</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Streaming Soon</span>
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>{liveSessions[0].title}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#7c2d12', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                      <span>📅 {liveSessions[0].date}</span>
                      <span>⏰ {liveSessions[0].time}</span>
                    </p>
                    <button
                      onClick={() => setCurrentView('Live Classes')}
                      style={{ width: '100%', marginTop: '1rem', padding: '0.6rem', background: '#F2921D', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Join Waiting Room
                    </button>
                  </div>
                ) : (
                  <div className="live-item-mini" style={{ padding: '1.25rem', opacity: 0.6, textAlign: 'center' }}>
                    No upcoming live sessions
                  </div>
                )}
              </aside>
            </div>
          </>
        );
    }
  };

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Samkalp Logo" className="brand-logo" />
        </div>



        <nav className="nav-menu">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setCurrentView(item.name);
                setIsProfileOpen(false);
              }}
              className={`nav-item ${currentView === item.name ? 'active' : ''}`}
              style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <button onClick={onLogout} className="common-logout-btn">
          <span className="icon">↪</span> Sign Out
        </button>
      </aside>



      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="live-clock-wrapper" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
            <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }}></div>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '0.02em' }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              | {currentTime.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>

            {showCAPopup && latestCA && (
                <div className="ca-login-popup" style={{ 
                    position: 'absolute', 
                    top: '60px', 
                    left: '0', 
                    background: 'var(--bg-card)', 
                    padding: '1rem 1.5rem', 
                    borderRadius: '20px', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)', 
                    border: '1.5px solid var(--primary)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    zIndex: 1000, 
                    animation: 'slideDown 0.5s ease',
                    minWidth: '350px',
                    textAlign: 'left'
                }}>
                    <div style={{ fontSize: '1.5rem' }}>🌎</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>Daily Briefing Ready</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', display: 'block' }}>{latestCA.title}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button 
                            onClick={() => { setCurrentView('Current Affairs'); setShowCAPopup(false); }}
                            style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: 'var(--bg-gradient)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                        >Read Now</button>
                        <button 
                            onClick={() => setShowCAPopup(false)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-muted)', padding: '0 5px' }}
                        >✕</button>
                    </div>
                </div>
            )}
          </div>

          <div className="profile-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ThemeToggle />
            <div className="user-profile">
              <div className="notification-bell-wrapper" onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); }}>
                <span className="notification-bell">🔔</span>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </div>
              <div className="user-info-text" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <div className="user-name">{user.name || user.email.split('@')[0]}</div>
                <div className="user-role">Student</div>
              </div>

              {showNotifications && (
                <div className="notifications-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="notifications-header">
                    <h4>Notifications</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {notifications.length > 0 && <button onClick={() => setNotifications([])} className="clear-all">Clear All</button>}
                      <button
                        onClick={() => setShowNotifications(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#64748b', lineHeight: 1, padding: '2px 6px', borderRadius: '6px' }}
                        title="Close"
                      >✕</button>
                    </div>
                  </div>
                  <div className="notifications-list">
                    {notifications.length > 0 ? (
                      notifications.map(noti => (
                        <div key={noti.id} className={`notification-item ${noti.type} ${noti.is_read ? 'read' : ''}`}>
                          <div
                            className="noti-icon"
                            onClick={() => !noti.is_read && markAsRead(noti.id)}
                            style={{ cursor: noti.is_read ? 'default' : 'pointer', transition: 'all 0.2s', filter: noti.is_read ? 'grayscale(0)' : 'none' }}
                            title={noti.is_read ? "Read" : "Mark as read"}
                          >
                            {noti.is_read ? '✅' : (noti.type === 'warning' ? '⚠️' : (noti.type === 'success' ? '✅' : '📢'))}
                          </div>
                          <div className="noti-content" onClick={() => !noti.is_read && markAsRead(noti.id)} style={{ cursor: noti.is_read ? 'default' : 'pointer' }}>
                            <h5 style={{ textDecoration: noti.is_read ? 'none' : 'none', opacity: noti.is_read ? 0.7 : 1 }}>{noti.title}</h5>
                            <p style={{ opacity: noti.is_read ? 0.6 : 1 }}>{noti.message}</p>
                            <span className="noti-time">{new Date(noti.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-notifications">
                        <p>No new notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="avatar" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                {(user.name || user.email).substring(0, 2).toUpperCase()}
              </div>

              {isProfileOpen && (
                <div className="profile-dropdown" style={{ top: '60px' }}>
                  <button className="dropdown-item" onClick={() => { setCurrentView('Profile'); setIsProfileOpen(false); }}>
                    <span className="icon">👤</span> My Profile
                  </button>
                  <button className="dropdown-item" onClick={() => { setCurrentView('Settings'); setIsProfileOpen(false); }}>
                    <span className="icon">⚙️</span> Settings
                  </button>
                  <button className="dropdown-item logout" onClick={onLogout} style={{ color: '#ef4444' }}>
                    <span className="icon">↪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div onClick={() => setIsProfileOpen(false)} style={{ minHeight: 'calc(100vh - 80px)' }}>
          {renderContent()}
        </div>
      </main>

      {/* Floating Platform Guide */}
      <div className="mentor-fab-container">
        {isMentorToggle && (
          <div className="mentor-floating-window">
            <AIMentor user={user} isFloating={true} onClose={() => setIsMentorToggle(false)} />
          </div>
        )}
        <button
          className={`mentor-fab ${isMentorToggle ? 'active' : ''}`}
          onClick={() => setIsMentorToggle(!isMentorToggle)}
          title="Platform Guide AI"
        >
          {isMentorToggle ? '✕' : '🤖'}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
