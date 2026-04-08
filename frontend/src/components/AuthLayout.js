import React from 'react';
import '../styles/Auth.css';
import heroImage from '../images/hero-image.png';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="logo-section">
          <div className="logo-icon">AI</div>
          <div className="brand-name">
            <h1>Samkalp Vedhik</h1>
            <p>IAS Academy</p>
          </div>
        </div>
        
        <div className="hero-content">
          <h2>Master UPSC with AI-Powered Intelligence</h2>
          <p>
            Personalized learning paths, AI mock interviews, and comprehensive analytics to help you ace your IAS exam.
          </p>
          <div className="hero-image-wrapper">
            <img 
              src={heroImage} 
              alt="Study Academic" 
              className="hero-image"
            />
          </div>
        </div>
      </div>

      
      <div className="auth-right">
        <div className="auth-card">
          <h2>{title}</h2>
          <p className="subtitle">{subtitle}</p>
          {children}
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;
