import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  FileText,
  HardDrive,
  Cpu,
  ShieldAlert,
  Trash2,
  Search,
  CheckCircle,
  MessageSquare,
  Calendar,
  User,
  LogOut,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  getAllUsers,
  searchAccount,
  getDocumentsForAdmin,
  deleteDocument,
  deleteUserById,
  getAllChatSessionsForAdmin,
  deleteChatSessionApi,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "./AdminPage.css";

function AdminPage() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const [filesList, setFilesList] = useState([]);
  const [userMeta, setUserMeta] = useState({ page: 1, pageSize: 5, total: 0 });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    totalStorageUsed: 0,
    totalApiCalls: 0,
  });

  // Mock data Users
  const [usersList, setUsersList] = useState([
    {
      accountId: 1,
      accountName: "hoa_pham",
      email: "hoa.pham@uth.edu.vn",
      role: "USER",
      totalStorageUsed: 524288000,
      totalApiCalls: 142,
    },
    {
      accountId: 2,
      accountName: "nguyen_van_a",
      email: "vana@gmail.com",
      role: "USER",
      totalStorageUsed: 15728640,
      totalApiCalls: 28,
    },
    {
      accountId: 3,
      accountName: "admin_studyhub",
      email: "admin@studyhub.com",
      role: "ADMIN",
      totalStorageUsed: 0,
      totalApiCalls: 5,
    },
  ]);

  // BỔ SUNG 1: State và Mock Data cho Chat Sessions để không bị trắng màn hình
  const [chatSessionsList, setChatSessionsList] = useState([
    {
      sessionId: 101,
      sessionTitle: "Giải bài tập toán giải tích 1",
      username: "hoa_pham",
      docName: "giai_tich_chương2.pdf",
      createdAt: "2026-06-25T14:30:00Z",
    },
    {
      sessionId: 102,
      sessionTitle: "Hỏi đáp về luật doanh nghiệp",
      username: "nguyen_van_a",
      docName: "LuatDoanhNghiep2020.docx",
      createdAt: "2026-06-28T09:15:00Z",
    },
  ]);

  // 1. Fetch danh sách User
  const fetchUsersData = useCallback(async (page = 0, size = 5) => {
    try {
      const res = await getAllUsers({ page, size });
      if (res?.data?.data?.result) {
        const users = res.data.data.result;
        setUsersList(users);
        setUserMeta({
          page: res.data.data.meta.page,
          pageSize: res.data.data.meta.pageSize,
          total: res.data.data.meta.total,
        });

        // Tính tổng storage từ tất cả users
        const totalStorage = users.reduce(
          (sum, user) => sum + (user.totalStorageUsed || 0),
          0,
        );

        setStats((prev) => ({
          ...prev,
          totalUsers: res.data.data.meta.total,
          totalStorageUsed: totalStorage,
        }));
      } else {
        setUsersList([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách user:", error);
      setUsersList([]);
    }
  }, []);

  // 2. Fetch danh sách toàn bộ Files hệ thống
  const fetchFilesData = useCallback(async () => {
    try {
      const res = await getDocumentsForAdmin();
      if (res?.data) {
        let docs =
          res.data?.data?.result ||
          res.data?.data ||
          res.data?.result ||
          res.data;
        if (docs && typeof docs === "object" && !Array.isArray(docs)) {
          if (Array.isArray(docs.result)) docs = docs.result;
        }
        if (Array.isArray(docs)) {
          setFilesList(docs);
          setStats((prev) => ({ ...prev, totalFiles: docs.length }));
        } else {
          console.warn("Dữ liệu không đúng định dạng mảng:", docs);
          setFilesList([]);
        }
      } else {
        setFilesList([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài liệu toàn hệ thống:", error);
      setFilesList([]);
    }
  }, []);

  // Điều phối gọi dữ liệu khi Tab thay đổi
  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchUsersData(0, 5);
      fetchFilesData();
    } else if (activeTab === "users") {
      fetchUsersData(0, 5);
    } else if (activeTab === "files") {
      fetchFilesData();
    }
  }, [activeTab, fetchUsersData, fetchFilesData]);

  // Debounce cho tìm kiếm User
  useEffect(() => {
    if (activeTab !== "users") return;

    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() !== "") {
        try {
          const res = await searchAccount(searchQuery, 0, 5);
          if (res?.data?.data?.result) {
            setUsersList(res.data.data.result);
            setUserMeta({
              page: res.data.data.meta.page,
              pageSize: res.data.data.meta.pageSize,
              total: res.data.data.meta.total,
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
      title: "Bạn có chắc chắn?",
      text: `Muốn xóa tài khoản #${accountId} này không? Hành động này không thể hoàn tác!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Đồng ý, Xóa!",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteUserById(accountId);
        if (res) {
          Swal.fire({
            title: "Đã xóa!",
            text: "Xóa tài khoản thành công.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });

          if (searchQuery) {
            setSearchQuery("");
          } else {
            const currentPage = userMeta.page > 0 ? userMeta.page - 1 : 0;
            fetchUsersData(currentPage, 5);
          }
        }
      } catch (error) {
        Swal.fire({
          title: "Thất bại!",
          text: "Xóa tài khoản thất bại, vui lòng kiểm tra lại!",
          icon: "error",
        });
      }
    }
  };

  const handleDeleteDocumentReal = async (docId) => {
    const result = await Swal.fire({
      title: "Xóa vĩnh viễn?",
      text: `Bạn có chắc chắn muốn xóa tài liệu #${docId} này không?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa ngay!",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteDocument(docId);
        if (res) {
          Swal.fire({
            title: "Thành công!",
            text: "Tài liệu đã được xóa khỏi hệ thống.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchFilesData();
        }
      } catch (error) {
        Swal.fire({
          title: "Thất bại!",
          text: "Xóa tài liệu thất bại, vui lòng thử lại sau!",
          icon: "error",
        });
      }
    }
  };

  // BỔ SUNG 2: Định nghĩa hàm handleDeleteChatSession để không bị lỗi gọi hàm
  const handleDeleteChatSession = async (sessionId) => {
    const result = await Swal.fire({
      title: "Xóa phiên chat?",
      text: `Bạn có chắc muốn xóa lịch sử phiên chat #${sessionId} này không?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        // Gọi API xóa thật xuống backend
        const res = await deleteChatSessionApi(sessionId);
        if (res) {
          Swal.fire(
            "Đã xóa!",
            "Phiên trò chuyện đã được gỡ khỏi Database.",
            "success",
          );
          fetchChatSessionsData(); // Tải lại danh sách mới nhất từ DB
        }
      } catch (error) {
        Swal.fire(
          "Thất bại!",
          "Không thể xóa phiên chat này, vui lòng thử lại.",
          "error",
        );
      }
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredFiles = Array.isArray(filesList)
    ? filesList.filter((f) =>
        (f?.docOriginalName || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      )
    : [];

  // BỔ SUNG: Hàm fetch dữ liệu Chat Sessions thật từ DB
  const fetchChatSessionsData = useCallback(async () => {
    try {
      const res = await getAllChatSessionsForAdmin();
      // Kiểm tra cấu trúc bọc dữ liệu của Spring Boot (thường là res.data.data hoặc res.data.data.result)
      const chatData = res?.data?.data?.result || res?.data?.data || res?.data;

      if (Array.isArray(chatData)) {
        setChatSessionsList(chatData);
        let systemTotalCalls = 0;
        chatData.forEach((session) => {
          if (Array.isArray(session.messages)) {
            systemTotalCalls += session.messages.filter(
              (m) => m.role === "ai",
            ).length;
          }
        });

        // Cập nhật lên ô Card ở Dashboard
        setStats((prev) => ({ ...prev, totalApiCalls: systemTotalCalls }));
      } else {
        setChatSessionsList([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phiên chat từ DB:", error);
      setChatSessionsList([]); // Thất bại thì trả về mảng rỗng thay vì giữ data mock
    }
  }, []);

  // SỬA LẠI: Điều phối gọi dữ liệu khi Tab thay đổi
  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchUsersData(0, 5);
      fetchFilesData();
    } else if (activeTab === "users") {
      fetchUsersData(0, 5);
    } else if (activeTab === "files") {
      fetchFilesData();
    } else if (activeTab === "chat") {
      fetchChatSessionsData(); // <-- SỬA TẠI ĐÂY: Gọi hàm fetch dữ liệu thật thay vì để trống
    }
  }, [activeTab, fetchUsersData, fetchFilesData, fetchChatSessionsData]); // Thêm fetchChatSessionsData vào dependency

  const fetchAdminData = useCallback(async () => {
    try {
      // Gọi hàm handleGetAllUser từ hệ thống API phân trang của bạn
      const userRes = await getAllUsers(); // Đảm bảo hàm này mapping đúng vào endpoint /handleGetAllUser
      const userData =
        userRes?.data?.data?.result ||
        userRes?.data?.data ||
        userRes?.data ||
        [];

      if (Array.isArray(userData)) {
        setUsersList(userData); // Set thẳng danh sách mà không cần tính toán thủ công bằng JS ở FE nữa
      }

      // Tính toán tổng số API call toàn hệ thống cho ô Dashboard
      const totalSystemCalls = userData.reduce(
        (sum, u) => sum + (u.totalApiCalls || 0),
        0,
      );

      setStats((prev) => ({
        ...prev,
        totalUsers: userData.length,
        totalApiCalls: totalSystemCalls,
      }));
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu trang Admin:", error);
    }
  }, []);

  // Tự động gọi nạp dữ liệu khi component mount
  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  return (
    <div className="admin-container">
      {/* --- SIDEBAR --- */}
      <div className="admin-sidebar">
        <div className="sidebar-brand">
          <ShieldAlert size={24} className="brand-icon" />
          <span>StudyHub Admin</span>
        </div>
        <nav className="sidebar-menu">
          <button
            className={`menu-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("dashboard");
              setSearchQuery("");
            }}
          >
            <Cpu size={18} /> Tổng quan hệ thống
          </button>
          <button
            className={`menu-item ${activeTab === "users" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("users");
              setSearchQuery("");
            }}
          >
            <Users size={18} /> Quản lý người dùng
          </button>
          <button
            className={`menu-item ${activeTab === "files" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("files");
              setSearchQuery("");
            }}
          >
            <FileText size={18} /> Quản lý tài liệu
          </button>
          <button
            className={`menu-item ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("chat");
              setSearchQuery("");
            }}
          >
            <MessageSquare size={18} /> Giám sát Chat AI
          </button>
        </nav>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="admin-main">
        <header className="admin-header">
          <h2>
            {activeTab === "dashboard" && "Bảng Điều Khiển Hệ Thống"}
            {activeTab === "users" && "Quản Lý Người Dùng"}
            {activeTab === "files" && "Kho Lưu Trữ Toàn Hệ Thống"}
            {activeTab === "chat" && "Giám Sát & Kiểm Toán Chat AI"}
          </h2>
          <button
            className="btn-logout"
            onClick={logout}
            title="Đăng xuất"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1.2rem",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#dc2626")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#ef4444")
            }
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </header>

        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon u-bg">
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <label>Tổng thành viên</label>
                  <p>{stats.totalUsers} người</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon f-bg">
                  <FileText size={24} />
                </div>
                <div className="stat-info">
                  <label>Tổng file tải lên</label>
                  <p>{stats.totalFiles} tài liệu</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon s-bg">
                  <HardDrive size={24} />
                </div>
                <div className="stat-info">
                  <label>Dung lượng hệ thống</label>
                  <p>{formatBytes(stats.totalStorageUsed)}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon a-bg">
                  <Cpu size={24} />
                </div>
                <div className="stat-info">
                  <label>API Calls (AI)</label>
                  <p>{stats.totalApiCalls} lượt</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUẢN LÝ USER */}
        {activeTab === "users" && (
          <div className="table-wrapper">
            <div className="admin-search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Tìm theo tên tài khoản..."
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
                  <th>Lưu trữ cá nhân</th>
                  <th>API Calls (AI)</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(usersList) && usersList.length > 0 ? (
                  usersList.map((u) => (
                    <tr key={u.accountId}>
                      <td>#{u.accountId}</td>
                      <td>
                        <strong>{u.accountName}</strong>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-tag ${u.role}`}>{u.role}</span>
                      </td>
                      <td>
                        <span className="user-storage-text">
                          {formatBytes(u.totalStorageUsed)}
                        </span>
                      </td>
                      <td>
                        <span className="user-api-badge">
                          {u.totalApiCalls || 0} lượt
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-delete-action"
                          onClick={() => handleDeleteUserAction(u.accountId)}
                        >
                          <Trash2 size={14} /> Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "#888",
                      }}
                    >
                      Không tìm thấy tài khoản nào phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: QUẢN LÝ FILE */}
        {activeTab === "files" && (
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
                  filteredFiles.map((f) => (
                    <tr key={f.docId}>
                      <td>#{f.docId}</td>
                      <td className="file-name-cell" title={f.docOriginalName}>
                        {f.docOriginalName}
                      </td>
                      <td>
                        <span className={`status-tag completed`}>
                          <CheckCircle size={12} /> Thành công
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-delete-action"
                          onClick={() => handleDeleteDocumentReal(f.docId)}
                        >
                          <Trash2 size={14} /> Xóa thật
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "#888",
                      }}
                    >
                      Không có tài liệu nào hiển thị hoặc không tìm thấy kết quả
                      phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: GIÁM SÁT CHAT AI */}
        {activeTab === "chat" && (
          <div className="table-wrapper">
            <div className="chat-audit-info-bar">
              <p>
                💡 <strong>Mẹo quản trị:</strong> Admin có quyền kiểm tra và xóa
                mềm các phiên chat tiêu tốn quá nhiều Token hoặc có nội dung
                tiêu cực (Spam/Toxic).
              </p>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID Phiên</th>
                  <th>Tiêu đề / Ngữ cảnh</th>
                  <th>Người sử dụng</th>
                  <th>Tài liệu đính kèm</th>
                  <th>Số API Call (AI)</th>
                  <th>Thời gian tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {chatSessionsList.length > 0 ? (
                  chatSessionsList.map((session) => {
                    // Tách chuỗi từ sessionTitle nếu có dạng "Chat với [Tên_File] (User: [ID])"
                    const titleRaw = session.sessionTitle || "";

                    // Trích xuất tên file (nằm sau chữ "Chat với " và trước dấu " (User:")
                    let detectedDoc = "Không đính kèm file";
                    if (titleRaw.includes("Chat với ")) {
                      detectedDoc =
                        titleRaw.split("Chat với ")[1]?.split(" (User:")[0] ||
                        "Không đính kèm file";
                    }

                    // Trích xuất thông tin User ID từ chuỗi
                    let detectedUser = "Ẩn danh";
                    if (titleRaw.includes("(User: ")) {
                      detectedUser =
                        "ID: " + titleRaw.split("(User: ")[1]?.replace(")", "");
                    } else if (titleRaw.includes("(User:")) {
                      detectedUser =
                        "ID: " + titleRaw.split("(User:")[1]?.replace(")", "");
                    }

                    // Ưu tiên dùng Object lồng từ DB, nếu không có thì dùng đồ "bóc tách" ở trên
                    const displayUser =
                      session.account?.accountName ||
                      session.accountName ||
                      detectedUser;
                    const displayDoc =
                      session.document?.docOriginalName ||
                      session.docOriginalName ||
                      detectedDoc;

                    const aiCallCount = Array.isArray(session.messages)
                      ? session.messages.filter((msg) => msg.role === "ai")
                          .length
                      : 0;

                    return (
                      <tr key={session.sessionId}>
                        <td>#{session.sessionId}</td>
                        <td>
                          <div className="chat-title-cell">
                            <MessageSquare size={14} className="inline-icon" />
                            {/* Hiển thị tiêu đề ngắn gọn hoặc giữ nguyên tùy bạn */}
                            <strong>
                              {session.sessionTitle ||
                                "Trò chuyện không tiêu đề"}
                            </strong>
                          </div>
                        </td>
                        <td>
                          <span className="chat-user-info">
                            <User size={14} className="inline-icon" />{" "}
                            {displayUser}
                          </span>
                        </td>
                        <td className="file-name-cell" title={displayDoc}>
                          {displayDoc}
                        </td>
                        <td>
                          <span className="user-api-badge">
                            {aiCallCount} lượt
                          </span>
                        </td>
                        <td>
                          <span className="chat-time-info">
                            <Calendar size={14} className="inline-icon" />{" "}
                            {String(session.createdAt || "").substring(0, 10)}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-delete-action"
                            onClick={() =>
                              handleDeleteChatSession(session.sessionId)
                            }
                          >
                            <Trash2 size={14} /> Xóa phiên
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "#888",
                      }}
                    >
                      Không tìm thấy phiên chat AI nào trên hệ thống
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
