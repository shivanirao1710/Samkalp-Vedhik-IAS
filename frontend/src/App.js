import React, { useState } from 'react';
import './index.css';
import AuthLayout from './components/AuthLayout';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import FacultyDashboard from './components/FacultyDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleRegisterSuccess = (data) => {
    setIsLogin(true);
  };


  if (user) {
    if (user.role === 'admin') {
      return <AdminDashboard user={user} onLogout={() => setUser(null)} />;
    }
    if (user.role === 'faculty') {
      return <FacultyDashboard user={user} onLogout={() => setUser(null)} />;
    }
    return <Dashboard user={user} onLogout={() => setUser(null)} onUserUpdate={setUser} />;
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
