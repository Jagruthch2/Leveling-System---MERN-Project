import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication service
export const authService = {
  // Register new user
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      if (response.data.success && response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // Login user
  login: async (userData) => {
    try {
      const response = await api.post('/auth/login', userData);
      if (response.data.success && response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      if (!user || user === 'undefined' || user === 'null') {
        return null;
      }
      return JSON.parse(user);
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      // Clean up invalid data
      localStorage.removeItem('user');
      return null;
    }
  },

  // Get token
  getToken: () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
      return null;
    }
    return token;
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      // If token is invalid, remove it
      authService.logout();
      throw error.response?.data || { message: 'Token verification failed' };
    }
  },
};

export default api;
