import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
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
  
  const navigate = useNavigate();

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('accountName', userData.accountName);
    localStorage.setItem('email', userData.email);
    localStorage.setItem('role', userData.role);
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
