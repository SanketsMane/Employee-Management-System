// User preferences service - stores preferences in MongoDB instead of localStorage
import { apiClient } from './api/client.js';

class UserPreferencesService {
  constructor() {
    this.cache = new Map(); // In-memory cache for better performance
  }

  // Get user preference from MongoDB
  async getPreference(key, defaultValue = null) {
    try {
      // First check cache
      const cacheKey = `${this.getCurrentUserId()}_${key}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Fetch from backend
      const response = await apiClient.get(`/users/preferences/${key}`);
      if (response.success && response.data) {
        this.cache.set(cacheKey, response.data.value);
        return response.data.value;
      }
      
      return defaultValue;
    } catch (error) {
      console.warn(`Failed to get preference ${key}:`, error);
      return defaultValue;
    }
  }

  // Set user preference in MongoDB
  async setPreference(key, value) {
    try {
      const cacheKey = `${this.getCurrentUserId()}_${key}`;
      
      // Update cache first for immediate response
      this.cache.set(cacheKey, value);
      
      // Save to backend
      const response = await apiClient.post('/users/preferences', {
        key,
        value
      });
      
      return response.success;
    } catch (error) {
      console.error(`Failed to set preference ${key}:`, error);
      // Remove from cache if save failed
      const cacheKey = `${this.getCurrentUserId()}_${key}`;
      this.cache.delete(cacheKey);
      return false;
    }
  }

  // Remove preference
  async removePreference(key) {
    try {
      const cacheKey = `${this.getCurrentUserId()}_${key}`;
      this.cache.delete(cacheKey);
      
      const response = await apiClient.delete(`/users/preferences/${key}`);
      return response.success;
    } catch (error) {
      console.error(`Failed to remove preference ${key}:`, error);
      return false;
    }
  }

  // Clear all preferences for current user
  async clearPreferences() {
    try {
      const userId = this.getCurrentUserId();
      
      // Clear cache for this user
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${userId}_`)) {
          this.cache.delete(key);
        }
      }
      
      const response = await apiClient.delete('/users/preferences');
      return response.success;
    } catch (error) {
      console.error('Failed to clear preferences:', error);
      return false;
    }
  }

  // Get current user ID for cache keying
  getCurrentUserId() {
    try {
      const token = localStorage.getItem('ems_auth_token');
      if (!token) return 'anonymous';
      
      // Decode JWT to get user ID (simple decode, not verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || 'anonymous';
    } catch (error) {
      return 'anonymous';
    }
  }

  // Sync localStorage data to MongoDB (migration helper)
  async migrateFromLocalStorage() {
    try {
      let migratedCount = 0;
      
      // Common localStorage keys to migrate
      const keysToMigrate = [
        'darkMode',
        'formonex-splash-seen',
        'sidebarCollapsed',
        'dashboardLayout',
        'notificationSettings'
      ];
      
      for (const key of keysToMigrate) {
        const value = localStorage.getItem(key);
        if (value !== null) {
          try {
            // Try to parse as JSON, fallback to string
            const parsedValue = JSON.parse(value);
            await this.setPreference(key, parsedValue);
            localStorage.removeItem(key); // Remove after successful migration
            migratedCount++;
          } catch (parseError) {
            // If JSON parse fails, store as string
            await this.setPreference(key, value);
            localStorage.removeItem(key);
            migratedCount++;
          }
        }
      }
      
      console.log(`Migrated ${migratedCount} preferences from localStorage to MongoDB`);
      return migratedCount;
    } catch (error) {
      console.error('Failed to migrate localStorage data:', error);
      return 0;
    }
  }
}

// Create singleton instance
export const userPreferences = new UserPreferencesService();

// Export class for custom instances if needed
export default UserPreferencesService;
