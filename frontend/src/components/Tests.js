import React, { useState } from 'react';
import '../styles/Tests.css';

const MOCK_TESTS = [
  {
    id: 1,
    title: 'Prelims Mock Test - 1',
    category: 'General Studies',
    questionsCount: 100,
    duration: '120 mins',
    difficulty: 'Medium',
    questions: [
      {
        id: 1,
        question: 'Which of the following describes the "Basic Structure" of the Indian Constitution?',
        options: [
          'It is defined in the Constitution itself',
          'It was introduced by the Supreme Court in the Kesavananda Bharati case',
          'It can be easily amended by the Parliament',
          'It is limited to the Preamble only'
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        question: 'The "Financial Emergency" can be declared under which Article?',
        options: ['Article 352', 'Article 356', 'Article 360', 'Article 365'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 2,
    title: 'Indian Polity Quiz',
    category: 'Polity',
    questionsCount: 50,
    duration: '60 mins',
    difficulty: 'Easy',
    questions: [
      {
        id: 1,
        question: 'Which article of the Indian Constitution deals with the Right to Equality?',
        options: ['Article 14', 'Article 19', 'Article 21', 'Article 32'],
        correctAnswer: 0
      },
      {
        id: 2,
        question: 'Who is the ex-officio Chairman of the Rajya Sabha?',
        options: ['President', 'Vice-President', 'Prime Minister', 'Speaker'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 3,
    title: 'CSAT Practice Test',
    category: 'Aptitude',
    questionsCount: 80,
    duration: '120 mins',
    difficulty: 'Hard',
    questions: [
      {
        id: 1,
        question: 'If the day after tomorrow is Sunday, what day was the day before yesterday?',
        options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        correctAnswer: 1
      }
    ]
  }
];

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('All Tests');
  const [attemptedTestIds, setAttemptedTestIds] = useState(() => {
    try {
      const stored = localStorage.getItem('samkalp_student_attemptedTestsMap');
      return stored ? JSON.parse(stored) : {}; 
    } catch(e) { return {}; }
  });

  React.useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch('http://localhost:8000/tests/');
      const data = await response.json();
      setTests(data);
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const startTest = async (test) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/tests/${test.id}/questions`);
      const questions = await response.json();
      
      // Transform backend format to frontend format if needed
      const formattedQuestions = questions.map(q => ({
        id: q.id,
        question: q.text,
        options: q.options.map(o => o.text),
        correctAnswer: q.options.findIndex(o => o.is_correct)
      }));

      setActiveTest({ ...test, questions: formattedQuestions });
      setUserAnswers({});
      setShowResults(false);
      setCurrentQuestionIndex(0);
    } catch (error) {
       console.error("Error fetching questions:", error);
       alert("Failed to load test questions");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId, optionIndex) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: optionIndex
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < activeTest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishTest = () => {
    const score = calculateScore();
    const percentage = (score / activeTest.questions.length) * 100;
    
    // Save attempt
    const newAttempts = { ...attemptedTestIds, [activeTest.id]: Math.max(percentage, attemptedTestIds[activeTest.id] || 0) };
    setAttemptedTestIds(newAttempts);
    localStorage.setItem('samkalp_student_attemptedTestsMap', JSON.stringify(newAttempts));
    
    setShowResults(true);
  };

  const calculateScore = () => {
    let score = 0;
    activeTest.questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const resetTests = () => {
    setActiveTest(null);
    setShowResults(false);
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = (score / activeTest.questions.length) * 100;

    return (
      <div className="test-results-container">
        <div className="result-card">
          <div className="result-header">
            <h3>Test Results: {activeTest.title}</h3>
            <div className={`score-badge ${percentage >= 60 ? 'pass' : 'fail'}`}>
              {percentage}%
            </div>
          </div>
          
          <div className="stats-row">
            <div className="stat-box">
              <span className="label">Total Questions</span>
              <span className="value">{activeTest.questions.length}</span>
            </div>
            <div className="stat-box">
              <span className="label">Correct Answers</span>
              <span className="value">{score}</span>
            </div>
            <div className="stat-box">
              <span className="label">Incorrect</span>
              <span className="value">{activeTest.questions.length - score}</span>
            </div>
          </div>

          <div className="review-section">
            <h4>Question Review</h4>
            {activeTest.questions.map((q, idx) => (
              <div key={q.id} className={`review-item ${userAnswers[q.id] === q.correctAnswer ? 'correct' : 'incorrect'}`}>
                <p className="question-text">Q{idx + 1}: {q.question}</p>
                <div className="options-review">
                  <p>Your answer: <span className="ans">{q.options[userAnswers[q.id]] || 'Not answered'}</span></p>
                  {userAnswers[q.id] !== q.correctAnswer && (
                    <p>Correct answer: <span className="correct-ans">{q.options[q.correctAnswer]}</span></p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="back-btn" onClick={resetTests}>Back to Tests</button>
        </div>
      </div>
    );
  }

  if (activeTest) {
    const currentQuestion = activeTest.questions[currentQuestionIndex];

    if (!currentQuestion) {
      return (
        <div className="active-test-container">
          <div className="test-header-bar">
            <h2>{activeTest.title}</h2>
            <button className="quit-btn" onClick={() => setActiveTest(null)}>Back</button>
          </div>
          <div className="question-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <span style={{ fontSize: '3rem' }}>📝</span>
            <h3 style={{ marginTop: '1rem' }}>No questions available for this test.</h3>
            <p style={{ color: '#64748b' }}>Please try another test or contact your instructor.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="active-test-container">
        <div className="test-header-bar">
          <div className="test-info">
            <h2>{activeTest.title}</h2>
            <span>Question {currentQuestionIndex + 1} of {activeTest.questions.length}</span>
          </div>
          <button className="quit-btn" onClick={() => setActiveTest(null)}>Quit Test</button>
        </div>

        <div className="question-card">
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${((currentQuestionIndex + 1) / activeTest.questions.length) * 100}%` }}
            ></div>
          </div>
          
          <h3 className="question-title">{currentQuestion.question}</h3>
          
          <div className="options-grid">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                className={`option-btn ${userAnswers[currentQuestion.id] === idx ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(currentQuestion.id, idx)}
              >
                <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                {option}
              </button>
            ))}
          </div>

          <div className="navigation-btns">
            <button 
              className="nav-btn prev" 
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>
            
            {currentQuestionIndex === activeTest.questions.length - 1 ? (
              <button 
                className="finish-btn" 
                onClick={finishTest}
                disabled={userAnswers[currentQuestion.id] === undefined}
              >
                Finish Test
              </button>
            ) : (
              <button 
                className="nav-btn next" 
                onClick={nextQuestion}
                disabled={userAnswers[currentQuestion.id] === undefined}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const testsCompletedCount = Object.keys(attemptedTestIds).length;
  const avgScore = testsCompletedCount > 0 
    ? (Object.values(attemptedTestIds).reduce((sum, s) => sum + s, 0) / testsCompletedCount).toFixed(0)
    : 0;

  const filteredTests = tests.filter(test => {
    const isAttempted = attemptedTestIds[test.id] !== undefined;
    if (filterTab === 'Attempted') return isAttempted;
    if (filterTab === 'Not Attempted') return !isAttempted;
    return true;
  });

  return (
    <div className="tests-dashboard">
      <div className="tests-header">
        <div>
          <h1>Practice Tests</h1>
          <p>Test your knowledge and track your performance</p>
        </div>
        <div className="tests-stats-mini">
          <div className="mini-stat">
            <span className="icon">📝</span>
            <div>
              <span className="value">{testsCompletedCount}</span>
              <span className="label">Tests Completed</span>
            </div>
          </div>
          <div className="mini-stat">
            <span className="icon">🎯</span>
            <div>
              <span className="value">{avgScore}%</span>
              <span className="label">Average Score</span>
            </div>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        {['All Tests', 'Attempted', 'Not Attempted'].map(tab => (
          <button 
            key={tab} 
            className={`filter-btn ${filterTab === tab ? 'active' : ''}`}
            onClick={() => setFilterTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="tests-grid">
        {loading && <p>Loading tests...</p>}
        {!loading && filteredTests.length === 0 && <p style={{ color: '#64748b' }}>No tests available in this category.</p>}
        {filteredTests.map((test) => {
          const isAttempted = attemptedTestIds[test.id] !== undefined;
          const score = attemptedTestIds[test.id];

          return (
            <div key={test.id} className="test-card-alt" style={{ position: 'relative' }}>
              <div className="test-card-top">
                <span className={`difficulty-tag medium`}>
                  Medium
                </span>
                <span className="category-tag">{test.category}</span>
              </div>
              <h3>{test.title}</h3>
              <div className="test-meta">
                <span>📋 {test.total_questions || 0} Questions</span>
                <span>⏱️ {test.duration_mins} mins</span>
              </div>
              
              {isAttempted && (
                <div style={{ padding: '0.4rem 0.75rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', margin: '0.5rem 0', display: 'flex', justifyContent: 'space-between' }}>
                  <span>✓ Attempted</span>
                  <span>High Score: {score.toFixed(0)}%</span>
                </div>
              )}

              <button className="start-test-btn" onClick={() => startTest(test)} style={{ marginTop: isAttempted ? '0.5rem' : '1.5rem', background: isAttempted ? '#f1f5f9' : undefined, color: isAttempted ? '#3b82f6' : undefined, border: isAttempted ? '1px solid #cbd5e1' : undefined }}>
                {isAttempted ? 'Retake Test' : 'Start Test'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tests;
