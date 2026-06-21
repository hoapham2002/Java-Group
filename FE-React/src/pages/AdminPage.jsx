import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, FileText, HardDrive, Cpu, ShieldAlert,
    Trash2, Search, CheckCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { getAllUsers, searchAccount, getDocumentsForAdmin, deleteDocument, deleteUserById } from '../services/api';
import './AdminPage.css';

function AdminPage() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');

    const [usersList, setUsersList] = useState([]);
    const [filesList, setFilesList] = useState([]);

    const [userMeta, setUserMeta] = useState({ page: 1, pageSize: 5, total: 0 });
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalFiles: 0,
        totalStorageUsed: 0,
        totalApiCalls: 0
    });

    // 1. Fetch danh sách User (Bọc useCallback để tránh loop)
    const fetchUsersData = useCallback(async (page = 0, size = 5) => {
        try {
            const res = await getAllUsers({ page, size });
            if (res?.data?.data?.result) {
                setUsersList(res.data.data.result);
                setUserMeta({
                    page: res.data.data.meta.page,
                    pageSize: res.data.data.meta.pageSize,
                    total: res.data.data.meta.total
                });
                setStats(prev => ({ ...prev, totalUsers: res.data.data.meta.total }));
            } else {
                setUsersList([]);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách user:", error);
            setUsersList([]);
        }
    }, []);

    // 2. Fetch danh sách toàn bộ Files hệ thống (An toàn, chống Loop vĩnh viễn)
    const fetchFilesData = useCallback(async () => {
        try {
            const res = await getDocumentsForAdmin();
            if (res?.data) {
                // Phân rã cấu trúc chuẩn từ ApiResponse<List<DocumentDto>> của Spring Boot
                let docs = res.data?.data?.result || res.data?.data || res.data?.result || res.data;

                // Nếu backend trả về object chứa mảng bên trong result
                if (docs && typeof docs === 'object' && !Array.isArray(docs)) {
                    if (Array.isArray(docs.result)) docs = docs.result;
                }

                if (Array.isArray(docs)) {
                    setFilesList(docs);
                    setStats(prev => ({ ...prev, totalFiles: docs.length }));
                } else {
                    console.warn("Dữ liệu không đúng định dạng mảng:", docs);
                    setFilesList([]);
                }
            } else {
                setFilesList([]);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách tài liệu toàn hệ thống:", error);
            // KHI LỖI 500: Gán mảng rỗng ngay để chặn re-render kích hoạt loop
            setFilesList([]);
        }
    }, []);

    // Điều phối gọi dữ liệu khi Tab thay đổi (Chỉ gọi duy nhất khi activeTab đổi)
    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchUsersData(0, 5);
            fetchFilesData();
        } else if (activeTab === 'users') {
            fetchUsersData(0, 5);
        } else if (activeTab === 'files') {
            fetchFilesData();
        }
    }, [activeTab, fetchUsersData, fetchFilesData]);

    // Thêm Debounce cho tìm kiếm User
    useEffect(() => {
        if (activeTab !== 'users') return;

        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim() !== '') {
                try {
                    const res = await searchAccount(searchQuery, 0, 5);
                    if (res?.data?.data?.result) {
                        setUsersList(res.data.data.result);
                        setUserMeta({
                            page: res.data.data.meta.page,
                            pageSize: res.data.data.meta.pageSize,
                            total: res.data.data.meta.total
                        });
                    } else {
                        setUsersList([]);
                    }
                } catch (error) {
                    console.error("Lỗi thực thi tìm kiếm:", error);
                    setUsersList([]);
                }
            } else {
                fetchUsersData(0, 5);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, activeTab, fetchUsersData]);

    const handleDeleteUserAction = async (accountId) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: `Muốn xóa tài khoản #${accountId} này không? Hành động này không thể hoàn tác!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Đồng ý, Xóa!',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                const res = await deleteUserById(accountId);
                if (res) {
                    Swal.fire({
                        title: 'Đã xóa!',
                        text: 'Xóa tài khoản thành công.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    if (searchQuery) {
                        setSearchQuery('');
                    } else {
                        const currentPage = userMeta.page > 0 ? userMeta.page - 1 : 0;
                        fetchUsersData(currentPage, 5);
                    }
                }
            } catch (error) {
                Swal.fire({
                    title: 'Thất bại!',
                    text: 'Xóa tài khoản thất bại, vui lòng kiểm tra lại!',
                    icon: 'error'
                });
            }
        }
    };

    const handleDeleteDocumentReal = async (docId) => {
        const result = await Swal.fire({
            title: 'Xóa vĩnh viễn?',
            text: `Bạn có chắc chắn muốn xóa tài liệu #${docId} này không?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa ngay!',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                const res = await deleteDocument(docId);
                if (res) {
                    Swal.fire({
                        title: 'Thành công!',
                        text: 'Tài liệu đã được xóa khỏi hệ thống.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    fetchFilesData();
                }
            } catch (error) {
                Swal.fire({
                    title: 'Thất bại!',
                    text: 'Xóa tài liệu thất bại, vui lòng thử lại sau!',
                    icon: 'error'
                });
            }
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Lọc danh sách file theo ô tìm kiếm trên local Client
    const filteredFiles = Array.isArray(filesList)
        ? filesList.filter(f => (f?.docOriginalName || '').toLowerCase().includes(searchQuery.toLowerCase()))
        : [];

    return (
        <div className="admin-container">
            {/* --- SIDEBAR --- */}
            <div className="admin-sidebar">
                <div className="sidebar-brand">
                    <ShieldAlert size={24} className="brand-icon" />
                    <span>StudyHub Admin</span>
                </div>
                <nav className="sidebar-menu">
                    <button className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setSearchQuery(''); }}>
                        <Cpu size={18} /> Tổng quan hệ thống
                    </button>
                    <button className={`menu-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => { setActiveTab('users'); setSearchQuery(''); }}>
                        <Users size={18} /> Quản lý người dùng
                    </button>
                    <button className={`menu-item ${activeTab === 'files' ? 'active' : ''}`} onClick={() => { setActiveTab('files'); setSearchQuery(''); }}>
                        <FileText size={18} /> Quản lý tài liệu
                    </button>
                </nav>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="admin-main">
                <header className="admin-header">
                    <h2>
                        {activeTab === 'dashboard' && 'Bảng Điều Khiển Hệ Thống'}
                        {activeTab === 'users' && 'Quản Lý Người Dùng'}
                        {activeTab === 'files' && 'Kho Lưu Trữ Toàn Hệ Thống'}
                    </h2>
                </header>

                {/* TAB 1: DASHBOARD */}
                {activeTab === 'dashboard' && (
                    <div className="dashboard-content">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon u-bg"><Users size={24} /></div>
                                <div className="stat-info">
                                    <label>Tổng thành viên</label>
                                    <p>{stats.totalUsers} người</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon f-bg"><FileText size={24} /></div>
                                <div className="stat-info">
                                    <label>Tổng file tải lên</label>
                                    <p>{stats.totalFiles} tài liệu</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon s-bg"><HardDrive size={24} /></div>
                                <div className="stat-info">
                                    <label>Dung lượng hệ thống</label>
                                    <p>{formatBytes(stats.totalStorageUsed)}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon a-bg"><Cpu size={24} /></div>
                                <div className="stat-info">
                                    <label>API Calls (AI)</label>
                                    <p>{stats.totalApiCalls} lượt</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: QUẢN LÝ USER */}
                {activeTab === 'users' && (
                    <div className="table-wrapper">
                        <div className="admin-search-bar">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Tìm theo tên tài khoản thực tế bằng API..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên tài khoản</th>
                                    <th>Email</th>
                                    <th>Vai trò</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(usersList) && usersList.length > 0 ? (
                                    usersList.map(u => (
                                        <tr key={u.accountID || u.accountId}>
                                            <td>#{u.accountID || u.accountId}</td>
                                            <td><strong>{u.accountName}</strong></td>
                                            <td>{u.email}</td>
                                            <td><span className={`role-tag ${u.role}`}>{u.role}</span></td>
                                            <td>
                                                <button className="btn-delete-action" onClick={() => handleDeleteUserAction(u.accountID || u.accountId)}>
                                                    <Trash2 size={14} /> Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                            Không tìm thấy tài khoản nào phù hợp
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 3: QUẢN LÝ FILE */}
                {activeTab === 'files' && (
                    <div className="table-wrapper">
                        <div className="admin-search-bar">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Tìm tên tài liệu..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID File</th>
                                    <th>Tên tài liệu</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFiles.length > 0 ? (
                                    filteredFiles.map(f => (
                                        <tr key={f.docId}>
                                            <td>#{f.docId}</td>
                                            <td className="file-name-cell" title={f.docOriginalName}>{f.docOriginalName}</td>
                                            <td>
                                                <span className={`status-tag completed`}>
                                                    <CheckCircle size={12} /> Thành công
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn-delete-action" onClick={() => handleDeleteDocumentReal(f.docId)}>
                                                    <Trash2 size={14} /> Xóa thật
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                            Không có tài liệu nào hiển thị hoặc không tìm thấy kết quả phù hợp
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPage;