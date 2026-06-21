import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9090/api/v1',
});

// Interceptor: tự động gắn JWT token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: nếu nhận 401, xóa token và reload về trang login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const loginApi = (data) => api.post('/auth/login', data);
export const registerApi = (data) => api.post('/auth/register', data);

// ===== DOCUMENTS =====\
export const getDocumentsForAdmin = () => api.get('/documents/admin');
export const getDocuments = () => api.get('/documents');
export const uploadDocument = (formData) => api.post('/documents', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteDocument = (id) => api.delete(`/documents/${id}`);
export const getDocumentViewUrl = (id) => api.get(`/documents/${id}/url`);
export const getFileByAccountId = (accountId) => api.get(`/documents/getfile/${accountId}`);
// ===== SUBJECTS =====
export const getSubjects = () => api.get('/subjects');

// ===== CHAT =====
export const getOrCreateChatSession = (docId) => api.post(`/chat/sessions?docId=${docId}`);
export const sendChatMessage = (sessionId, message) => api.post(`/chat/sessions/${sessionId}/messages`, { docId: null, message });

// ===== ACCOUNT =====

// ===== ACCOUNT =====

export const getUserById = (id) => api.get(`/account/getuser/${id}`);

export const getAllUsers = (params) => api.get('/account/getalluser', { params });

export const deleteUserById = (id) => api.delete(`/account/deleteuser/${id}`);

export const searchAccount = (name, page = 0, size = 5) =>
  api.get('/account/search', {
    params: {
      name,
      page,
      size
    }
  });
// ===== USERPROFILE =====
export const getUserProfileApi = (accountId) => api.get(`/user-profile/${accountId}`);
export default api;
