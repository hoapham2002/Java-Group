import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import UserProfilePage from './pages/UserProfilePage';
import './App.css';
import AdminPage from './pages/AdminPage';
function App() {
  const { user } = useAuth(); // Hoặc cách bạn đang lấy biến user từ Context

  return (
    <Routes>

      <Route
        path="/login"
        element={!user ? <AuthPage /> : <Navigate to="/" />}
      />

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

      <Route
        path="/user-profile"
        element={user ? <UserProfilePage /> : <Navigate to="/login" />}
      />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/documents" />} />
    </Routes>
  );
}

export default App;
