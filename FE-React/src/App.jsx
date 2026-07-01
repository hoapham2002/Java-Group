import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import UserProfilePage from "./pages/UserProfilePage";
import "./App.css";
import AdminPage from "./pages/AdminPage";

// Protected Route cho Admin - chỉ cho phép admin và moderator
function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Chỉ cho phép admin hoặc moderator vào
  if (user.role !== "admin" && user.role !== "moderator") {
    return <Navigate to="/documents" />;
  }

  return children;
}

// Component redirect dựa trên role
function RoleBasedRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Redirect admin/moderator đến /admin, user thường đến /documents
  if (user.role === "admin" || user.role === "moderator") {
    return <Navigate to="/admin" />;
  }

  return <Navigate to="/documents" />;
}

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <AuthPage /> : <RoleBasedRedirect />}
      />

      <Route path="/" element={<RoleBasedRedirect />} />

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

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />

      <Route path="*" element={<RoleBasedRedirect />} />
    </Routes>
  );
}

export default App;
