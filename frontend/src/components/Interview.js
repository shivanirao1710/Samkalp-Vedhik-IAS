import React, { useState, useEffect } from 'react';
import VideoInterview from './VideoInterview';
import '../styles/Interview.css';

const Interview = ({ user }) => {
    const [phase, setPhase] = useState('landing'); // landing | interview | results | history
    const [analysis, setAnalysis] = useState(null);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('start'); // start | history
    const [difficulty, setDifficulty] = useState('Medium'); // Easy | Medium | Hard
    const [stats, setStats] = useState({ total_interviews: 0, avg_score: 0, improvement: '0%' });

    useEffect(() => {
        if (user?.id) fetchStats();
    }, [user?.id]);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/interview/stats/${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const startInterview = () => {
        setPhase('interview');
    };

    const fetchHistory = async () => {
        setHistory([]); // Clear old history
        setActiveTab('history'); // Switch tab immediately for responsiveness
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/interview/history/${user?.id}`);
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (err) {
            console.error("Fetch History Error:", err);
        }
    };

    const handleInterviewComplete = async (data, transcriptText) => {
        setAnalysis({ ...data, transcript: transcriptText });
        setPhase('results');
        
        // Store the result in the database
        if (user?.id) {
            try {
                await fetch(`${process.env.REACT_APP_API_URL}/api/interview/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.id,
                        analysis: data,
                        transcript: transcriptText,
                        timestamp: new Date().toISOString()
                    })
                });
                fetchStats(); // Refresh stats on dashboard
            } catch (err) {
                console.error("Failed to store interview result:", err);
            }
        }
    };

    const viewPastReport = (report) => {
        setAnalysis(report);
        setPhase('results');
    };

    const deleteResult = async (id) => {
        if (!window.confirm("Are you sure you want to delete this interview result?")) return;
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/interview/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchHistory(); // Refresh list
                fetchStats();   // Refresh dashboard stats
            }
        } catch (err) {
            console.error("Delete Error:", err);
        }
    };

    if (phase === 'interview') {
        return <VideoInterview 
            user={user} 
            onComplete={handleInterviewComplete} 
            difficulty={difficulty} 
            onAbort={() => setPhase('landing')}
        />;
    }

    if (phase === 'results' && analysis) {
        return (
            <div className="interview-results-page">
                <div className="results-header text-center">
                    <div className="badge-purple">Interview Complete</div>
                    <h2>Board Analysis Report</h2>
                    <p className="overall-score">Score: <span>{analysis.overall_score}/100</span></p>
                </div>

                <div className="results-grid">
                    <div className="stats-main">
                        <div className="stat-circle">
                            <div className="stat-value">{analysis.communication_skills}</div>
                            <div className="stat-label">Communication</div>
                        </div>
                        <div className="stat-circle">
                            <div className="stat-value">{analysis.knowledge_depth}</div>
                            <div className="stat-label">Knowledge</div>
                        </div>
                        <div className="stat-circle">
                            <div className="stat-value">{analysis.analytical_ability}</div>
                            <div className="stat-label">Analytical</div>
                        </div>
                    </div>

                    <div className="feedback-section">
                        <h3>📋 Detailed Feedback</h3>
                        <p className="feedback-text">{analysis.feedback}</p>
                        
                        <div className="swot-grid">
                            <div className="swot-card strength">
                                <h4>💪 Strengths</h4>
                                <ul>{analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                            </div>
                            <div className="swot-card improvement">
                                <h4>🎯 Improvements</h4>
                                <ul>{analysis.areas_for_improvement.map((a, i) => <li key={i}>{a}</li>)}</ul>
                            </div>
                        </div>

                        <div className="verdict-box">
                            <strong>Panel Verdict:</strong>
                            <p>{analysis.verdict}</p>
                        </div>

                        {analysis.transcript && (
                            <div className="transcript-section" style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1rem' }}>🎙️ Your Responses (Transcript)</h3>
                                <div style={{ 
                                    background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', 
                                    fontSize: '0.9rem', color: '#475569', lineHeight: '1.8', fontStyle: 'italic',
                                    maxHeight: '300px', overflowY: 'auto'
                                }}>
                                    "{analysis.transcript}"
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="results-actions text-center" style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button 
                        className="start-interview-btn" 
                        style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}
                        onClick={() => setPhase('landing')}
                    >
                        Back to Dashboard
                    </button>
                    <button className="start-interview-btn" onClick={() => setPhase('landing')}>Retake Mock Interview</button>
                </div>

                <style>{`
                    .interview-results-page { padding: 2rem; max-width: 1000px; margin: 0 auto; animation: fadeIn 0.5s ease-out; }
                    .overall-score { font-size: 1.5rem; margin-top: 1rem; }
                    .overall-score span { font-weight: 800; color: #3b82f6; font-size: 2.5rem; }
                    .results-grid { display: grid; grid-template-columns: 300px 1fr; gap: 2rem; margin-top: 3rem; }
                    .stats-main { display: flex; flex-direction: column; gap: 2rem; }
                    .stat-circle { background: white; padding: 2rem; border-radius: 20px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                    .stat-value { font-size: 2rem; font-weight: 800; color: #1e293b; }
                    .stat-label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; margin-top: 0.5rem; }
                    .feedback-section { background: white; padding: 2.5rem; border-radius: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                    .feedback-text { color: #475569; line-height: 1.6; margin: 1rem 0 2rem 0; }
                    .swot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
                    .swot-card { padding: 1.5rem; border-radius: 16px; }
                    .swot-card.strength { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
                    .swot-card.improvement { background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; }
                    .swot-card h4 { margin-bottom: 1rem; }
                    .swot-card ul { padding-left: 1.25rem; }
                    .verdict-box { background: #eff6ff; border: 1px solid #bfdbfe; padding: 1.5rem; border-radius: 16px; color: #1e40af; }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                `}</style>
            </div>
        );
    }

    return (
        <div className="interview-container">
            <div className="interview-header text-center">
                <div className="badge-purple">
                    <span className="icon">✨</span> AI-Powered Mock Interview
                </div>
                <h2>Practice with AI Interview Coach</h2>
                
                <div className="interview-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'start' ? 'active' : ''}`}
                        onClick={() => setActiveTab('start')}
                    >
                        New Interview
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={fetchHistory}
                    >
                        Past Results
                    </button>
                </div>
            </div>

            {activeTab === 'start' ? (
                <div className="interview-content">
                    <div className="interview-left">
                        <div className="interview-banner">
                            <div className="banner-overlay">
                                <h3>Master Your Interview Skills</h3>
                                <p>Build confidence with AI-powered practice</p>
                            </div>
                        </div>

                        <div className="stats-row">
                            <div className="stat-card">
                                <div className="stat-value text-blue">{stats.total_interviews}</div>
                                <div className="stat-label">Interviews<br />Completed</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value text-green">{stats.avg_score}%</div>
                                <div className="stat-label">Avg Score<br />Lifetime</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value text-purple">{stats.improvement}</div>
                                <div className="stat-label">Improvement<br />Velocity</div>
                            </div>
                        </div>
                    </div>

                    <div className="interview-right">
                        <div className="guidelines-card">
                            <h3>Before You Begin</h3>

                            <div className="guideline-item">
                                <div className="guideline-icon bg-blue">💻</div>
                                <div className="guideline-text">
                                    <h4>Enable Camera & Microphone</h4>
                                    <p>Allow browser permissions to use your camera and microphone for the interview</p>
                                </div>
                            </div>

                            <div className="guideline-item">
                                <div className="guideline-icon bg-green">✓</div>
                                <div className="guideline-text">
                                    <h4>Find a Quiet Space</h4>
                                    <p>Ensure you're in a well-lit, quiet environment with minimal distractions</p>
                                </div>
                            </div>

                            <div className="guideline-item">
                                <div className="guideline-icon bg-orange">⏱</div>
                                <div className="guideline-text">
                                    <h4>Estimated Duration</h4>
                                    <p>The interview will take approximately 15-20 minutes to complete</p>
                                </div>
                            </div>

                            <div className="guideline-item">
                                <div className="guideline-icon bg-purple">!</div>
                                <div className="guideline-text">
                                    <h4>AI Analysis</h4>
                                    <p>Get instant feedback on communication, emotions, and content quality</p>
                                </div>
                            </div>

                            <div className="expectations-box">
                                <h4>What to Expect</h4>
                                <ul>
                                    <li>5 questions covering your background, knowledge, and situational responses</li>
                                    <li>Real-time board member feedback</li>
                                    <li>Detailed report with improvement suggestions</li>
                                </ul>
                            </div>

                        <div className="difficulty-selector" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Choose Interview Level</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                {['Easy', 'Medium', 'Hard'].map(level => (
                                    <button 
                                        key={level}
                                        onClick={() => setDifficulty(level)}
                                        style={{ 
                                            padding: '0.5rem', 
                                            borderRadius: '8px', 
                                            border: '1px solid',
                                            borderColor: difficulty === level ? 'var(--primary)' : 'var(--border-color)',
                                            background: difficulty === level ? 'rgba(242, 146, 29, 0.1)' : 'transparent',
                                            color: difficulty === level ? 'var(--primary)' : 'var(--text-muted)',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button className="start-interview-btn" onClick={startInterview}>Start AI Interview</button>
                            <p className="consent-text">By starting, you consent to video and audio recording for analysis</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="interview-history-list">
                    {history.length > 0 ? (
                        <div className="history-grid">
                            {history.map(item => (
                                <div key={item.id} className="history-card" style={{ position: 'relative' }}>
                                    <button 
                                        onClick={() => deleteResult(item.id)}
                                        style={{ 
                                            position: 'absolute', top: '-10px', right: '-10px', 
                                            background: 'white', color: '#dc2626', border: '1px solid #fee2e2',
                                            width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', zIndex: 10,
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                        title="Delete Result"
                                    >
                                        🗑️
                                    </button>
                                    <div className="card-header">
                                        <div className="card-date">{item.date}</div>
                                        <div className="card-score">{item.overall_score}%</div>
                                    </div>
                                    <h4>Mock Interview #{item.id}</h4>
                                    <p className="card-summary">{item.feedback}</p>
                                    <button 
                                        className="start-interview-btn action-link" 
                                        onClick={() => viewPastReport(item)}
                                    >
                                        View Full Report
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No past interview results found. Start your first practice session!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Interview;
