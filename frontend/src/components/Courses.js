import React, { useState, useEffect } from 'react';
import '../styles/Courses.css';

const Courses = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const url = user && user.id
        ? `http://localhost:8000/courses/student/${user.id}`
        : 'http://localhost:8000/courses/';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const handleEnroll = async (courseId) => {
    if (!user || !user.id) {
      alert("Please login to enroll.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/courses/${courseId}/enroll/${user.id}`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchCourses(); // Refresh courses list to show enrolled state
      } else {
        alert('Failed to enroll');
      }
    } catch (err) {
      console.error("Enrollment failed:", err);
    }
  };

  const filteredCourses = filter === 'All'
    ? courses
    : courses.filter(c => {
      if (filter === 'Enrolled') return c.is_enrolled;
      if (filter === 'Not Enrolled') return !c.is_enrolled;
      if (filter === 'In Progress') return c.is_enrolled && c.status === 'in_progress';
      if (filter === 'Completed') return c.is_enrolled && c.status === 'completed';
      return true;
    });

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="courses-page">
      <div className="page-header">
        <h1>Courses</h1>
        <p>Explore and enroll in comprehensive courses to advance your learning</p>
      </div>

      <div className="filter-tabs">
        {['All Courses', 'Enrolled', 'Not Enrolled', 'In Progress', 'Completed'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${filter === (tab === 'All Courses' ? 'All' : tab) ? 'active' : ''}`}
            onClick={() => setFilter(tab === 'All Courses' ? 'All' : tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="courses-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => {
            const thumbSrc = course.image_url
              ? (course.image_url.startsWith('/static')
                ? `http://localhost:8000${course.image_url}`
                : course.image_url)
              : null;
            return (
              <div key={course.id} className="course-card-full">
                <div
                  className="course-image"
                  style={
                    thumbSrc
                      ? { backgroundImage: `url(${thumbSrc})` }
                      : { background: 'linear-gradient(135deg, #F2921D 0%, #fbbf24 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem' }
                  }
                >
                  {!thumbSrc && <span>📖</span>}
                  <div className="course-category">UPSC</div>
                </div>
                <div className="course-info">
                  <h3>{course.title}</h3>
                  {course.description && (
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem', lineHeight: 1.5 }}>{course.description}</p>
                  )}
                  <div className="course-stats">
                    <span>📖 {course.modules} Modules</span>
                    <span>⏱️ {course.lessons} Hours</span>
                  </div>

                  {course.is_enrolled ? (
                    <>
                      <div className="course-progress">
                        <div className="progress-label">
                          <span>Progress</span>
                          <span className="progress-percent">{course.progress || 0}%</span>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: `${course.progress || 0}%` }}></div>
                        </div>
                      </div>
                      <button className="continue-btn" style={{ background: course.status === 'completed' ? '#10b981' : '' }}>
                        {course.status === 'completed' ? 'Completed' : 'Continue Learning'}
                      </button>
                    </>
                  ) : (
                    <button
                      className="continue-btn"
                      style={{ background: 'var(--bg-gradient)', color: 'white', border: 'none', padding: '0.85rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', marginTop: '1rem', width: '100%' }}
                      onClick={() => handleEnroll(course.id)}
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-courses">No courses found in this filter.</div>
        )}
      </div>
    </div>
  );
};

export default Courses;
