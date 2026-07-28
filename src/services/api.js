import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT Bearer token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adpipe_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authApi = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const adminApi = {
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  createUser: async (username, password, role) => {
    const response = await api.post('/admin/users', { username, password, role });
    return response.data;
  },
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
};

export const schemeApi = {
  getSchemes: async () => {
    const response = await api.get('/schemes');
    return response.data;
  },
  createScheme: async (scheme) => {
    const response = await api.post('/schemes', scheme);
    return response.data;
  },
  updateScheme: async (id, scheme) => {
    const response = await api.put(`/schemes/${id}`, scheme);
    return response.data;
  },
  deleteScheme: async (id) => {
    const response = await api.delete(`/schemes/${id}`);
    return response.data;
  },
};

export const folderApi = {
  getFolders: async () => {
    const response = await api.get('/folders');
    return response.data;
  },
  createFolder: async (folder) => {
    const response = await api.post('/folders', folder);
    return response.data;
  },
  updateFolder: async (id, folder) => {
    const response = await api.put(`/folders/${id}`, folder);
    return response.data;
  },
  deleteFolder: async (id) => {
    const response = await api.delete(`/folders/${id}`);
    return response.data;
  },
};
