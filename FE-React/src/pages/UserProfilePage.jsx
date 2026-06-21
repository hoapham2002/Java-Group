import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, ArrowLeft, FileText, HardDrive, RefreshCw, Cpu } from 'lucide-react';
import { getFileByAccountId, getUserProfileApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './UserProfilePage.css';

function UserProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State quản lý dữ liệu nhận về từ API
    const [profileData, setProfileData] = useState(null);
    const [userFiles, setUserFiles] = useState([]);

    // State quản lý trạng thái loading
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);

    // Hàm gọi các API đồng thời khi có ID tài khoản
    const loadAllData = (accountId) => {
        if (!accountId) return;
        fetchUserProfile(accountId);
        fetchUserFiles(accountId);
    };

    // 1. Khối useEffect chủ lực - Bóc tách ID thông minh từ dữ liệu đăng nhập hiện tại
    useEffect(() => {
        const localUserRaw = localStorage.getItem('user');
        let loggedInUser = user || {};

        if (!loggedInUser || Object.keys(loggedInUser).length === 0) {
            try {
                if (localUserRaw) loggedInUser = JSON.parse(localUserRaw);
            } catch (e) {
                console.error("Lỗi đọc dữ liệu localUser:", e);
            }
        }

        const finalAccountId =
            loggedInUser?.accountID ||
            loggedInUser?.accountId ||
            loggedInUser?.id ||
            loggedInUser?.user?.accountID ||
            loggedInUser?.user?.accountId ||
            loggedInUser?.user?.id;

        if (finalAccountId) {
            console.log("=== [SUCCESS] Tìm thấy Account ID hợp lệ:", finalAccountId);
            loadAllData(finalAccountId);
        } else {
            console.error("=== [ERROR] Không tìm thấy accountID để gọi API profile. Cục user hiện tại:", loggedInUser);
        }
    }, [user]);

    // 2. Kích hoạt gọi API profile (Đã gộp lại thành 1 hàm duy nhất và tối ưu)
    const fetchUserProfile = async (accountId) => {
        setIsLoadingProfile(true);
        try {
            const response = await getUserProfileApi(accountId);

            // 1. In toàn bộ response ra để xem cấu trúc thật
            console.log("=== ĐÂY LÀ RESPONSE TỪ API ==:", response);

            let finalDataToSet = null;

            // Kịch bản 1: Axios mặc định (chưa bóc vỏ)
            if (response && response.data && response.data.data) {
                finalDataToSet = response.data.data;
                console.log("-> Rơi vào kịch bản 1 (Axios gốc)");
            }
            // Kịch bản 2: Axios đã bị bóc 1 lớp vỏ bằng Interceptor
            else if (response && response.data && response.status === 200) {
                finalDataToSet = response.data;
                console.log("-> Rơi vào kịch bản 2 (Axios Interceptor)");
            }
            // Kịch bản 3: Trả về trực tiếp object data (hiếm gặp nhưng đề phòng)
            else if (response && response.accountID) {
                finalDataToSet = response;
                console.log("-> Rơi vào kịch bản 3 (Trả thẳng data)");
            }

            // 2. Set state nếu tìm thấy data
            if (finalDataToSet) {
                console.log("=== DATA ĐƯỢC SET VÀO STATE ===:", finalDataToSet);
                setProfileData(finalDataToSet);
            } else {
                console.warn("Không trích xuất được data. Vui lòng kiểm tra log bên trên.");
            }

        } catch (error) {
            console.error('Lỗi khi gọi API User Profile:', error);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    // 3. Gọi API lấy danh sách tài liệu
    const fetchUserFiles = async (accountId) => {
        setIsLoadingFiles(true);
        try {
            const response = await getFileByAccountId(accountId);
            setUserFiles(response.data?.data || []);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách file của người dùng:', error);
        } finally {
            setIsLoadingFiles(false);
        }
    };

    // Quy đổi dung lượng hệ thống (Byte -> MB)
    const formatStorage = (bytes) => {
        if (!bytes && bytes !== 0) return '0 MB';
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    // ==========================================
    // KHỐI RENDER DỮ LIỆU
    // ==========================================
    const accountName = profileData?.accountName || user?.accountName || 'Người dùng';
    const email = profileData?.email || user?.email || 'Chưa cập nhật email';
    const displayId = profileData?.accountID || user?.accountID || 'N/A';

    // Tách riêng biệt 2 trường Họ và Tên
    const firstName = profileData?.firstName || 'Chưa cập nhật';
    const lastName = profileData?.lastName || 'Chưa cập nhật';

    // Các thông số hạn ngạch lưu trữ
    const usedStorage = profileData?.usedStorage || 0;
    const storageQuota = profileData?.storageQuota || 104857600;
    const apiCallCount = profileData?.apiCallCount || 0;

    if (isLoadingProfile && !profileData) {
        return (
            <div className="profile-loading-page">
                <div className="spinner" />
                <p>Đang đồng bộ dữ liệu tài khoản từ hệ thống...</p>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <button className="btn-back" onClick={() => navigate('/documents')}>
                <ArrowLeft size={18} />
                <span>Quay lại bảng điều khiển</span>
            </button>

            <div className="profile-layout">
                {/* THÔNG TIN TÀI KHOẢN (BÊN TRÁI) */}
                <div className="profile-card info-card">
                    <div className="profile-avatar-large">
                        <User size={48} />
                    </div>
                    {/* Đẩy Tên đăng nhập lên làm tiêu đề chính */}
                    <h2 className="profile-name">@{accountName}</h2>
                    <p className="profile-username-tag">Tài khoản hệ thống</p>

                    <hr className="divider" />

                    <div className="profile-details">
                        {/* Hiển thị Họ và Tên riêng biệt */}
                        <div className="detail-item">
                            <User size={18} className="detail-icon" />
                            <div>
                                <label>Họ (Last Name)</label>
                                <p>{lastName}</p>
                            </div>
                        </div>

                        <div className="detail-item">
                            <User size={18} className="detail-icon" />
                            <div>
                                <label>Tên (First Name)</label>
                                <p>{firstName}</p>
                            </div>
                        </div>

                        <div className="detail-item">
                            <Mail size={18} className="detail-icon" />
                            <div>
                                <label>Email liên hệ</label>
                                <p>{email}</p>
                            </div>
                        </div>

                        <div className="detail-item">
                            <HardDrive size={18} className="detail-icon" />
                            <div>
                                <label>Dung lượng lưu trữ hệ thống</label>
                                <p>{formatStorage(usedStorage)} / {formatStorage(storageQuota)}</p>
                                <div className="storage-bar-wrapper" style={{ background: '#eee', height: 6, borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
                                    <div style={{
                                        background: '#3b82f6',
                                        height: '100%',
                                        width: `${Math.min((usedStorage / storageQuota) * 100, 100)}%`
                                    }} />
                                </div>
                            </div>
                        </div>

                        <div className="detail-item">
                            <Cpu size={18} className="detail-icon" />
                            <div>
                                <label>Số lượt yêu cầu AI (API Calls)</label>
                                <p><strong>{apiCallCount}</strong> lượt</p>
                            </div>
                        </div>

                        <div className="detail-item">
                            <FileText size={18} className="detail-icon" />
                            <div>
                                <label>ID Tài khoản (Hệ thống)</label>
                                <p><strong>{displayId}</strong></p>
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn-refresh-profile"
                        onClick={() => {
                            const currentId = profileData?.accountID || user?.accountID;
                            if (currentId) loadAllData(currentId);
                        }}
                    >
                        <RefreshCw size={14} />
                        <span>Làm mới thông tin</span>
                    </button>
                </div>

                {/* DANH SÁCH TÀI LIỆU ĐÃ TẢI LÊN (BÊN PHẢI) */}
                <div className="profile-card files-card">
                    <div className="card-header">
                        <FileText size={20} />
                        <h3>Tài liệu bạn đã tải lên ({userFiles.length})</h3>
                    </div>

                    {isLoadingFiles ? (
                        <div className="profile-loading">
                            <div className="spinner" />
                            <p>Đang tải danh sách tài liệu...</p>
                        </div>
                    ) : userFiles.length > 0 ? (
                        <div className="profile-files-list">
                            {userFiles.map((file) => (
                                <div
                                    key={file.docId}
                                    className="profile-file-item"
                                    onClick={() => {
                                        if (file.docStatus === 'completed') {
                                            navigate(`/chat/${file.docId}`);
                                        } else {
                                            alert('Tài liệu đang xử lý, vui lòng quay lại sau.');
                                        }
                                    }}
                                >
                                    <div className="file-icon-wrapper">
                                        <FileText size={16} />
                                    </div>
                                    <div className="file-info">
                                        <p className="file-name" title={file.docOriginalName}>
                                            {file.docOriginalName}
                                        </p>
                                        <span className="file-subject">
                                            {file.subject?.subjName || 'Chưa rõ môn học'}
                                        </span>
                                    </div>
                                    <span className={`file-status-tag ${file.docStatus}`}>
                                        {file.docStatus === 'completed' ? 'Sẵn sàng AI' : 'Đang xử lý'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="profile-empty-files">
                            <FileText size={40} />
                            <p>Bạn chưa tải lên tài liệu nào trong hệ thống.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserProfilePage;