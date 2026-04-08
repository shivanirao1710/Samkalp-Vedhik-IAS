import React, { useState } from 'react';
import '../styles/Auth.css';


const LoginForm = ({ onSwitch, onLogin }) => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
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
      <div className="role-toggle">
        <button 
          type="button" 
          className={`role-btn ${role === 'student' ? 'active' : ''}`}
          onClick={() => setRole('student')}
        >
          Student
        </button>
        <button 
          type="button" 
          className={`role-btn ${role === 'faculty' ? 'active' : ''}`}
          onClick={() => setRole('faculty')}
        >
          Faculty
        </button>
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

      <div className="form-footer">
        <div className="checkbox-group">
          <input type="checkbox" id="remember" />
          <label htmlFor="remember">Remember me</label>
        </div>
        <a href="#" className="forgot-link">Forgot password?</a>
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In →'}
      </button>

      <div className="switch-auth">
        Don't have an account? <a href="#" onClick={onSwitch}>Sign up now</a>
      </div>
    </form>
  );
};

export default LoginForm;
