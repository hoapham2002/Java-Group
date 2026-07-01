import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return {
      token,
      accountID: localStorage.getItem("accountID"),
      accountName: localStorage.getItem("accountName"),
      email: localStorage.getItem("email"),
      role: localStorage.getItem("role"),
    };
  });

  const navigate = useNavigate();

  const login = (userData) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("accountID", userData.accountID);
    localStorage.setItem("accountName", userData.accountName);
    localStorage.setItem("email", userData.email);
    localStorage.setItem("role", userData.role);
    setUser(userData);

    // Redirect dựa trên role
    if (userData.role === "admin" || userData.role === "moderator") {
      navigate("/admin");
    } else {
      navigate("/documents");
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
