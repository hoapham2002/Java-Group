import React, { useState } from 'react';
import './RegisterPage.css';
import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate để chuyển trang

const RegisterPage = () => {
    const navigate = useNavigate(); // Hook dùng để chuyển hướng sau khi đăng ký thành công
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: false
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState(''); // Thêm state quản lý lỗi từ Backend trả về
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

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

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (serverError) {
            setServerError(''); // Xóa lỗi server khi người dùng nhập lại
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let newErrors = {};

        // Validate dữ liệu chặt chẽ ở Front-end trước khi cho fetch
        if (!formData.firstName || !formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName || !formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.userName || !formData.userName.trim()) newErrors.userName = 'Username is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return; // Dừng lại luôn nếu có lỗi trống, không cho gửi lên Backend
        }

        setIsLoading(true);
        setServerError('');

        // Đóng gói payload - Ép kiểu chuỗi lấy trực tiếp từ State hiện tại
        const payload = {
            firstName: String(formData.firstName).trim(),
            lastName: String(formData.lastName).trim(),
            username: String(formData.userName).trim(), // Khớp với trường 'username' viết thường của DTO
            email: String(formData.email).trim(),
            password: String(formData.password)
        };

        // Bạn có thể bật dòng dưới này lên ở F12 Console để tự kiểm tra xem có bị null trước khi gửi không:
        // console.log("Dữ liệu gửi đi:", payload);

        try {
            const response = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload), // ◄ Gửi cục payload chuẩn này đi
            });

            const result = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 2500);
            } else {
                setServerError(result.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            setServerError('Cannot connect to the server. Please check your backend status!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-wrapper">
            <div className="register-container">
                <div className="register-card">
                    {!isSuccess ? (
                        <>
                            <div className="register-header">
                                <div className="logo">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                        <rect width="32" height="32" rx="6" fill="#635BFF" />
                                        <path d="M8 12h16v2H8v-2zm0 4h16v2H8v-2zm0 4h10v2H8v-2z" fill="white" />
                                    </svg>
                                </div>
                                <h1>Create account</h1>
                                <p>Get started with your free trial today</p>
                            </div>

                            {/* Hiển thị lỗi từ hệ thống hoặc trùng lặp Email nếu có */}
                            {serverError && (
                                <div className="error-message show" style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff5f5', color: '#e53e3e', borderRadius: '6px', fontSize: '14px', border: '1px solid #fed7d7' }}>
                                    {serverError}
                                </div>
                            )}

                            <form className="register-form" onSubmit={handleSubmit} noValidate>

                                <div className="name-row">
                                    <div className={`input-group ${errors.firstName ? 'error' : ''}`}>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            placeholder=" "
                                        />
                                        <label>First Name</label>
                                        <span className="input-border"></span>
                                        <span className={`error-message ${errors.firstName ? 'show' : ''}`}>{errors.firstName}</span>
                                    </div>

                                    <div className={`input-group ${errors.lastName ? 'error' : ''}`}>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            placeholder=" "
                                        />
                                        <label>Last Name</label>
                                        <span className="input-border"></span>
                                        <span className={`error-message ${errors.lastName ? 'show' : ''}`}>{errors.lastName}</span>
                                    </div>
                                </div>

                                <div className={`input-group ${errors.userName ? 'error' : ''}`}>
                                    <input
                                        type="text"
                                        name="userName"
                                        value={formData.userName}
                                        onChange={handleChange}
                                        required
                                        placeholder=" "
                                    />
                                    <label>Username</label>
                                    <span className="input-border"></span>
                                    <span className={`error-message ${errors.userName ? 'show' : ''}`}>{errors.userName}</span>
                                </div>

                                <div className={`input-group ${errors.email ? 'error' : ''}`}>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder=" "
                                    />
                                    <label>Email address</label>
                                    <span className="input-border"></span>
                                    <span className={`error-message ${errors.email ? 'show' : ''}`}>{errors.email}</span>
                                </div>

                                <div className={`input-group ${errors.password ? 'error' : ''}`}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder=" "
                                    />
                                    <label>Password</label>
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill={showPassword ? "#635BFF" : "#8792a2"}>
                                            <path d="M8 3C4.5 3 1.6 5.6 1 8c.6 2.4 3.5 5 7 5s6.4-2.6 7-5c-.6-2.4-3.5-5-7-5zm0 8.5A3.5 3.5 0 118 4.5a3.5 3.5 0 010 7zm0-5.5a2 2 0 100 4 2 2 0 000-4z" fill="currentColor" />
                                        </svg>
                                    </button>
                                    <span className="input-border"></span>
                                    <span className={`error-message ${errors.password ? 'show' : ''}`}>{errors.password}</span>
                                </div>

                                <div className={`input-group ${errors.confirmPassword ? 'error' : ''}`}>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        placeholder=" "
                                    />
                                    <label>Confirm Password</label>
                                    <span className="input-border"></span>
                                    <span className={`error-message ${errors.confirmPassword ? 'show' : ''}`}>{errors.confirmPassword}</span>
                                </div>

                                <div className="form-options">
                                    <label className={`checkbox-container ${errors.terms ? 'error-text' : ''}`}>
                                        <input
                                            type="checkbox"
                                            name="terms"
                                            checked={formData.terms}
                                            onChange={handleChange}
                                        />
                                        <span className="checkmark">
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                        I agree to the <a href="#">Terms & Conditions</a>
                                    </label>
                                </div>

                                <button type="submit" className={`submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                                    <span className="btn-text">{isLoading ? 'Creating account...' : 'Create account'}</span>
                                    {isLoading && (
                                        <div className="btn-loader">
                                            <svg width="18" height="18" viewBox="0 0 18 18">
                                                <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" opacity="0.25" fill="none" />
                                                <path d="M16 9a7 7 0 01-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
                                                    <animateTransform attributeName="transform" type="rotate" dur="1s" values="0 9 9;360 9 9" repeatCount="indefinite" />
                                                </path>
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            </form>
                            <div className="signin-link" style={{ marginTop: '20px' }}>
                                <span>Already have an account? </span>
                                <Link to="/login">Sign in</Link>
                            </div>
                        </>
                    ) : (
                        <div className="success-message show">
                            <div className="success-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="12" fill="#635BFF" />
                                    <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>Account created!</h3>
                            <p>Đăng ký thành công! Đang chuyển hướng về trang đăng nhập...</p>
                            <button className="submit-btn" style={{ marginTop: '20px' }} onClick={() => navigate('/login')}>Sign In Now</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;