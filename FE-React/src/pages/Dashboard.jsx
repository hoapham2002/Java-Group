import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Upload,
  FileText,
  Trash2,
  Search,
  BookOpen,
  AlertCircle,
  Files,
  CheckCircle,
  Clock,
  LogOut,
  Share2,
  FolderOpen,
  X,
  Edit2,
  Check,
  Folder,
  ArrowLeft,
  MoveRight,
  Plus,
  User,
  ShieldCheck,
} from "lucide-react";
import {
  getDocuments,
  getSubjects,
  uploadDocument,
  deleteDocument,
  shareDocument,
  getSharedDocuments,
  renameDocument,
  moveDocument,
  createSubject,
  renameSubject,
  deleteSubject,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "../App.css";

const THUMB_COLORS = ["purple", "green", "blue", "orange", "pink"];

function getStatusInfo(status) {
  switch (status) {
    case "completed":
      return {
        dotClass: "completed",
        textClass: "completed",
        label: "Sẵn sàng AI",
      };
    case "processing":
      return {
        dotClass: "processing",
        textClass: "processing",
        label: "Đang xử lý",
      };
    default:
      return { dotClass: "pending", textClass: "pending", label: "Chờ xử lý" };
  }
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Chào buổi sáng";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.includes("/shared") ? "shared" : "mine";
  const [documents, setDocuments] = useState([]);
  const [sharedDocumentsData, setSharedDocumentsData] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [currentSubjectId, setCurrentSubjectId] = useState(null); // null = Root

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareDocId, setShareDocId] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const [editingDocId, setEditingDocId] = useState(null);
  const [editingDocName, setEditingDocName] = useState("");

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveDocId, setMoveDocId] = useState(null);

  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [editingSubjId, setEditingSubjId] = useState(null);
  const [editingSubjName, setEditingSubjName] = useState("");

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [docsRes, subsRes, sharedDocsRes] = await Promise.all([
        getDocuments(),
        getSubjects(),
        getSharedDocuments(),
      ]);
      setDocuments(docsRes.data.data || []);
      setSubjects(subsRes.data.data || []);
      setSharedDocumentsData(sharedDocsRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setUploadError("Vui lòng chọn file PDF.");
      return;
    }
    setUploadError("");
    setIsUploading(true);
    try {
      console.log(
        "Uploading file:",
        file.name,
        "to subjectId:",
        currentSubjectId,
      );
      await uploadDocument(file, currentSubjectId);
      fetchData();
    } catch (error) {
      setUploadError(
        "Lỗi khi tải file lên: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;
    try {
      await deleteDocument(id);
      fetchData();
    } catch (error) {
      console.error("Error deleting document", error);
      alert("Lỗi khi xóa tài liệu");
    }
  };

  const handleRenameClick = (e, doc) => {
    e.stopPropagation();
    setEditingDocId(doc.docId);
    setEditingDocName(doc.docOriginalName);
  };

  const handleRenameSubmit = async (e, docId) => {
    e.stopPropagation();
    if (!editingDocName.trim()) {
      setEditingDocId(null);
      return;
    }
    try {
      await renameDocument(docId, editingDocName);
      setEditingDocId(null);
      fetchData();
    } catch (error) {
      console.error("Lỗi khi đổi tên:", error);
      alert("Không thể đổi tên tài liệu!");
    }
  };

  const handleRenameKeyDown = (e, docId) => {
    if (e.key === "Enter") handleRenameSubmit(e, docId);
    else if (e.key === "Escape") {
      e.stopPropagation();
      setEditingDocId(null);
    }
  };

  const handleMoveClick = (e, docId) => {
    e.stopPropagation();
    setMoveDocId(docId);
    setIsMoveModalOpen(true);
  };

  const handleMoveSubmit = async (targetSubjectId) => {
    try {
      await moveDocument(moveDocId, targetSubjectId);
      setIsMoveModalOpen(false);
      setMoveDocId(null);
      fetchData();
    } catch (error) {
      alert("Lỗi khi di chuyển tài liệu");
    }
  };

  const handleShareClick = (e, docId) => {
    e.stopPropagation();
    setShareDocId(docId);
    setShareEmail("");
    setShareMessage("");
    setIsShareModalOpen(true);
  };

  const handleShareSubmit = async () => {
    if (!shareEmail) return;
    setIsSharing(true);
    setShareMessage("");
    try {
      await shareDocument({ docId: shareDocId, email: shareEmail });
      setShareMessage("Chia sẻ thành công!");
      setTimeout(() => setIsShareModalOpen(false), 2000);
      fetchData();
    } catch (error) {
      setShareMessage(
        "Lỗi: " + (error.response?.data?.message || error.message),
      );
    } finally {
      setIsSharing(false);
    }
  };

  const handleDocClick = (doc) => {
    if (doc.docStatus === "completed") {
      navigate(`/chat/${doc.docId}`);
    } else {
      alert("Tài liệu đang được xử lý, vui lòng chờ.");
    }
  };

  // SUBJECT HANDLERS
  const handleCreateSubject = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createSubject(newFolderName);
      setNewFolderName("");
      setIsCreateFolderModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Lỗi tạo thư mục");
    }
  };

  const handleDeleteSubject = async (e, subjId) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "CẢNH BÁO: Bạn có chắc chắn muốn xóa thư mục này? Toàn bộ tài liệu bên trong thư mục cũng sẽ bị xóa!",
      )
    )
      return;
    try {
      await deleteSubject(subjId);
      if (currentSubjectId === subjId) setCurrentSubjectId(null);
      fetchData();
    } catch (error) {
      alert("Lỗi xóa thư mục");
    }
  };

  const handleRenameSubjClick = (e, sub) => {
    e.stopPropagation();
    setEditingSubjId(sub.subjId);
    setEditingSubjName(sub.subjName);
  };

  const handleRenameSubjSubmit = async (e, subjId) => {
    e.stopPropagation();
    if (!editingSubjName.trim()) {
      setEditingSubjId(null);
      return;
    }
    try {
      await renameSubject(subjId, editingSubjName);
      setEditingSubjId(null);
      fetchData();
    } catch (error) {
      alert("Lỗi đổi tên thư mục");
    }
  };

  const handleRenameSubjKeyDown = (e, subjId) => {
    if (e.key === "Enter") handleRenameSubjSubmit(e, subjId);
    else if (e.key === "Escape") {
      e.stopPropagation();
      setEditingSubjId(null);
    }
  };

  // Filter documents based on tab, subject, and search
  const myDocs = documents.filter((d) => {
    const matchSearch =
      !searchQuery ||
      d.docOriginalName?.toLowerCase().includes(searchQuery.toLowerCase());
    // Nếu đang tìm kiếm, quét toàn bộ tài liệu bất kể folder. Ngược lại thì lọc theo folder hiện tại.
    const matchSubject = searchQuery
      ? true
      : currentSubjectId === null
        ? !d.subject
        : d.subject?.subjId === currentSubjectId;
    return matchSearch && matchSubject;
  });

  const sharedDocs = sharedDocumentsData.filter(
    (d) =>
      !searchQuery ||
      d.docOriginalName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const displayedDocs = activeTab === "mine" ? myDocs : sharedDocs;
  const completedCount = documents.filter(
    (d) => d.docStatus === "completed",
  ).length;
  const processingCount = documents.filter(
    (d) => d.docStatus !== "completed",
  ).length;

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
            <div className="header-subtitle">
              Hệ thống quản lý tài liệu thông minh
            </div>
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

          {/* Admin button - chỉ hiện cho admin và moderator */}
          {(user?.role === "admin" || user?.role === "moderator") && (
            <button
              className="btn-admin"
              onClick={() => navigate("/admin")}
              title="Quản trị hệ thống"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1rem",
                backgroundColor: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "500",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#4f46e5")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#6366f1")
              }
            >
              <ShieldCheck size={18} />
              <span>Admin</span>
            </button>
          )}

          {/* ĐÃ CẬP NHẬT: Nhấn vào biểu tượng sẽ điều hướng sang trang cá nhân */}
          <div
            className="avatar"
            title="Thông tin cá nhân"
            onClick={() => navigate("/user-profile")}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={20} />
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
                {getGreeting()},{" "}
                <span className="greeting-name">#{user?.accountName}</span>
              </h1>
              <p className="greeting-sub">
                Hôm nay bạn muốn học gì? Tải tài liệu lên và hỏi đáp cùng AI.
              </p>
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
              className={`page-tab${activeTab === "mine" ? " active" : ""}`}
              onClick={() => {
                navigate("/documents");
                setCurrentSubjectId(null);
              }}
            >
              <FolderOpen />
              Của tôi
              <span className="tab-badge">{documents.length}</span>
            </button>
            <button
              className={`page-tab${activeTab === "shared" ? " active" : ""}`}
              onClick={() => navigate("/documents/shared")}
            >
              <Share2 />
              Được chia sẻ
              <span className="tab-badge">{sharedDocs.length}</span>
            </button>
          </div>

          {activeTab === "mine" && (
            <div className="upload-panel">
              <input
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isUploading}
                style={{ display: "none" }}
              />
              <button
                className="btn-upload"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="spinner" />
                    <span>Đang tải...</span>
                  </>
                ) : (
                  <>
                    <Upload />
                    <span>
                      Tải lên PDF vào {currentSubjectId ? "Thư mục" : "Root"}
                    </span>
                  </>
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

        {/* ===== FOLDER LIST ===== */}
        {activeTab === "mine" && (
          <div className="folders-section">
            <div className="folders-header">
              <h3>
                {currentSubjectId === null ? (
                  "Thư mục gốc (Root)"
                ) : (
                  <span className="breadcrumb">
                    <span
                      className="breadcrumb-link"
                      onClick={() => setCurrentSubjectId(null)}
                    >
                      Root
                    </span>
                    <span className="breadcrumb-separator">/</span>
                    {
                      subjects.find((s) => s.subjId === currentSubjectId)
                        ?.subjName
                    }
                  </span>
                )}
              </h3>
              {currentSubjectId === null && (
                <button
                  className="btn-create-folder"
                  onClick={() => setIsCreateFolderModalOpen(true)}
                >
                  <Plus size={16} /> Thư mục mới
                </button>
              )}
            </div>

            {currentSubjectId === null && (
              <div className="folder-grid">
                {subjects.map((sub) => (
                  <div
                    key={sub.subjId}
                    className="folder-card"
                    onClick={() => setCurrentSubjectId(sub.subjId)}
                  >
                    <div className="folder-icon">
                      <Folder fill="#facc15" color="#ca8a04" />
                    </div>
                    <div className="folder-info">
                      {editingSubjId === sub.subjId ? (
                        <div
                          className="rename-container"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            className="rename-input"
                            value={editingSubjName}
                            onChange={(e) => setEditingSubjName(e.target.value)}
                            onKeyDown={(e) =>
                              handleRenameSubjKeyDown(e, sub.subjId)
                            }
                            autoFocus
                          />
                          <button
                            className="btn-rename-submit"
                            onClick={(e) =>
                              handleRenameSubjSubmit(e, sub.subjId)
                            }
                            title="Lưu tên"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="folder-name" title={sub.subjName}>
                          {sub.subjName}
                        </div>
                      )}
                    </div>
                    <div
                      className="folder-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="btn-icon"
                        title="Đổi tên"
                        onClick={(e) => handleRenameSubjClick(e, sub)}
                      >
                        <Edit2 />
                      </button>
                      <button
                        className="btn-icon delete"
                        title="Xóa thư mục"
                        onClick={(e) => handleDeleteSubject(e, sub.subjId)}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {currentSubjectId !== null && (
              <button
                className="btn-back-root"
                onClick={() => setCurrentSubjectId(null)}
              >
                <ArrowLeft size={16} /> Quay lại Root
              </button>
            )}
          </div>
        )}

        {/* ===== DOCUMENT GRID ===== */}
        <div className="doc-grid" style={{ marginTop: "20px" }}>
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
                  {editingDocId === doc.docId ? (
                    <div
                      className="rename-container"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        className="rename-input"
                        value={editingDocName}
                        onChange={(e) => setEditingDocName(e.target.value)}
                        onKeyDown={(e) => handleRenameKeyDown(e, doc.docId)}
                        autoFocus
                      />
                      <button
                        className="btn-rename-submit"
                        onClick={(e) => handleRenameSubmit(e, doc.docId)}
                        title="Lưu tên"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="doc-card-name" title={doc.docOriginalName}>
                      {doc.docOriginalName}
                    </div>
                  )}
                  {activeTab === "shared" ? (
                    <div className="doc-subject-tag">Được chia sẻ</div>
                  ) : (
                    <div className="doc-subject-tag">
                      {doc.subject?.subjName || "Chưa phân loại"}
                    </div>
                  )}
                  <div className="doc-card-footer">
                    <div className="doc-status">
                      <span className={`status-dot ${statusInfo.dotClass}`} />
                      <span className={`status-text ${statusInfo.textClass}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="doc-actions">
                      {activeTab === "mine" && (
                        <>
                          <button
                            className="btn-icon"
                            title="Di chuyển"
                            onClick={(e) => handleMoveClick(e, doc.docId)}
                          >
                            <MoveRight />
                          </button>
                          <button
                            className="btn-icon"
                            title="Đổi tên tài liệu"
                            onClick={(e) => handleRenameClick(e, doc)}
                          >
                            <Edit2 />
                          </button>
                          <button
                            className="btn-icon"
                            title="Chia sẻ tài liệu"
                            onClick={(e) => handleShareClick(e, doc.docId)}
                          >
                            <Share2 />
                          </button>
                        </>
                      )}
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
                {activeTab === "mine" ? <FileText /> : <Share2 />}
              </div>
              {activeTab === "mine" ? (
                <>
                  <h3>Chưa có tài liệu nào</h3>
                  <p>
                    Tải lên file PDF đầu tiên của bạn để bắt đầu học tập cùng AI
                  </p>
                  <button
                    className="btn-empty-upload"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Tải lên ngay
                  </button>
                </>
              ) : (
                <>
                  <h3>Chưa có tài liệu được chia sẻ</h3>
                  <p>
                    Khi ai đó chia sẻ tài liệu với bạn, chúng sẽ xuất hiện ở đây
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* ===== CREATE FOLDER MODAL ===== */}
        {isCreateFolderModalOpen && (
          <div
            className="share-modal-overlay"
            onClick={() => setIsCreateFolderModalOpen(false)}
          >
            <div
              className="share-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="share-modal-header">
                <h3>Tạo thư mục mới</h3>
                <button
                  className="share-modal-close"
                  onClick={() => setIsCreateFolderModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="share-modal-body">
                <div className="share-input-group">
                  <input
                    type="text"
                    className="share-email-input"
                    placeholder="Tên thư mục..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateSubject();
                    }}
                    autoFocus
                  />
                  <button
                    className="btn-share-send"
                    onClick={handleCreateSubject}
                    disabled={!newFolderName}
                  >
                    Tạo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== MOVE DOCUMENT MODAL ===== */}
        {isMoveModalOpen && (
          <div
            className="share-modal-overlay"
            onClick={() => setIsMoveModalOpen(false)}
          >
            <div
              className="share-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="share-modal-header">
                <h3>Di chuyển tài liệu</h3>
                <button
                  className="share-modal-close"
                  onClick={() => setIsMoveModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="share-modal-body">
                <div className="move-options">
                  <div
                    className="move-option"
                    onClick={() => handleMoveSubmit(null)}
                  >
                    <FolderOpen size={18} /> Thư mục gốc (Root)
                  </div>
                  {subjects.map((sub) => (
                    <div
                      key={sub.subjId}
                      className="move-option"
                      onClick={() => handleMoveSubmit(sub.subjId)}
                    >
                      <Folder fill="#facc15" color="#ca8a04" size={18} />{" "}
                      {sub.subjName}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== SHARE MODAL ===== */}
        {isShareModalOpen && (
          <div
            className="share-modal-overlay"
            onClick={() => setIsShareModalOpen(false)}
          >
            <div
              className="share-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="share-modal-header">
                <h3>
                  Chia sẻ "
                  {documents.find((d) => d.docId === shareDocId)
                    ?.docOriginalName || "Tài liệu"}
                  "
                </h3>
                <button
                  className="share-modal-close"
                  onClick={() => setIsShareModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="share-modal-body">
                <div className="share-input-group">
                  <input
                    type="email"
                    className="share-email-input"
                    placeholder="Thêm người bằng email..."
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleShareSubmit();
                    }}
                  />
                  <button
                    className="btn-share-send"
                    onClick={handleShareSubmit}
                    disabled={isSharing || !shareEmail}
                  >
                    {isSharing ? "Đang gửi..." : "Gửi"}
                  </button>
                </div>
                {shareMessage && (
                  <div
                    style={{
                      marginTop: "12px",
                      fontSize: "14px",
                      color: shareMessage.includes("Lỗi")
                        ? "#ef4444"
                        : "#10b981",
                    }}
                  >
                    {shareMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
