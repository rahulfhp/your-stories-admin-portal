import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yourhourapp.com/api/v1/';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('admin/login', { email, password });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw new Error('Network error. Please try again.');
    }
  },
  
  logout: async () => {
    try {
      const response = await api.post('admin/logout');
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Logout failed');
      }
      throw new Error('Network error. Please try again.');
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('admin/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to send OTP');
      }
      throw new Error('Network error. Please try again.');
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    try {
      const response = await api.post('admin/verify-otp', { email, otp });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'OTP verification failed');
      }
      throw new Error('Network error. Please try again.');
    }
  },

  resetPassword: async (email: string, newPassword: string) => {
    try {
      const response = await api.post('admin/reset-password', { email, newPassword });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Password reset failed');
      }
      throw new Error('Network error. Please try again.');
    }
  },
  changePassword: async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => {
    try {
      const response = await api.put('admin/change-password', { oldPassword, newPassword });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to change password');
      }
      throw new Error('Network error. Please try again.');
    }
  },
};

export default api;