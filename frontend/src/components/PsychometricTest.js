import React, { useState, useEffect } from 'react';
import '../styles/PsychometricTest.css';

const API = 'http://localhost:8000';

const PsychometricTest = ({ user }) => {
  const [view, setView] = useState('loading'); // loading | landing | table | testing | analyzing | results
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [report, setReport] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [error, setError] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [checkingReport, setCheckingReport] = useState(true); // gate until we know if report exists

  useEffect(() => {
    // Load questions in parallel
    setLoadingQuestions(true);
    fetch(`${API}/psychometric/questions`)
      .then(r => r.json())
      .then(data => { setQuestions(data); setLoadingQuestions(false); })
      .catch(() => { setError('Failed to load questions'); setLoadingQuestions(false); });

    // Check if user already has a report → show results, else show landing
    console.log("PsychometricTest: Checking for report. User:", user);
    
    if (user?.id) {
      setCheckingReport(true);
      fetch(`${API}/psychometric/report/${user.id}`)
        .then(r => r.json())
        .then(data => {
          console.log("PsychometricTest: Report data received:", data);
          if (data.report) {
            setReport(data.report);
            setReportId(data.report_id);
            // Only set view to results if we're not currently testing
            setView(prev => prev === 'testing' || prev === 'analyzing' ? prev : 'results');
          } else {
            setView(prev => prev === 'loading' ? 'landing' : prev);
          }
        })
        .catch((err) => { 
          console.error("PsychometricTest: Error fetching report:", err);
          setView('landing'); 
        })
        .finally(() => setCheckingReport(false));
    } else {
      console.warn("PsychometricTest: No user.id found, defaulting to landing.");
      setView('landing');
      setCheckingReport(false);
    }
  }, [user?.id]); // Use user.id as dependency for better stability

  const startAssessment = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setView('testing');
  };

  // Retake: delete old report from DB, then start fresh
  const retakeAssessment = async () => {
    setReport(null);
    setReportId(null);
    if (user?.id) {
      try {
        await fetch(`${API}/psychometric/report/${user.id}`, { method: 'DELETE' });
      } catch (e) { /* ignore */ }
    }
    setAnswers({});
    setCurrentQuestion(0);
    setView('testing');
  };

  const handleAnswer = (optionText) => {
    const q = questions[currentQuestion];
    const newAnswers = {
      ...answers,
      [q.id]: {
        question_id: q.id,
        question_text: q.text,
        selected_option: optionText,
        category: q.category,
      }
    };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAnswers(newAnswers);
    }
  };

  const submitAnswers = async (finalAnswers) => {
    setView('analyzing');
    setError('');
    try {
      const payload = {
        user_id: user?.id || 1,
        user_name: user?.name || user?.email?.split('@')[0] || 'Student',
        answers: Object.values(finalAnswers),
      };
      const res = await fetch(`${API}/psychometric/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Analysis failed');
      const data = await res.json();
      setReport(data.report);
      setReportId(data.report_id);
      setView('results');
    } catch (err) {
      setError(err.message);
      setView('testing');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getRatingBadgeClass = (rating) => {
    const r = (rating || '').toLowerCase();
    if (r.includes('high') || r.includes('strong') || r.includes('excel') || r.includes('ready') || r.includes('advanc')) return 'badge-green';
    if (r.includes('medium') || r.includes('moderate') || r.includes('good') || r.includes('inter')) return 'badge-amber';
    return 'badge-red';
  };

  // ─── VIEWS ────────────────────────────────────────────────

  const renderLanding = () => (
    <div className="psy-landing">
      <div className="psy-header-card">
        <div className="psy-icon-main">🧠</div>
        <h1>Psychometric Assessment</h1>
        <p>Understand your cognitive strengths, personality traits, and learning patterns through our Gemini AI-powered assessment</p>
        {report && (
          <div className="psy-report-exists-banner">
            ✅ You have a previous report. <button className="psy-link-btn" onClick={() => setView('results')}>View it →</button>
          </div>
        )}
      </div>

      <div className="psy-features-grid">
        <div className="psy-feature-item orange-light">
          <div className="psy-feat-icon">🎯</div>
          <h3>Aptitude Analysis</h3>
          <p>Evaluate logical reasoning, analytical thinking, and problem-solving abilities</p>
        </div>
        <div className="psy-feature-item green">
          <div className="psy-feat-icon">📈</div>
          <h3>Personality Profiling</h3>
          <p>Discover your learning style, stress management, and decision-making patterns</p>
        </div>
        <div className="psy-feature-item purple">
          <div className="psy-feat-icon">⏱️</div>
          <h3>15 Questions</h3>
          <p>Complete assessment at your own pace covering 6 key psychological domains</p>
        </div>
        <div className="psy-feature-item orange">
          <div className="psy-feat-icon">✨</div>
          <h3>AI Insights</h3>
          <p>Get a detailed Gemini AI report with UPSC-specific recommendations</p>
        </div>
      </div>

      <div className="psy-before-start">
        <h3>Before You Start:</h3>
        <ul>
          <li>Find a quiet environment free from distractions</li>
          <li>Answer honestly — there are no right or wrong answers</li>
          <li>Your responses are confidential and used only for personalized recommendations</li>
          <li>The AI will analyze your responses using Google Gemini</li>
        </ul>
      </div>

      <div className="psy-actions">
        <button className="psy-btn-secondary" onClick={() => setView('table')}>
          📋 Preview Questions
        </button>
        <button className="psy-btn-primary" onClick={startAssessment} disabled={loadingQuestions}>
          {loadingQuestions ? 'Loading...' : 'Start Assessment →'}
        </button>
      </div>
      {error && <p className="psy-error">{error}</p>}
    </div>
  );

  const renderTable = () => (
    <div className="psy-table-view">
      <div className="psy-table-header">
        <button className="psy-back-btn" onClick={() => setView('landing')}>← Back</button>
        <h2>📋 Assessment Questions</h2>
        <p>All {questions.length} questions across 6 categories</p>
      </div>
      <div className="psy-table-wrapper">
        <table className="psy-questions-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Category</th>
              <th>Question</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, idx) => (
              <tr key={q.id} className={idx % 2 === 0 ? 'row-even' : 'row-odd'}>
                <td className="psy-q-num">{idx + 1}</td>
                <td><span className={`cat-badge cat-${q.category.toLowerCase().replace(' ', '-')}`}>{q.category}</span></td>
                <td className="psy-q-text">{q.text}</td>
                <td>
                  <ul className="psy-opt-list">
                    {q.options.map((opt, oi) => <li key={oi}>{opt}</li>)}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="psy-actions" style={{ marginTop: '1.5rem' }}>
        <button className="psy-btn-primary" onClick={startAssessment}>Start Assessment →</button>
      </div>
    </div>
  );

  const renderTesting = () => {
    if (!questions.length) return <div className="psy-loading">Loading questions…</div>;
    const q = questions[currentQuestion];
    const progress = ((currentQuestion) / questions.length) * 100;
    const categoryIcons = {
      'Personality': '🧩', 'Cognitive': '🧠', 'Learning Style': '📚',
      'Motivation': '🔥', 'Stress Management': '🌿', 'Time Management': '⏰',
      'Critical Thinking': '🔍'
    };

    return (
      <div className="psy-testing">
        <div className="psy-test-card">
          <div className="psy-progress-container">
            <div className="psy-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="psy-test-meta">
            <span className="psy-category-badge">{categoryIcons[q.category] || '❓'} {q.category}</span>
            <span className="psy-question-count">Question {currentQuestion + 1} / {questions.length}</span>
          </div>
          <h2 className="psy-question-text">{q.text}</h2>
          <div className="psy-options-list">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                className="psy-option-btn"
                onClick={() => handleAnswer(opt)}
              >
                <span className="psy-opt-letter">{String.fromCharCode(65 + idx)}</span>
                {opt}
              </button>
            ))}
          </div>
          {error && <p className="psy-error">{error}</p>}
        </div>
      </div>
    );
  };

  const renderAnalyzing = () => (
    <div className="psy-analyzing">
      <div className="psy-analyzing-card">
        <div className="psy-ai-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <h2>🤖 Gemini AI is Analyzing Your Responses</h2>
        <p>Our AI is building your personalized psychometric profile…</p>
        <div className="psy-analyzing-steps">
          <div className="psy-step psy-step-done">✅ Responses recorded</div>
          <div className="psy-step psy-step-active">🔄 Analyzing personality patterns…</div>
          <div className="psy-step psy-step-pending">⏳ Generating UPSC recommendations…</div>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!report) return null;
    const scores = report.scores || {};
    const allScores = [
      { label: 'Personality', key: 'personality', icon: '🧩' },
      { label: 'Cognitive Strength', key: 'cognitive_strength', icon: '🧠' },
      { label: 'Learning Style', key: 'learning_style', icon: '📚' },
      { label: 'Motivation', key: 'motivation', icon: '🔥' },
      { label: 'Stress Management', key: 'stress_management', icon: '🌿' },
      { label: 'Time Management', key: 'time_management', icon: '⏰' },
    ];

    return (
      <div className="psy-results">
        {/* Header */}
        <div className="psy-results-header">
          <div className="psy-success-icon">🎉</div>
          <h2>Your Psychometric Report</h2>
          <p className="psy-overall-profile">{report.overall_profile}</p>
        </div>

        {/* UPSC Readiness Banner */}
        {report.upsc_readiness && (
          <div className="psy-readiness-banner">
            <div className="psy-readiness-left">
              <span className="psy-readiness-label">UPSC Readiness Score</span>
              <div className="psy-readiness-bar-wrap">
                <div
                  className="psy-readiness-bar"
                  style={{ width: `${report.upsc_readiness.score}%`, background: getScoreColor(report.upsc_readiness.score) }}
                ></div>
              </div>
              <p className="psy-readiness-desc">{report.upsc_readiness.description}</p>
            </div>
            <div className="psy-readiness-right">
              <div
                className="psy-readiness-score-circle"
                style={{ borderColor: getScoreColor(report.upsc_readiness.score), color: getScoreColor(report.upsc_readiness.score) }}
              >
                <span className="psy-readiness-num">{report.upsc_readiness.score}</span>
                <span className="psy-readiness-level">{report.upsc_readiness.level}</span>
              </div>
            </div>
          </div>
        )}

        {/* Score Cards */}
        <div className="psy-scores-grid">
          {allScores.map(({ label, key, icon }) => {
            const s = scores[key] || {};
            const score = s.score || 0;
            return (
              <div key={key} className="psy-score-card">
                <div className="psy-score-card-top">
                  <span className="psy-score-icon">{icon}</span>
                  <span className={`psy-rating-badge ${getRatingBadgeClass(s.rating || s.style)}`}>
                    {s.rating || s.style || '—'}
                  </span>
                </div>
                <h4>{label}</h4>
                <div className="psy-score-bar-wrap">
                  <div
                    className="psy-score-bar"
                    style={{ width: `${score}%`, background: getScoreColor(score) }}
                  ></div>
                </div>
                <div className="psy-score-num" style={{ color: getScoreColor(score) }}>{score}/100</div>
                <p className="psy-score-desc">{s.description}</p>
              </div>
            );
          })}
        </div>

        {/* Strengths & Areas for Improvement */}
        <div className="psy-swot-grid">
          <div className="psy-swot-card psy-strengths">
            <h3>💪 Strengths</h3>
            <ul>
              {(report.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div className="psy-swot-card psy-improvements">
            <h3>🎯 Areas for Improvement</h3>
            <ul>
              {(report.areas_for_improvement || []).map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        {report.personalized_recommendations && (
          <div className="psy-recommendations">
            <h3>🚀 Personalized Recommendations</h3>
            <div className="psy-recs-grid">
              {report.personalized_recommendations.map((rec, i) => (
                <div key={i} className={`psy-rec-card psy-priority-${(rec.priority || 'medium').toLowerCase()}`}>
                  <div className="psy-rec-top">
                    <h4>{rec.title}</h4>
                    <span className={`psy-priority-badge priority-${(rec.priority || 'medium').toLowerCase()}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p>{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Study Plan */}
        {report.study_plan_suggestion && (
          <div className="psy-study-plan">
            <h3>📅 Recommended Study Approach</h3>
            <p>{report.study_plan_suggestion}</p>
          </div>
        )}

        {/* Motivational Message */}
        {report.motivational_message && (
          <div className="psy-motivation-card">
            <span className="psy-quote-icon">💬</span>
            <p>{report.motivational_message}</p>
          </div>
        )}

        <div className="psy-actions" style={{ marginTop: '2rem' }}>
          <button className="psy-btn-secondary" onClick={() => setView('landing')}>← Back to Landing</button>
          <button className="psy-btn-primary" onClick={retakeAssessment}>🔄 Retake Assessment</button>
        </div>
      </div>
    );
  };

  // Show a loading gate while we check for existing report
  if (checkingReport) {
    return (
      <div className="psychometric-container">
        <div className="psy-analyzing">
          <div className="psy-analyzing-card">
            <div className="psy-ai-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <h2>Loading your profile…</h2>
            <p>Checking for existing assessment results</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="psychometric-container">
      {view === 'landing'   && renderLanding()}
      {view === 'table'     && renderTable()}
      {view === 'testing'   && renderTesting()}
      {view === 'analyzing' && renderAnalyzing()}
      {view === 'results'   && renderResults()}
    </div>
  );
};

export default PsychometricTest;
