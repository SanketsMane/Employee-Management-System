// Authentication service using MongoDB backend API
import { apiClient } from './client.js';

const authAPI = {
  // Register new user (only employees can register, admin exists by default)
  async register(userData) {
    try {
      console.log('Registration data being sent:', userData);
      const response = await apiClient.post('/auth/register', userData);
      console.log('Registration response:', response);
      
      if (response.success) {
        // Store auth data
        localStorage.setItem('ems_auth_token', response.data.token);
        localStorage.setItem('ems_current_user', JSON.stringify(response.data.user));
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
        };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response);
      
      // If it's a fetch error, try to get more details
      if (error.message && error.message.includes('HTTP error')) {
        console.error('HTTP Status Error - this might be a server response error');
      }
      
      throw new Error(error.message || 'Registration failed');
    }
  },

  // Login user
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.success) {
        // Store auth data
        localStorage.setItem('ems_auth_token', response.data.token);
        localStorage.setItem('ems_current_user', JSON.stringify(response.data.user));
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
        };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  },

  // Logout user
  async logout() {
    try {
      const token = localStorage.getItem('ems_auth_token');
      if (token) {
        // Call logout endpoint to update user status
        await apiClient.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('ems_auth_token');
      localStorage.removeItem('ems_current_user');
    }
  },

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('ems_current_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Get current token
  getToken() {
    const token = localStorage.getItem('ems_auth_token');
    if (token && token !== 'null' && token !== 'undefined') {
      // Check for the specific problematic token and clear it
      if (token.includes('eyJ1c2VySWQiOiI2ODczNTkwYmMxM2IxNTkxMGRmZjZmMjQi')) {
        console.warn('Detected problematic token, clearing it automatically');
        localStorage.removeItem('ems_auth_token');
        localStorage.removeItem('ems_current_user');
        window.location.reload();
        return null;
      }
      
      // Basic validation - check if token has proper JWT structure
      if (token.split('.').length !== 3) {
        console.error('Token appears to be malformed, clearing it:', token);
        localStorage.removeItem('ems_auth_token');
        localStorage.removeItem('ems_current_user');
        return null;
      }
      return token;
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  },

  // Refresh user data from server
  async refreshUser() {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No auth token found');

      const response = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Refresh user response:', response);

      if (response.success) {
        localStorage.setItem('ems_current_user', JSON.stringify(response.data.user));
        return response.data.user;
      } else {
        throw new Error('Failed to refresh user data');
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If refresh fails due to token issues, clear everything and don't reload here
      // (the API client will handle the reload if it's a signature issue)
      if (!error.message.includes('Invalid token signature')) {
        this.logout();
      }
      throw error;
    }
  },

  // Clear invalid tokens (useful for manual cleanup)
  clearAuthData() {
    localStorage.removeItem('ems_auth_token');
    localStorage.removeItem('ems_current_user');
    console.log('Auth data cleared');
  }
};

export { authAPI };

// Global debug utilities - can be called from browser console
window.clearEMSAuth = () => {
  localStorage.removeItem('ems_auth_token');
  localStorage.removeItem('ems_current_user');
  console.log('EMS auth data cleared! Please refresh the page.');
  window.location.reload();
};

window.checkEMSToken = () => {
  const token = localStorage.getItem('ems_auth_token');
  console.log('Current token:', token);
  if (token && token.includes('eyJ1c2VySWQiOiI2ODczNTkwYmMxM2IxNTkxMGRmZjZmMjQi')) {
    console.warn('⚠️  This is the problematic token!');
    return 'PROBLEMATIC_TOKEN';
  }
  return token ? 'VALID_FORMAT' : 'NO_TOKEN';
};
