import React, { useState, useEffect } from 'react';
import '../styles/shared-layout.css';

const CoursePlayer = ({ courseId, user, onBack }) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/courses/student/${user.id}`);
        if (response.ok) {
          const allCourses = await response.json();
          const currentCourse = allCourses.find(c => c.id === parseInt(courseId));
          if (currentCourse) {
            setCourse(currentCourse);
            // Default to first lesson of first module
            if (currentCourse.course_modules && currentCourse.course_modules.length > 0) {
              const firstModule = currentCourse.course_modules[0];
              if (firstModule.lessons && firstModule.lessons.length > 0) {
                setSelectedLesson(firstModule.lessons[0]);
              }
              // Expand first module by default
              setExpandedModules({ [firstModule.id]: true });
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch course details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, user.id]);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Course Player...</div>;
  if (!course) return <div style={{ padding: '2rem', textAlign: 'center' }}>Course not found or you are not enrolled.</div>;

  return (
    <div className="course-player-container" style={{ display: 'flex', height: 'calc(100vh - 80px)', overflow: 'hidden', background: '#fff' }}>
      {/* Sidebar */}
      <div className="course-player-sidebar" style={{ width: '320px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
        <div className="sidebar-header" style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#F2921D', fontWeight: '700', cursor: 'pointer', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            ← Back to Courses
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', lineHeight: 1.3 }}>{course.title}</h2>
          <div style={{ marginTop: '0.75rem', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${course.progress || 0}%`, height: '100%', background: '#F2921D' }}></div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem', fontWeight: '600' }}>{course.progress || 0}% Completed</p>
        </div>

        <div className="modules-list" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {course.course_modules.map((module, mIdx) => (
            <div key={module.id} style={{ marginBottom: '0.5rem' }}>
              <div 
                onClick={() => toggleModule(module.id)}
                style={{ 
                  padding: '0.75rem', 
                  background: expandedModules[module.id] ? '#fff' : 'transparent', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  border: expandedModules[module.id] ? '1px solid #e2e8f0' : '1px solid transparent'
                }}
              >
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b' }}>
                  {mIdx + 1}. {module.title}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{expandedModules[module.id] ? '▲' : '▼'}</span>
              </div>
              
              {expandedModules[module.id] && (
                <div style={{ marginTop: '0.25rem', marginLeft: '0.5rem' }}>
                  {module.lessons.map((lesson, lIdx) => (
                    <div 
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      style={{ 
                        padding: '0.6rem 1rem', 
                        borderRadius: '6px', 
                        cursor: 'pointer', 
                        fontSize: '0.85rem', 
                        color: selectedLesson?.id === lesson.id ? '#fff' : '#475569',
                        background: selectedLesson?.id === lesson.id ? '#F2921D' : 'transparent',
                        marginBottom: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span>{lesson.content_type === 'video' ? '🎬' : (lesson.content_type === 'pdf' ? '📄' : '📝')}</span>
                      <span style={{ fontWeight: selectedLesson?.id === lesson.id ? '700' : '500' }}>{lesson.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="course-player-main" style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: '#fff' }}>
        {selectedLesson ? (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b', marginBottom: '1.5rem' }}>{selectedLesson.title}</h1>
            
            <div className="content-viewer" style={{ minHeight: '400px', background: '#f8fafc', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              {selectedLesson.content_type === 'video' ? (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                  <iframe 
                    src={selectedLesson.content_url.includes('youtube.com') || selectedLesson.content_url.includes('youtu.be')
                      ? selectedLesson.content_url.replace('watch?v=', 'embed/').split('&')[0]
                      : (selectedLesson.content_url.startsWith('http') ? selectedLesson.content_url : `${process.env.REACT_APP_API_URL}${selectedLesson.content_url}`)
                    }
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allowFullScreen
                    title={selectedLesson.title}
                  ></iframe>
                </div>
              ) : selectedLesson.content_type === 'pdf' ? (
                <iframe 
                  src={selectedLesson.content_url.startsWith('http') ? selectedLesson.content_url : `${process.env.REACT_APP_API_URL}${selectedLesson.content_url}`}
                  style={{ width: '100%', height: '800px', border: 'none' }}
                  title={selectedLesson.title}
                ></iframe>
              ) : (
                <div style={{ padding: '2rem', lineHeight: '1.8', color: '#334155', fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
                  {selectedLesson.content_url}
                </div>
              )}
            </div>

            <div className="lesson-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
               <button style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}>
                  ← Previous Lesson
               </button>
               <button style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#F2921D', border: 'none', fontWeight: '700', color: '#fff', cursor: 'pointer' }}>
                  Complete & Next →
               </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
            <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>📖</span>
            <h2>Select a lesson to start learning</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
