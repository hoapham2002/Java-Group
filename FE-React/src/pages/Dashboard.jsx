import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Upload, FileText, Trash2, Search, BookOpen,
  AlertCircle, Files, CheckCircle, Clock, LogOut,
  Share2, FolderOpen
} from 'lucide-react';
import { getDocuments, getSubjects, uploadDocument, deleteDocument } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

const THUMB_COLORS = ['purple', 'green', 'blue', 'orange', 'pink'];

function getStatusInfo(status) {
  switch (status) {
    case 'completed':
      return { dotClass: 'completed', textClass: 'completed', label: 'Sẵn sàng AI' };
    case 'processing':
      return { dotClass: 'processing', textClass: 'processing', label: 'Đang xử lý' };
    default:
      return { dotClass: 'pending', textClass: 'pending', label: 'Chờ xử lý' };
  }
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Xác định tab hiện tại dựa trên URL
  const activeTab = location.pathname.includes('/shared') ? 'shared' : 'mine';
  const [documents, setDocuments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [docsRes, subsRes] = await Promise.all([
        getDocuments(),
        getSubjects()
      ]);
      setDocuments(docsRes.data.data || []);
      setSubjects(subsRes.data.data || []);
      if (subsRes.data.data && subsRes.data.data.length > 0 && !selectedSubject) {
        setSelectedSubject(subsRes.data.data[0].subjId.toString());
      }
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setUploadError('Vui lòng chọn file PDF.');
      return;
    }
    if (!selectedSubject) {
      setUploadError('Vui lòng chọn môn học.');
      return;
    }
    setUploadError('');
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subjectId', selectedSubject);
    try {
      await uploadDocument(formData);
      fetchData();
    } catch (error) {
      setUploadError('Lỗi khi tải file lên: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    try {
      await deleteDocument(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting document', error);
      alert('Lỗi khi xóa tài liệu');
    }
  };

  const handleDocClick = (doc) => {
    if (doc.docStatus === 'completed') {
      navigate(`/chat/${doc.docId}`);
    } else {
      alert('Tài liệu đang được xử lý, vui lòng chờ.');
    }
  };

  const myDocs = documents.filter(d =>
    !searchQuery || d.docOriginalName?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sharedDocs = [];

  const displayedDocs = activeTab === 'mine' ? myDocs : sharedDocs;
  const completedCount = documents.filter(d => d.docStatus === 'completed').length;
  const processingCount = documents.filter(d => d.docStatus !== 'completed').length;

  return (
    <div className="app-layout">
      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo-icon">
            <BookOpen />
          </div>
          <div>
            <div className="header-title">AI Study Hub</div>
            <div className="header-subtitle">Hệ thống quản lý tài liệu thông minh</div>
          </div>
        </div>

        <div className="header-right">
          <div className="search-bar">
            <Search />
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm tài liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="avatar" title={user?.email}>
            {user?.accountName?.[0]?.toUpperCase() || 'U'}
          </div>
          <button className="btn-logout" onClick={logout} title="Đăng xuất">
            <LogOut />
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* ===== MAIN ===== */}
      <main className="main-content">
        {/* ===== GREETING BANNER ===== */}
        <div className="greeting-banner">
          <div className="greeting-text">
            <span className="greeting-emoji">👋</span>
            <div>
              <h1 className="greeting-title">
                {getGreeting()}, <span className="greeting-name">#{user?.accountName}</span>
              </h1>
              <p className="greeting-sub">Hôm nay bạn muốn học gì? Tải tài liệu lên và hỏi đáp cùng AI.</p>
            </div>
          </div>
          {/* Stats */}
          <div className="greeting-stats">
            <div className="g-stat">
              <Files />
              <span>{documents.length}</span>
              <small>Tài liệu</small>
            </div>
            <div className="g-stat">
              <CheckCircle />
              <span>{completedCount}</span>
              <small>Sẵn sàng</small>
            </div>
            <div className="g-stat">
              <Clock />
              <span>{processingCount}</span>
              <small>Đang xử lý</small>
            </div>
          </div>
        </div>

        {/* ===== UPLOAD PANEL ===== */}
        <div className="page-header">
          <div className="page-tabs">
            <button
              className={`page-tab${activeTab === 'mine' ? ' active' : ''}`}
              onClick={() => navigate('/documents')}
            >
              <FolderOpen />
              Của tôi
              <span className="tab-badge">{myDocs.length}</span>
            </button>
            <button
              className={`page-tab${activeTab === 'shared' ? ' active' : ''}`}
              onClick={() => navigate('/documents/shared')}
            >
              <Share2 />
              Được chia sẻ
              <span className="tab-badge">{sharedDocs.length}</span>
            </button>
          </div>

          {activeTab === 'mine' && (
            <div className="upload-panel">
              <div className="upload-panel-field">
                <label>Môn học</label>
                <select
                  className="select-subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {subjects.map(sub => (
                    <option key={sub.subjId} value={sub.subjId}>{sub.subjName}</option>
                  ))}
                </select>
              </div>
              <input
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isUploading}
                style={{ display: 'none' }}
              />
              <button
                className="btn-upload"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <><div className="spinner" /><span>Đang tải...</span></>
                ) : (
                  <><Upload /><span>Tải lên PDF</span></>
                )}
              </button>
            </div>
          )}
        </div>

        {uploadError && (
          <div className="alert-error">
            <AlertCircle />
            <span>{uploadError}</span>
          </div>
        )}

        {/* ===== DOCUMENT GRID ===== */}
        <div className="doc-grid">
          {displayedDocs.map((doc, idx) => {
            const colorKey = THUMB_COLORS[idx % THUMB_COLORS.length];
            const statusInfo = getStatusInfo(doc.docStatus);
            return (
              <div 
                key={doc.docId} 
                className="doc-card"
                onClick={() => handleDocClick(doc)}
              >
                <div className={`doc-card-thumb ${colorKey}`}>
                  <FileText />
                  <div className="doc-type-badge">PDF</div>
                </div>
                <div className="doc-card-body">
                  <div className="doc-card-name" title={doc.docOriginalName}>
                    {doc.docOriginalName}
                  </div>
                  <div className="doc-subject-tag">
                    {doc.subject?.subjName || 'Chưa phân loại'}
                  </div>
                  <div className="doc-card-footer">
                    <div className="doc-status">
                      <span className={`status-dot ${statusInfo.dotClass}`} />
                      <span className={`status-text ${statusInfo.textClass}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="doc-actions">
                      <button
                        className="btn-icon"
                        title="Xóa tài liệu"
                        onClick={(e) => handleDelete(e, doc.docId)}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {displayedDocs.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                {activeTab === 'mine' ? <FileText /> : <Share2 />}
              </div>
              {activeTab === 'mine' ? (
                <>
                  <h3>Chưa có tài liệu nào</h3>
                  <p>Tải lên file PDF đầu tiên của bạn để bắt đầu học tập cùng AI</p>
                  <button className="btn-empty-upload" onClick={() => fileInputRef.current?.click()}>
                    Tải lên ngay
                  </button>
                </>
              ) : (
                <>
                  <h3>Chưa có tài liệu được chia sẻ</h3>
                  <p>Khi ai đó chia sẻ tài liệu với bạn, chúng sẽ xuất hiện ở đây</p>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
