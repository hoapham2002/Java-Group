import React, { useState } from 'react';
import './LoginPage.css';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate(); // Hook dùng để chuyển trang
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Thêm state để quản lý thông báo lỗi chung từ Server (ví dụ: Sai email/mật khẩu)
    const [serverError, setServerError] = useState('');

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Xóa lỗi validate trường thông tin khi người dùng gõ tiếp
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        // Xóa thông báo lỗi tổng của server khi người dùng sửa lại dữ liệu
        if (serverError) {
            setServerError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let newErrors = {};
        setServerError(''); // Reset lỗi cũ

        // 1. Kiểm tra Validate phía Client trước khi gửi đi
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // 2. Gọi API Login thực tế đến Backend Spring Boot
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            if (response.ok) {
                // ĐÃ SỬA: Đọc dữ liệu bằng .json() thay vì .text()
                const data = await response.json();

                setIsSuccess(true);

                // ĐÃ SỬA: Lấy đúng thuộc tính 'token' từ JSON Object trả về
                localStorage.setItem('token', data.token);

                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);

            } else {
                // Xử lý lỗi linh hoạt (Đọc dạng text nếu thông báo từ server chỉ là chuỗi thông thường)
                const errorText = await response.text();
                setServerError(errorText || 'Đăng nhập thất bại. Vui lòng thử lại!');
            }
        } catch (error) {
            setServerError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại backend!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <div className="login-card">
                    {!isSuccess ? (
                        <>
                            <div className="login-header">
                                <div className="logo">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                        <rect width="32" height="32" rx="6" fill="#635BFF" />
                                        <path d="M8 12h16v2H8v-2zm0 4h16v2H8v-2zm0 4h10v2H8v-2z" fill="white" />
                                    </svg>
                                </div>
                                <h1>Sign in to Dashboard</h1>
                                <p>Welcome back! Please sign in to continue</p>
                            </div>

                            <form className="login-form" onSubmit={handleSubmit} noValidate>

                                {/* HIỂN THỊ LỖI TỪ SERVER TRẢ VỀ (NẾU CÓ) */}
                                {serverError && (
                                    <div className="server-error-banner" style={{
                                        backgroundColor: '#ffeaeb',
                                        color: '#ff4d4f',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        marginBottom: '15px',
                                        fontSize: '14px',
                                        border: '1px solid #ffccc7',
                                        textAlign: 'center'
                                    }}>
                                        {serverError}
                                    </div>
                                )}

                                <div className={`input-group ${errors.email ? 'error' : ''}`}>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        autoComplete="email"
                                        placeholder=" "
                                    />
                                    <label htmlFor="email">Email address</label>
                                    <span className="input-border"></span>
                                    <span className={`error-message ${errors.email ? 'show' : ''}`}>
                                        {errors.email}
                                    </span>
                                </div>

                                <div className={`input-group ${errors.password ? 'error' : ''}`}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="current-password"
                                        placeholder=" "
                                    />
                                    <label htmlFor="password">Password</label>
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label="Toggle password visibility"
                                        style={{ color: showPassword ? '#635BFF' : '#8792a2' }}
                                    >
                                        <svg className="eye-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M8 3C4.5 3 1.6 5.6 1 8c.6 2.4 3.5 5 7 5s6.4-2.6 7-5c-.6-2.4-3.5-5-7-5zm0 8.5A3.5 3.5 0 118 4.5a3.5 3.5 0 010 7zm0-5.5a2 2 0 100 4 2 2 0 000-4z" fill="currentColor" />
                                        </svg>
                                    </button>
                                    <span className="input-border"></span>
                                    <span className={`error-message ${errors.password ? 'show' : ''}`}>
                                        {errors.password}
                                    </span>
                                </div>

                                <div className="form-options">
                                    <label className="checkbox-container">
                                        <input
                                            type="checkbox"
                                            id="remember"
                                            name="remember"
                                            checked={formData.remember}
                                            onChange={handleChange}
                                        />
                                        <span className="checkmark">
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                        Remember me
                                    </label>
                                    <a href="#" className="forgot-link">Forgot password?</a>
                                </div>

                                <button type="submit" className={`submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                                    <span className="btn-text">Sign in</span>
                                    <div className="btn-loader">
                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                            <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                                            <path d="M16 9a7 7 0 01-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                <animateTransform attributeName="transform" type="rotate" dur="1s" values="0 9 9;360 9 9" repeatCount="indefinite" />
                                            </path>
                                        </svg>
                                    </div>
                                </button>
                            </form>

                            <div className="divider">
                                <span>or continue with</span>
                            </div>

                            <div className="social-buttons">
                                <button type="button" className="social-btn">
                                    <svg width="16" height="16" viewBox="0 0 16 16">
                                        <path fill="#4285F4" d="M14.9 8.161c0-.476-.039-.954-.118-1.421H8.021v2.681h3.833a3.321 3.321 0 01-1.431 2.161v1.785h2.3c1.349-1.25 2.177-3.103 2.177-5.206z" />
                                        <path fill="#34A853" d="M8.021 15c1.951 0 3.57-.65 4.761-1.754l-2.3-1.785c-.653.447-1.477.707-2.461.707-1.887 0-3.487-1.274-4.057-2.991H1.617V11.1C2.8 13.481 5.282 15 8.021 15z" />
                                        <path fill="#FBBC05" d="M3.964 9.177a4.97 4.97 0 010-2.354V4.9H1.617a8.284 8.284 0 000 7.623l2.347-1.346z" />
                                        <path fill="#EA4335" d="M8.021 3.177c1.064 0 2.02.375 2.75 1.111l2.041-2.041C11.616 1.016 9.97.446 8.021.446c-2.739 0-5.221 1.519-6.404 3.9l2.347 1.346c.57-1.717 2.17-2.515 4.057-2.515z" />
                                    </svg>
                                    Google
                                </button>

                                <button type="button" className="social-btn">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="#000000">
                                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                                    </svg>
                                    GitHub
                                </button>
                            </div>

                            <div className="signup-link">
                                <span>Don't have an account? </span>
                                <Link to="/register">Register Account</Link>
                            </div>
                        </>
                    ) : (
                        <div className="success-message show">
                            <div className="success-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="12" fill="#635BFF" />
                                    <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>Welcome back!</h3>
                            <p>Redirecting to your dashboard...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;