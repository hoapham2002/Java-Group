import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AuthPage from './AuthPage';
import Home from './Home';
import ChatPage from './ChatPage';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return {
      token,
      accountName: localStorage.getItem('accountName'),
      email: localStorage.getItem('email'),
      role: localStorage.getItem('role'),
    };
  });

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (!user) {
    return <AuthPage onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />
      <Route path="/chat/:docId" element={<ChatPage user={user} onLogout={handleLogout} />} />
    </Routes>
  );
}

export default App;
