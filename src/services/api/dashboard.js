import { apiClient, API_ENDPOINTS } from './client.js';

export const dashboardAPI = {
  // Get dashboard data for current user
  async getDashboardData() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.users.dashboard);
      
      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      throw new Error(error.message || 'Failed to fetch dashboard data');
    }
  },

  // Get user's tasks
  async getUserTasks() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.users.tasks);
      
      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        throw new Error(response.message || 'Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Tasks fetch error:', error);
      throw new Error(error.message || 'Failed to fetch tasks');
    }
  },

  // Get user's attendance
  async getUserAttendance(month = null, year = null) {
    try {
      let endpoint = API_ENDPOINTS.users.attendance;
      if (month && year) {
        endpoint += `?month=${month}&year=${year}`;
      }
      
      const response = await apiClient.get(endpoint);
      
      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        throw new Error(response.message || 'Failed to fetch attendance');
      }
    } catch (error) {
      console.error('Attendance fetch error:', error);
      throw new Error(error.message || 'Failed to fetch attendance');
    }
  },

  // Check in attendance
  async checkIn(location = null) {
    try {
      const response = await apiClient.post('/attendance/checkin', {
        location: location
      });
      
      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        throw new Error(response.message || 'Failed to check in');
      }
    } catch (error) {
      console.error('Check in error:', error);
      throw new Error(error.message || 'Failed to check in');
    }
  },

  // Check out attendance
  async checkOut(location = null) {
    try {
      const response = await apiClient.post('/attendance/checkout', {
        location: location
      });
      
      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        throw new Error(response.message || 'Failed to check out');
      }
    } catch (error) {
      console.error('Check out error:', error);
      throw new Error(error.message || 'Failed to check out');
    }
  },

  // Update task status
  async updateTaskStatus(taskId, status, notes = '') {
    try {
      const response = await apiClient.put(`/tasks/${taskId}`, {
        status: status,
        notes: notes
      });
      
      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        throw new Error(response.message || 'Failed to update task');
      }
    } catch (error) {
      console.error('Task update error:', error);
      throw new Error(error.message || 'Failed to update task');
    }
  }
};

export default dashboardAPI;
