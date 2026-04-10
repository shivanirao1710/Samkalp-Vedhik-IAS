import React, { useState, useEffect } from 'react';
import '../styles/Auth.css';
import { Country, State, City } from 'country-state-city';


const RegisterForm = ({ onSwitch, onRegister }) => {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [locationOptions, setLocationOptions] = useState([]);
  const [locationSearch, setLocationSearch] = useState('');

  // Sample or common locations to pre-populate (optional)
  useEffect(() => {
    // For performance, we don't want to load ALL cities at once.
    // Instead, we'll listen to search changes.
    if (locationSearch.length > 2) {
      const cities = City.getAllCities()
        .filter(city => 
          city.name.toLowerCase().includes(locationSearch.toLowerCase())
        )
        .slice(0, 100) // Limit to 100 results for performance
        .map(city => `${city.name}, ${city.stateCode}, ${city.countryCode}`);
      setLocationOptions(cities);
    }
  }, [locationSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password, role, phone, location }),
      });
      
      const data = await response.json();
      if (response.ok) {
        onRegister(data);
      } else {
        setError(data.detail || 'Registration failed');
      }
    } catch (err) {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      <div className="form-grid">
        <div className="form-group">
          <label>Full Name</label>
          <div className="input-wrapper">
            <span className="input-icon">👤</span>
            <input 
              type="text" 
              placeholder="Enter your name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
          <label>Phone Number</label>
          <div className="input-wrapper">
            <span className="input-icon">📞</span>
            <input 
              type="tel" 
              placeholder="+91 98765 43210" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Location</label>
          <div className="input-wrapper">
            <span className="input-icon">📍</span>
            <input 
              list="locations"
              type="text" 
              placeholder="City, State, Country" 
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setLocationSearch(e.target.value);
              }}
              required
            />
            <datalist id="locations">
              {locationOptions.map((opt, idx) => (
                <option key={idx} value={opt} />
              ))}
            </datalist>
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

        <div className="form-group">
          <label>Confirm Password</label>
          <div className="input-wrapper">
            <span className="input-icon">🔒</span>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {error && <p style={{ color: 'red', fontSize: '0.8rem', margin: '0 0 1rem 0' }}>{error}</p>}

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account →'}
      </button>

      <div className="switch-auth">
        Already have an account? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }} onClick={onSwitch}>Sign in instead</span>
      </div>
    </form>
  );
};

export default RegisterForm;
