import React, { useState } from 'react';
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', alignItems: 'center', padding: '3rem 1rem' }}>
      <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', maxWidth: '700px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ color: '#F2921D', margin: 0 }}>Scholarship Evaluation</h1>
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
