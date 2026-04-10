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
  const [authPortal, setAuthPortal] = useState('student'); // 'student' or 'faculty'
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const savedUser = localStorage.getItem('samkalp_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('samkalp_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('samkalp_user');
  };

  const handleRegisterSuccess = (data) => {
    setIsLogin(true);
    setAuthPortal('student');
  };


  if (user) {
    if (user.role === 'admin') {
      return <AdminDashboard user={user} onLogout={handleLogout} onUserUpdate={setUser} />;
    }
    if (user.role === 'faculty') {
      return <FacultyDashboard user={user} onLogout={handleLogout} onUserUpdate={setUser} />;
    }
    return <Dashboard user={user} onLogout={handleLogout} onUserUpdate={setUser} />;
  }


  return (
    <div className="App">
      {isLogin ? (
        <AuthLayout 
          title={authPortal === 'student' ? "Student Sign In" : "Faculty Portal"} 
          subtitle={authPortal === 'student' ? "Prepare for your success" : "Manage your courses and students"}
        >
          <LoginForm 
            onSwitch={() => setIsLogin(false)} 
            onLogin={handleLoginSuccess}
            forcedRole={authPortal}
          />
          
          <div className="portal-switch-wrapper">
             <button 
               className="portal-switch-btn"
               onClick={() => setAuthPortal(authPortal === 'student' ? 'faculty' : 'student')}
             >
               {authPortal === 'student' ? "Looking for Faculty Sign In? →" : "← Back to Student Sign In"}
             </button>
          </div>
        </AuthLayout>
      ) : (
        <AuthLayout 
          title="Create Account" 
          subtitle="Join Samkalp Vedhik to start your UPSC preparation"
        >
          <RegisterForm 
            onSwitch={() => {
              setIsLogin(true);
              setAuthPortal('student');
            }} 
            onRegister={handleRegisterSuccess}
          />
        </AuthLayout>
      )}
    </div>
  );
}

export default App;
