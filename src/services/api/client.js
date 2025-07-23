// API Configuration
export const API_CONFIG = {
  // Updated to use the MongoDB backend server
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
};

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me'
  },
  users: {
    list: '/users',
    profile: '/users/profile',
    update: '/users/update',
    dashboard: '/users/dashboard',
    tasks: '/users/tasks',
    attendance: '/users/attendance'
  },
  tasks: {
    list: '/tasks',
    create: '/tasks',
    update: '/tasks',
    delete: '/tasks'
  },
  attendance: {
    list: '/attendance',
    checkin: '/attendance/checkin',
    checkout: '/attendance/checkout'
  }
};

// HTTP client with error handling
class APIClient {
  constructor(config = API_CONFIG) {
    this.config = config;
  }

  async request(endpoint, options = {}) {
    const url = `${this.config.baseURL}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: {
        ...this.config.headers,
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('ems_auth_token');
    if (token && token !== 'null' && token !== 'undefined') {
      // Check for the specific problematic token and clear it immediately
      if (token.includes('eyJ1c2VySWQiOiI2ODczNTkwYmMxM2IxNTkxMGRmZjZmMjQi')) {
        console.warn('Detected problematic token in API client, clearing it');
        localStorage.removeItem('ems_auth_token');
        localStorage.removeItem('ems_current_user');
        window.location.reload();
        return;
      }
      
      console.log('Adding token to request:', token ? `${token.substring(0, 20)}...` : 'null');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No valid token found in localStorage');
      // Don't add Authorization header if token is invalid
    }

    console.debug('API Request:', { url, method: config.method, headers: config.headers });

    try {
      const response = await fetch(url, config);
      
      console.debug('API Response:', { status: response.status, ok: response.ok, url });
      
      // Handle rate limiting
      if (response.status === 429) {
        console.warn('Rate limit exceeded, preventing further requests');
        throw new Error('Too many requests. Please wait and try again.');
      }
      
      // Always try to parse the JSON response first
      const data = await response.json();
      
      if (!response.ok) {
        // Handle specific JWT signature errors
        if (data.code === 'INVALID_TOKEN_SIGNATURE') {
          console.warn('Invalid token signature detected, clearing auth data');
          localStorage.removeItem('ems_auth_token');
          localStorage.removeItem('ems_current_user');
          // Reload the page to trigger login
          window.location.reload();
          return;
        }
        
        // If it's not ok, but we have data, throw an error with the server's message
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      console.error('Request details:', { url, method: config.method });
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new APIClient();
