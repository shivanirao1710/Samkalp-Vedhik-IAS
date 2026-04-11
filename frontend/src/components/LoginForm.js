import React, { useState } from 'react';
import '../styles/Auth.css';


const LoginForm = ({ onSwitch, onLogin, forcedRole = 'student' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: forcedRole }),
      });
      
      const data = await response.json();
      if (response.ok) {
        onLogin(data);
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
        <span className={`role-badge-plain ${forcedRole}`}>
          {forcedRole.toUpperCase()} PORTAL
        </span>
      </div>

      <div className="form-group">
        <label>Email Address</label>
        <div className="input-wrapper">
          <span className="input-icon">✉️</span>
          <input 
            type="email" 
            placeholder="your.email@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Password</label>
        <div className="input-wrapper">
          <span className="input-icon">🔒</span>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>

      {error && <p style={{ color: 'red', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}


      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In →'}
      </button>

      {forcedRole === 'student' && (
        <div className="switch-auth">
          Don't have an account? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }} onClick={onSwitch}>Sign up now</span>
        </div>
      )}
    </form>
  );
};

export default LoginForm;
