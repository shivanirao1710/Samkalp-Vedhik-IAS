import React, { useState, useEffect } from 'react';
import '../styles/Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:8000/courses/');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = filter === 'All' 
    ? courses 
    : courses.filter(c => {
        if (filter === 'In Progress') return c.status === 'in_progress';
        if (filter === 'Completed') return c.status === 'completed';
        if (filter === 'Not Started') return c.status === 'not_started';
        return true;
      });

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="courses-page">
      <div className="page-header">
        <h1>My Courses</h1>
        <p>Continue your learning journey with our comprehensive courses</p>
      </div>

      <div className="filter-tabs">
        {['All Courses', 'In Progress', 'Completed', 'Not Started'].map(tab => (
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
                <div className="course-progress">
                  <div className="progress-label">
                    <span>Progress</span>
                    <span className="progress-percent">{course.progress}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${course.progress}%` }}></div>
                  </div>
                </div>
                <button className="continue-btn">Continue Learning</button>
              </div>
            </div>
            );
          })
        ) : (
          <div className="no-courses">No courses found in this category.</div>
        )}
      </div>
    </div>
  );
};

export default Courses;
