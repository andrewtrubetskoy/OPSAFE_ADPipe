import { create } from 'zustand';
import { authApi, adminApi } from '../services/api';

const savedToken = localStorage.getItem('adpipe_jwt_token');

export const useAuthStore = create((set, get) => ({
  user: savedToken ? { username: 'admin', role: 'admin' } : null,
  token: savedToken || null,
  isAuthenticated: !!savedToken,
  usersList: [],
  authError: null,

  login: async (username, password) => {
    try {
      const data = await authApi.login(username, password);
      localStorage.setItem('adpipe_jwt_token', data.token);
      set({
        user: { id: data.id, username: data.username, role: data.role },
        token: data.token,
        isAuthenticated: true,
        authError: null,
      });
      get().fetchUsers();
      return true;
    } catch (err) {
      const message = err.response?.data || err.message || 'Помилка авторизації';
      set({ authError: typeof message === 'string' ? message : 'Невірний логін або пароль' });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('adpipe_jwt_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchUsers: async () => {
    try {
      const users = await adminApi.getUsers();
      set({ usersList: users });
    } catch (err) {
      console.warn('Could not fetch users list:', err);
    }
  },

  addUser: async (username, password, role = 'USER') => {
    try {
      const newUser = await adminApi.createUser(username, password, role);
      set((state) => ({ usersList: [...state.usersList, newUser] }));
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  },

  deleteUser: async (id) => {
    try {
      await adminApi.deleteUser(id);
      set((state) => ({ usersList: state.usersList.filter((u) => u.id !== id) }));
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  },
}));
