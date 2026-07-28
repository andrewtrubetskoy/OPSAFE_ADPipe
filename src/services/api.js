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

export const scriptLibraryApi = {
  getFolders: async () => {
    const response = await api.get('/script-folders');
    return response.data;
  },
  createFolder: async (folder) => {
    const response = await api.post('/script-folders', folder);
    return response.data;
  },
  deleteFolder: async (id) => {
    const response = await api.delete(`/script-folders/${id}`);
    return response.data;
  },
  moveFolder: async (id, parentId) => {
    const url = parentId ? `/script-folders/${id}/move?parentId=${parentId}` : `/script-folders/${id}/move`;
    const response = await api.put(url);
    return response.data;
  },
  getScripts: async () => {
    const response = await api.get('/scripts');
    return response.data;
  },
  createScript: async (script) => {
    const response = await api.post('/scripts', script);
    return response.data;
  },
  updateScript: async (script) => {
    const response = await api.post('/scripts', script);
    return response.data;
  },
  uploadScript: async (formData) => {
    const response = await api.post('/scripts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  moveScript: async (id, folderId) => {
    const url = folderId ? `/scripts/${id}/move?folderId=${folderId}` : `/scripts/${id}/move`;
    const response = await api.put(url);
    return response.data;
  },
  deleteScript: async (id) => {
    const response = await api.delete(`/scripts/${id}`);
    return response.data;
  },
};
