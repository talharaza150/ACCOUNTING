import { defineStore } from 'pinia';
import axios from 'axios';

const API_BASE = '/api';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'client';
  first_name: string;
  last_name: string;
  phone?: string;
  company_name?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isClient: (state) => state.user?.role === 'client',
    fullName: (state) => state.user ? `${state.user.first_name} ${state.user.last_name}` : ''
  },

  actions: {
    async login(username: string, password: string) {
      this.loading = true;
      try {
        const response = await axios.post(`${API_BASE}/auth/login`, {
          username,
          password
        });

        const { token, user } = response.data;
        
        this.token = token;
        this.user = user;
        this.isAuthenticated = true;

        localStorage.setItem('token', token);
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return { success: true };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.response?.data?.error || 'Login failed' 
        };
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        if (this.token) {
          await axios.post(`${API_BASE}/auth/logout`);
        }
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    },

    async checkAuth() {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get(`${API_BASE}/auth/me`);
        
        this.token = token;
        this.user = response.data.user;
        this.isAuthenticated = true;
        return true;
      } catch (error) {
        this.logout();
        return false;
      }
    }
  }
});