import React, { useState, useEffect } from 'react';
import '../styles/shared-layout.css';

export const scholarshipQuestions = [
  {
    question: "Who is known as the Father of the Indian Constitution?",
    options: ["Mahatma Gandhi", "Jawaharlal Nehru", "Dr. B.R. Ambedkar", "Sardar Vallabhbhai Patel"],
    answer: "Dr. B.R. Ambedkar"
  },
  {
    question: "Which of the following is the longest river in India?",
    options: ["Yamuna", "Brahmaputra", "Ganga", "Godavari"],
    answer: "Ganga"
  },
  {
    question: "Who was the first President of independent India?",
    options: ["Dr. Rajendra Prasad", "Dr. S. Radhakrishnan", "Zakir Husain", "V.V. Giri"],
    answer: "Dr. Rajendra Prasad"
  },
  {
    question: "In which year did India gain independence?",
    options: ["1945", "1947", "1950", "1952"],
    answer: "1947"
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Jupiter", "Saturn", "Mars"],
    answer: "Mars"
  }
];

const ScholarshipTest = ({ user, onLogout, onUserUpdate }) => {
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!schedule) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(schedule.scholarship_end).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('Time is up!');
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [schedule]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/users/app-settings`);
        if (res.ok) {
          const data = await res.json();
          setSchedule(data);
        }
      } catch (err) {
        console.error("Failed to fetch schedule:", err);
      } finally {
        setLoadingSchedule(false);
      }
    };
    fetchSchedule();
  }, []);

  const isTestActive = () => {
    if (!schedule) return true; // Default to active if can't fetch
    const now = new Date();
    const start = new Date(schedule.scholarship_start);
    const end = new Date(schedule.scholarship_end);
    return now >= start && now <= end;
  };

  const isTestOver = () => {
    if (!schedule) return false;
    const now = new Date();
    const end = new Date(schedule.scholarship_end);
    return now > end;
  };

  const handleSkipTest = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/${user.id}/skip_scholarship`, { method: 'POST' });
      if (res.ok) {
        onUserUpdate({ ...user, scholarship_status: 'expired' });
      } else {
        alert('Failed to bypass test');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (schedule && isTestOver()) {
      handleSkipTest();
    }
  }, [schedule]);

  const handleOptionSelect = (qIndex, option) => {
    setAnswers(prev => ({
      ...prev,
      [qIndex]: option
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (Object.keys(answers).length < scholarshipQuestions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    let correctCount = 0;
    scholarshipQuestions.forEach((q, index) => {
      if (answers[index] === q.answer) {
        correctCount++;
      }
    });

    const calculatedScore = (correctCount / scholarshipQuestions.length) * 100;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${user.id}/scholarship_test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          score: calculatedScore,
          answers_json: JSON.stringify(answers)
        })
      });

      if (response.ok) {
        const userRes = await fetch(`${process.env.REACT_APP_API_URL}/users/me/${user.id}`);
        if (userRes.ok) {
          const updatedUser = await userRes.json();
          onUserUpdate(updatedUser);
        }
      } else {
        alert('Failed to submit test.');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to connect to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingSchedule) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)' }}>Loading schedule...</div>;
  }

  if (!isTestActive()) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', alignItems: 'center', padding: '3rem 1rem' }}>
        <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', maxWidth: '900px', width: '100%', textAlign: 'center' }}>
          <h1 style={{ color: '#F2921D', marginBottom: '1.5rem' }}>Test Not Available</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>The scholarship test is currently not active.</p>
          {schedule && (
            <div style={{ background: 'rgba(242, 146, 29, 0.1)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--text-main)' }}>Scheduled Window:</p>
              <p style={{ margin: 0, color: '#F2921D', fontSize: '1.1rem', fontWeight: 'bold' }}>
                {new Date(schedule.scholarship_start).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()} - {new Date(schedule.scholarship_end).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()}
              </p>
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {isTestOver() && (
              <button 
                onClick={handleSkipTest} 
                style={{ padding: '1rem 2rem', background: '#F2921D', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Continue to Dashboard
              </button>
            )}
            <button 
              onClick={onLogout} 
              style={{ padding: '1rem 2rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-main)' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', alignItems: 'center', padding: '3rem 1rem' }}>
      <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', maxWidth: '900px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ color: '#F2921D', margin: 0 }}>Scholarship Evaluation</h1>
            {timeLeft && (
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>Time Remaining:</span>
                <span style={{ 
                  background: 'rgba(242, 146, 29, 0.1)', 
                  color: '#F2921D', 
                  padding: '0.3rem 0.6rem', 
                  borderRadius: '6px', 
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  fontSize: '1.1rem'
                }}>
                  {timeLeft}
                </span>
              </div>
            )}
          </div>
          <button 
            onClick={onLogout} 
            style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 1rem', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Logout
          </button>
        </div>
        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
          Welcome, <strong>{user.name}</strong>! Please complete this short evaluation test. Your performance will determine your scholarship eligibility and allow you to access the student dashboard.
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {scholarshipQuestions.map((q, index) => (
            <div key={index} style={{ padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>{index + 1}. {q.question}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {q.options.map((option, optIndex) => (
                  <label key={optIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', borderRadius: '8px', border: answers[index] === option ? '2px solid #F2921D' : '1px solid var(--border-color)', background: answers[index] === option ? 'rgba(242, 146, 29, 0.05)' : 'transparent', transition: 'all 0.2s' }}>
                    <input 
                      type="radio" 
                      name={`question-${index}`} 
                      value={option}
                      checked={answers[index] === option}
                      onChange={() => handleOptionSelect(index, option)}
                      style={{ accentColor: '#F2921D', width: '1.2rem', height: '1.2rem' }}
                    />
                    <span style={{ fontSize: '1.05rem' }}>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ marginTop: '1rem', padding: '1.25rem', borderRadius: '12px', background: 'linear-gradient(135deg, #F2921D 0%, #e87b0c 100%)', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1, transition: 'transform 0.1s' }}
          >
            {isSubmitting ? 'Submitting Responses...' : 'Submit Test & Request Evaluation'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ScholarshipTest;
