import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import './App.css';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Route Login */}
      <Route 
        path="/login" 
        element={!user ? <AuthPage /> : <Navigate to="/" />} 
      />
      
      {/* Các Route yêu cầu đăng nhập */}
      {/* Redirect root to /documents */}
      <Route 
        path="/" 
        element={<Navigate to="/documents" />} 
      />

      <Route 
        path="/documents" 
        element={user ? <Dashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/documents/shared" 
        element={user ? <Dashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/chat/:docId" 
        element={user ? <ChatPage /> : <Navigate to="/login" />} 
      />
      
      {/* Route bắt lỗi 404 hoặc đường dẫn lạ -> chuyển về trang chủ (sẽ tự check đăng nhập) */}
      <Route path="*" element={<Navigate to="/documents" />} />
    </Routes>
  );
}

export default App;
