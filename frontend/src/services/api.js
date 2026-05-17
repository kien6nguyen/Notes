import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (email, password) => api.post('/login', { email, password }),
  register: (name, email, password) => api.post('/register', { name, email, password }),
  forgotPassword: (email) => api.post('/forgot-password', { email }),
  resetPassword: (email, otp, password) => api.post('/reset-password', { email, otp, password }),
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return api.post('/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put('/profile', data);
  },
  logout: () => api.post('/logout')
};

export const noteService = {
  getNotes: (search = '') => api.get(`/notes?search=${search}`),
  createNote: (data) => api.post('/notes', data),
  getNote: (id) => api.get(`/notes/${id}`),
  updateNote: (id, data) => api.put(`/notes/${id}`, data),
  deleteNote: (id) => api.delete(`/notes/${id}`),
  unlockNote: (id, password) => api.post(`/notes/${id}/unlock`, { password }),
  changeNotePassword: (id, currentPassword, newPassword) =>
    api.post(`/notes/${id}/change-password`, { current_password: currentPassword, new_password: newPassword }),
  uploadAttachment: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/notes/upload-attachment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const shareService = {
  shareNote: (noteId, email, permission) => api.post(`/notes/${noteId}/share`, { email, permission }),
  unshareNote: (noteId, userId) => api.delete(`/notes/${noteId}/share/${userId}`),
  getShares: (noteId) => api.get(`/notes/${noteId}/shares`),
  getSharedWithMe: () => api.get('/shared-notes'),
};

export const labelService = {
  getLabels: () => api.get('/labels'),
  createLabel: (data) => api.post('/labels', data),
  updateLabel: (id, data) => api.put(`/labels/${id}`, data),
  deleteLabel: (id) => api.delete(`/labels/${id}`)
};

export default api;
