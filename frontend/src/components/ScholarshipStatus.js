import React from 'react';

const ScholarshipStatus = ({ user, onLogout, onUserUpdate }) => {
  const refreshStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/me/${user.id}`);
      if (response.ok) {
        const updatedUser = await response.json();
        onUserUpdate(updatedUser);
      }
    } catch (err) {
      console.error('Failed to refresh status:', err);
    }
  };

  const handleContinueToDashboard = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/${user.id}/acknowledge_rejection`, { method: 'POST' });
      if (res.ok) {
        onUserUpdate({ ...user, scholarship_status: 'rejected_acknowledged' });
      } else {
        alert('Failed to continue to dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', maxWidth: '500px', width: '90%', textAlign: 'center' }}>
        
        {user.scholarship_status === 'under_evaluation' ? (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
            <h1 style={{ marginBottom: '1rem', color: '#F2921D' }}>Evaluation in Progress</h1>
            <p style={{ marginBottom: '2rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Your scholarship test is currently being reviewed by our faculty. 
              You will gain access to the dashboard once your evaluation is approved.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
            <h1 style={{ marginBottom: '1rem', color: '#ef4444' }}>Scholarship Rejected</h1>
            <p style={{ marginBottom: '2rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Unfortunately, your scholarship test did not meet the requirements. Please contact support or retry if allowed.
            </p>
          </>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {user.scholarship_status === 'rejected' && (
            <button 
              onClick={handleContinueToDashboard}
              style={{ padding: '1rem', borderRadius: '8px', background: '#F2921D', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Continue to Dashboard
            </button>
          )}

          <button 
            onClick={refreshStatus}
            style={{ padding: '1rem', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🔄 Refresh Status
          </button>
          
          <button 
            onClick={onLogout} 
            style={{ padding: '1rem', borderRadius: '8px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipStatus;
