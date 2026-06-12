import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './Page/Loginpage/Loginpage';
import RegisterPage from './Page/RegisterPage/RegisterPage';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tự động chuyển hướng từ trang chủ "/" sang "/login" */}
        <Route path="/" element={<Navigate to="/" />} />

        {/* Định nghĩa tuyến đường cho Login và Register */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;