import React, { useState, useEffect } from 'react';
import VideoAvatarCounselling from './VideoAvatarCounselling';
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

    const downloadPDF = async () => {
        const scoreRows = allScores.map(({ label, key }) => {
            const s = scores[key] || {};
            const score = s.score || 0;
            const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
            return `
                <div style="margin-bottom:18px; padding:16px; border:1px solid #e2e8f0; border-radius:12px; break-inside:avoid;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <strong style="font-size:14px;">${label}</strong>
                        <span style="font-size:13px; font-weight:700; color:${color};">${score}/100</span>
                    </div>
                    <div style="background:#f1f5f9; border-radius:99px; height:8px; overflow:hidden;">
                        <div style="width:${score}%; height:100%; background:${color}; border-radius:99px;"></div>
                    </div>
                    <p style="font-size:12px; color:#64748b; margin-top:8px;">${s.description || ''}</p>
                </div>
            `;
        }).join('');

        const strengths = (report.strengths || []).map(s => `<li style="margin-bottom:6px;">${s}</li>`).join('');
        const improvements = (report.areas_for_improvement || []).map(a => `<li style="margin-bottom:6px;">${a}</li>`).join('');
        const recs = (report.personalized_recommendations || []).map(r => {
            const pcolor = (r.priority||'').toLowerCase() === 'high' ? '#ef4444' : (r.priority||'').toLowerCase() === 'medium' ? '#f59e0b' : '#22c55e';
            return `
                <div style="margin-bottom:14px; padding:14px; border-left:4px solid ${pcolor}; background:#f8fafc; border-radius:8px; break-inside:avoid;">
                    <div style="display:flex; justify-content:space-between;">
                        <strong>${r.title}</strong>
                        <span style="font-size:11px; background:${pcolor}22; color:${pcolor}; padding:2px 8px; border-radius:99px; font-weight:700;">${r.priority}</span>
                    </div>
                    <p style="font-size:12px; color:#64748b; margin-top:6px;">${r.description}</p>
                </div>
            `;
        }).join('');

        const upscScore = report.upsc_readiness?.score || 0;
        const upscColor = upscScore >= 70 ? '#22c55e' : upscScore >= 40 ? '#f59e0b' : '#ef4444';

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 750px; margin: 0 auto; padding: 20px;">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #F2921D, #D93425); color: white; border-radius:16px; padding:32px; margin-bottom:24px;">
                    <h1 style="font-size:26px; font-weight:800; margin:0 0 8px 0; color:white;">🧠 Psychometric Analysis Report</h1>
                    <p style="margin:4px 0; font-size:13px; opacity:0.9;">Student: <strong>${user?.name || 'UPSC Aspirant'}</strong></p>
                    <p style="margin:4px 0; font-size:13px; opacity:0.9;">Date: <strong>${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}</strong></p>
                </div>
                
                <!-- Overall Profile -->
                <div style="background:#f8fafc; border-radius:12px; padding:20px; margin-bottom:24px; border:1px solid #e2e8f0;">
                    <h2 style="font-size:16px; margin:0 0 8px 0;">Overall Profile</h2>
                    <p style="color:#475569; font-size:13px; line-height:1.6;">${report.overall_profile || ''}</p>
                </div>
                
                <!-- UPSC Readiness -->
                ${report.upsc_readiness ? `
                <div style="background:white; border:2px solid ${upscColor}; border-radius:12px; padding:20px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:center; break-inside:avoid;">
                    <div>
                        <h3 style="margin:0 0 6px 0; font-size:15px;">UPSC Readiness</h3>
                        <p style="color:#64748b; font-size:12px;">${report.upsc_readiness.description || ''}</p>
                    </div>
                    <div style="text-align:center; min-width:80px;">
                        <div style="font-size:28px; font-weight:800; color:${upscColor};">${upscScore}</div>
                        <div style="font-size:11px; color:#64748b;">${report.upsc_readiness.level || ''}</div>
                    </div>
                </div>` : ''}

                <!-- Score Breakdown -->
                <h2 style="font-size:17px; margin:0 0 16px 0;">Score Breakdown</h2>
                ${scoreRows}
                
                <!-- Page Break -->
                <div style="page-break-before:always; padding-top:20px;"></div>
                
                <!-- Strengths & Improvements -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px;">
                    <div style="background:#f0fdf4; border-radius:12px; padding:18px; break-inside:avoid;">
                        <h3 style="font-size:14px; color:#166534; margin:0 0 12px 0;">💪 Strengths</h3>
                        <ul style="margin:0; padding-left:18px; font-size:13px; color:#166534;">${strengths}</ul>
                    </div>
                    <div style="background:#fff7ed; border-radius:12px; padding:18px; break-inside:avoid;">
                        <h3 style="font-size:14px; color:#9a3412; margin:0 0 12px 0;">🎯 Areas for Improvement</h3>
                        <ul style="margin:0; padding-left:18px; font-size:13px; color:#9a3412;">${improvements}</ul>
                    </div>
                </div>
                
                <!-- Recommendations -->
                <h2 style="font-size:17px; margin:0 0 16px 0;">🚀 Personalized Recommendations</h2>
                ${recs}
                
                <!-- Study Plan -->
                ${report.study_plan_suggestion ? `
                <div style="background:#eff6ff; border-radius:12px; padding:18px; margin-top:16px; break-inside:avoid;">
                    <h3 style="font-size:14px; color:#1e40af; margin:0 0 8px 0;">📅 Recommended Study Approach</h3>
                    <p style="font-size:13px; color:#1e40af; line-height:1.6;">${report.study_plan_suggestion}</p>
                </div>` : ''}

                <!-- Motivational Quote -->
                ${report.motivational_message ? `
                <div style="text-align:center; padding:30px; margin-top:24px; border-top:1px solid #e2e8f0;">
                    <p style="font-size:15px; font-style:italic; color:#64748b;">"${report.motivational_message}"</p>
                </div>` : ''}
            </div>
        `;

        const element = document.createElement('div');
        element.innerHTML = htmlContent;

        const opt = {
          margin:    [5, 5, 5, 5],
          filename:  `Psychometric_Report_${user?.name || 'Student'}.pdf`,
          image:     { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF:     { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'avoid-all'] }
        };

        await window.html2pdf().set(opt).from(element).save();
    };

    return (
      <div className="psy-results">
        <div id="psy-report-content" style={{ background: 'white', padding: '10px' }}>
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
          <div className="psy-recommendations" style={{ breakBefore: 'always', pageBreakBefore: 'always', paddingTop: '40px' }}>
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

        </div>

        <div className="psy-actions no-print" style={{ 
            marginTop: '3.5rem', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
            gap: '0.75rem',
            width: '100%'
        }}>
          <button className="psy-btn-secondary" style={{ padding: '0.8rem 0.5rem', fontSize: '0.85rem' }} onClick={() => setView('landing')}>← Back</button>
          <button className="psy-btn-primary" style={{ background: '#10b981', padding: '0.8rem 0.5rem', fontSize: '0.85rem' }} onClick={downloadPDF}>
            📥 Download PDF
          </button>
          <button className="psy-btn-primary" style={{ background: '#f59e0b', padding: '0.8rem 0.5rem', fontSize: '0.85rem' }} onClick={retakeAssessment}>🔄 Retake Test</button>
          <button className="psy-btn-primary" style={{ background: '#3b82f6', padding: '0.8rem 0.5rem', fontSize: '0.85rem' }} onClick={() => setView('video_counselling')}>
            📹 AI Mentor
          </button>
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
      {view === 'video_counselling' && <VideoAvatarCounselling report={report} onEndSession={() => setView('results')} />}
    </div>
  );
};

export default PsychometricTest;
