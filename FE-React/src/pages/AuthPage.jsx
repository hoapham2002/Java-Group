import React, { useState } from 'react';
import { BookOpen, Mail, Lock, User, AlertCircle, Loader } from 'lucide-react';
import { loginApi, registerApi } from '../services/api';
import './AuthPage.css';
import { useAuth } from '../contexts/AuthContext';

function AuthPage() {
  const { login } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'

  // Login state
  const [loginForm, setLoginForm] = useState({ accountName: '', password: '' });

  // Register state
  const [registerForm, setRegisterForm] = useState({
    accountName: '',
    email: '',
    lastName: '',
    firstName: '',
    password: '',
    confirmPassword: ''
  });

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
      login(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Tên tài khoản hoặc mật khẩu không đúng.');
    } finally {
      setLoading(false);
    }
  };

  // ===== REGISTER =====
  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !registerForm.accountName ||
      !registerForm.email ||
      !registerForm.lastName ||
      !registerForm.firstName ||
      !registerForm.password ||
      !registerForm.confirmPassword
    ) {
      setError('Vui lòng điền đầy đủ tất cả các thông tin.');
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
      await registerApi({
        accountName: registerForm.accountName,
        email: registerForm.email,
        lastName: registerForm.lastName,
        firstName: registerForm.firstName,
        password: registerForm.password
      });

      // 1. Hiển thị thông báo thành công và thông báo chuyển hướng
      setSuccessMsg(`Đăng ký thành công tài khoản: ${registerForm.accountName}! Đang quay lại trang đăng nhập...`);

      // Lưu lại tên tài khoản vừa đăng ký thành công để tí điền sẵn vào form login
      const registeredName = registerForm.accountName;

      // 2. Chuyển hướng sau 2 giây
      setTimeout(() => {
        // Điền sẵn tên tài khoản vừa tạo vào form Đăng nhập
        setLoginForm({ accountName: registeredName, password: '' });

        // Reset lại form đăng ký về trống
        setRegisterForm({
          accountName: '', email: '', lastName: '', firstName: '', password: '', confirmPassword: ''
        });

        // Chuyển tab sang login
        handleTabSwitch('login');
      }, 2000);

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
            ? 'Đăng nhập bằng tên tài khoản và mật khẩu của bạn'
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
              <label className="form-label">Tên tài khoản</label>
              <div className="form-input-wrapper">
                <User className="form-input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nhập tên tài khoản của bạn"
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

            {/* Tên tài khoản */}
            <div className="form-group">
              <label className="form-label">Tên tài khoản</label>
              <div className="form-input-wrapper">
                <User className="form-input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: khang123"
                  value={registerForm.accountName}
                  onChange={(e) => setRegisterForm({ ...registerForm, accountName: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Họ */}
            <div className="form-group">
              <label className="form-label">Họ</label>
              <div className="form-input-wrapper">
                <User className="form-input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nhập họ của bạn"
                  value={registerForm.lastName}
                  onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                />
              </div>
            </div>

            {/* Tên */}
            <div className="form-group">
              <label className="form-label">Tên</label>
              <div className="form-input-wrapper">
                <User className="form-input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nhập tên của bạn"
                  value={registerForm.firstName}
                  onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                />
              </div>
            </div>

            {/* Mật khẩu */}
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

            {/* Xác nhận mật khẩu */}
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