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

// ===== DOCUMENTS =====
export const getDocumentsForAdmin = () => api.get('/documents/admin');
export const getDocuments = () => api.get('/documents');
export const uploadDocument = (file, subjectId) => {
  const formData = new FormData();
  formData.append('file', file);
  if (subjectId) {
    formData.append('subjectId', subjectId);
  }
  return api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteDocument = (id) => api.delete(`/documents/${id}`);
export const getDocumentViewUrl = (id) => api.get(`/documents/${id}/url`);
export const renameDocument = (id, newName) => api.put(`/documents/${id}/rename`, { newName });
export const moveDocument = (id, subjectId) => api.put(`/documents/${id}/move`, { subjectId });
export const shareDocument = (data) => api.post('/documents/share', data);
export const getSharedDocuments = () => api.get('/documents/sharedWithMe');
export const getFileByAccountId = (accountId) => api.get(`/documents/getFile/${accountId}`);

// ===== SUBJECTS =====
export const getSubjects = () => api.get('/subjects');
export const createSubject = (name) => api.post('/subjects', { name });
export const renameSubject = (id, name) => api.put(`/subjects/${id}/rename`, { name });
export const deleteSubject = (id) => api.delete(`/subjects/${id}`);

// ===== CHAT =====
export const getOrCreateChatSession = (docId) => api.post(`/chat/sessions?docId=${docId}`);
export const sendChatMessage = (sessionId, message) => api.post(`/chat/sessions/${sessionId}/messages`, { docId: null, message });

export const getAllChatSessionsForAdmin = () => api.get('/chat/admin/sessions');
export const deleteChatSessionApi = (sessionId) => api.delete(`/chat/admin/sessions/${sessionId}`);

// ===== ACCOUNT =====

// ===== ACCOUNT =====

export const getUserById = (id) => api.get(`/account/getUser/${id}`);

export const getAllUsers = (params) => api.get('/account/getAllUser', { params });

export const deleteUserById = (id) => api.delete(`/account/deleteUser/${id}`);

export const searchAccount = (name, page = 0, size = 5) =>
  api.get('/account/search', {
    params: {
      name,
      page,
      size
    }
  });
// ===== USERPROFILE =====
export const getUserProfileApi = (accountId) => api.get(`/userProfile/${accountId}`);
export const updateUserProfileApi = (accountId, data) => api.put(`/userProfile/${accountId}`, data);
export default api;
