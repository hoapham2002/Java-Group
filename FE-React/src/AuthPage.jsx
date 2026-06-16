import React, { useState } from 'react';
import { BookOpen, Mail, Lock, User, AlertCircle, Info, Loader } from 'lucide-react';
import { loginApi, registerApi } from './api';
import './AuthPage.css';

function AuthPage({ onLoginSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'

  // Login state
  const [loginForm, setLoginForm] = useState({ accountName: '', password: '' });
  // Register state
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', confirmPassword: '' });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleTabSwitch = (t) => {
    setTab(t);
    setError('');
    setSuccessMsg('');
  };

  // ===== LOGIN =====
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.accountName || !loginForm.password) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await loginApi({ accountName: loginForm.accountName, password: loginForm.password });
      const { token, accountName, email, role } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('accountName', accountName);
      localStorage.setItem('email', email);
      localStorage.setItem('role', role);
      onLoginSuccess({ token, accountName, email, role });
    } catch (err) {
      setError(err.response?.data?.message || 'User ID hoặc mật khẩu không đúng.');
    } finally {
      setLoading(false);
    }
  };

  // ===== REGISTER =====
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (registerForm.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await registerApi({ email: registerForm.email, password: registerForm.password });
      const { token, accountName, email, role } = res.data.data;
      setSuccessMsg(`Đăng ký thành công! User ID của bạn là: ${accountName}`);
      // Auto login after 1.5s
      setTimeout(() => {
        localStorage.setItem('token', token);
        localStorage.setItem('accountName', accountName);
        localStorage.setItem('email', email);
        localStorage.setItem('role', role);
        onLoginSuccess({ token, accountName, email, role });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <BookOpen />
          </div>
          <span className="auth-logo-text">AI Study Hub</span>
        </div>

        {/* Title */}
        <div className="auth-title">
          {tab === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
        </div>
        <div className="auth-subtitle">
          {tab === 'login'
            ? 'Đăng nhập bằng User ID và mật khẩu của bạn'
            : 'Đăng ký để bắt đầu học tập cùng AI'}
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => handleTabSwitch('login')}
          >
            Đăng nhập
          </button>
          <button
            className={`auth-tab${tab === 'register' ? ' active' : ''}`}
            onClick={() => handleTabSwitch('register')}
          >
            Đăng ký
          </button>
        </div>

        {/* ===== LOGIN FORM ===== */}
        {tab === 'login' && (
          <form className="auth-form" onSubmit={handleLogin}>
            {error && (
              <div className="form-alert">
                <AlertCircle />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">User ID</label>
              <div className="form-input-wrapper">
                <User className="form-input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nhập User ID (VD: 10000001)"
                  value={loginForm.accountName}
                  onChange={(e) => setLoginForm({ ...loginForm, accountName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <div className="form-input-wrapper">
                <Lock className="form-input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Nhập mật khẩu"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
            </div>

            <button className="btn-auth-submit" type="submit" disabled={loading}>
              {loading ? <><Loader style={{ animation: 'spin 0.7s linear infinite', width: 16, height: 16 }} /> Đang xử lý...</> : 'Đăng nhập'}
            </button>
          </form>
        )}

        {/* ===== REGISTER FORM ===== */}
        {tab === 'register' && (
          <form className="auth-form" onSubmit={handleRegister}>
            {error && (
              <div className="form-alert">
                <AlertCircle />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="form-alert form-alert-success">
                <AlertCircle />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="register-info">
              <Info />
              <span>User ID sẽ được tạo tự động theo dạng <strong>10000000</strong> và tăng dần. Hãy lưu lại để đăng nhập!</span>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="form-input-wrapper">
                <Mail className="form-input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="email@example.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <div className="form-input-wrapper">
                <Lock className="form-input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Tối thiểu 6 ký tự"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu</label>
              <div className="form-input-wrapper">
                <Lock className="form-input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Nhập lại mật khẩu"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <button className="btn-auth-submit" type="submit" disabled={loading}>
              {loading ? <><Loader style={{ animation: 'spin 0.7s linear infinite', width: 16, height: 16 }} /> Đang xử lý...</> : 'Tạo tài khoản'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
