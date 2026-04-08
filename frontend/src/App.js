import React, { useState } from 'react';
import './index.css';
import AuthLayout from './components/AuthLayout';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    alert('Login successful! Welcome: ' + userData.email);
  };

  const handleRegisterSuccess = (data) => {
    alert('Registration successful! Please login.');
    setIsLogin(true);
  };

  if (user) {
    return <Dashboard user={user} onLogout={() => setUser(null)} />;
  }

  return (
    <div className="App">
      {isLogin ? (
        <AuthLayout 
          title="Welcome Back" 
          subtitle="Sign in to continue your learning journey"
        >
          <LoginForm 
            onSwitch={() => setIsLogin(false)} 
            onLogin={handleLoginSuccess}
          />
        </AuthLayout>
      ) : (
        <AuthLayout 
          title="Create Account" 
          subtitle="Join Samkalp Vedhik to start your UPSC preparation"
        >
          <RegisterForm 
            onSwitch={() => setIsLogin(true)} 
            onRegister={handleRegisterSuccess}
          />
        </AuthLayout>
      )}
    </div>
  );
}

export default App;
