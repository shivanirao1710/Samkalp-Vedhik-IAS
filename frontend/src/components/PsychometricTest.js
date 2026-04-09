import React, { useState } from 'react';
import '../styles/PsychometricTest.css';

const PsychometricTest = () => {
  const [view, setView] = useState('landing'); // landing, testing, results
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 1,
      type: 'personality',
      text: 'How do you typically approach a complex new problem?',
      options: [
        'Break it into small, manageable logical steps',
        'Look for creative, out-of-the-box solutions first',
        'Search for existing patterns and proven methods',
        'Collaborate with others to brainstorm ideas'
      ]
    },
    {
      id: 2,
      type: 'cognitive',
      text: 'I find it easy to stay focused on a single task for long periods.',
      options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree']
    },
    {
      id: 3,
      type: 'learning',
      text: 'I learn best when information is presented through...',
      options: ['Visual diagrams and videos', 'Reading text and taking notes', 'Hands-on practice', 'Listening to lectures']
    },
    {
      id: 4,
      type: 'personality',
      text: 'How do you handle high-pressure situations or tight deadlines?',
      options: [
        'Organize and prioritize strictly',
        'Thrive on the adrenaline and work faster',
        'Feel anxious but manage to complete the work',
        'Preferred to have a calm environment to work'
      ]
    }
  ];

  const startAssessment = () => setView('testing');

  const handleAnswer = (optionIdx) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: optionIdx });
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setView('results');
    }
  };

  const renderLanding = () => (
    <div className="psy-landing">
      <div className="psy-header-card">
        <div className="psy-icon-main">🧠</div>
        <h1>Psychometric Assessment</h1>
        <p>Understand your cognitive strengths, personality traits, and learning patterns through our AI-powered assessment</p>
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
          <h3>30-40 Minutes</h3>
          <p>Complete assessment at your own pace with progress saved automatically</p>
        </div>
        <div className="psy-feature-item orange">
          <div className="psy-feat-icon">✨</div>
          <h3>Personalized Insights</h3>
          <p>Get detailed report with AI-driven recommendations for UPSC preparation</p>
        </div>
      </div>

      <div className="psy-before-start">
        <h3>Before You Start:</h3>
        <ul>
          <li>Find a quiet environment free from distractions</li>
          <li>Answer honestly - there are no right or wrong answers</li>
          <li>Your responses are confidential and used only for personalized recommendations</li>
          <li>You can pause and resume the test anytime</li>
        </ul>
      </div>

      <div className="psy-actions">
        <button className="psy-btn-secondary">Go Back</button>
        <button className="psy-btn-primary" onClick={startAssessment}>Start Assessment</button>
      </div>
    </div>
  );

  const renderTesting = () => {
    const q = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="psy-testing">
        <div className="psy-test-card">
          <div className="psy-progress-container">
            <div className="psy-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="psy-question-count">Question {currentQuestion + 1} of {questions.length}</span>
          <h2 className="psy-question-text">{q.text}</h2>
          <div className="psy-options-list">
            {q.options.map((opt, idx) => (
              <button key={idx} className="psy-option-btn" onClick={() => handleAnswer(idx)}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => (
    <div className="psy-results">
      <div className="psy-results-card">
        <div className="psy-result-header">
          <div className="psy-success-icon">✅</div>
          <h2>Assessment Complete!</h2>
          <p>Our AI is analyzing your responses back to generate your profile...</p>
        </div>

        <div className="psy-report-skeleton">
          <div className="psy-report-section">
            <div className="psy-section-header">
              <h3>Cognitive Strengths</h3>
              <span className="psy-score-tag">High</span>
            </div>
            <p>You show strong analytical capabilities with a preference for logical decomposition of problems.</p>
          </div>
          
          <div className="psy-report-section">
            <div className="psy-section-header">
              <h3>Personality Trait</h3>
              <span className="psy-score-tag">Resilient</span>
            </div>
            <p>Your stress management score indicates a high level of persistence and calm under pressure.</p>
          </div>

          <div className="psy-report-section">
            <div className="psy-section-header">
              <h3>Learning Pattern</h3>
              <span className="psy-score-tag">Visual</span>
            </div>
            <p>You process information most efficiently through diagrams, charts, and spatial relationships.</p>
          </div>
        </div>

        <button className="psy-btn-primary" onClick={() => setView('landing')}>Done</button>
      </div>
    </div>
  );

  return (
    <div className="psychometric-container">
      {view === 'landing' && renderLanding()}
      {view === 'testing' && renderTesting()}
      {view === 'results' && renderResults()}
    </div>
  );
};

export default PsychometricTest;
