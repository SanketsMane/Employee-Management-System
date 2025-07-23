// Theme Context for dark/light mode - Now using MongoDB backend
import { createContext, useContext, useEffect, useState } from 'react';
import { userPreferences } from '../services/userPreferences.js';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load theme preference from MongoDB on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        // First check if user is authenticated
        const token = localStorage.getItem('ems_auth_token');
        if (token) {
          // User is authenticated, load from MongoDB
          const savedTheme = await userPreferences.getPreference('darkMode', false);
          setDarkMode(savedTheme);
        } else {
          // User not authenticated, check system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setDarkMode(prefersDark);
        }
      } catch (error) {
        console.warn('Failed to load theme preference, using system default:', error);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
      } finally {
        setLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (loading) return; // Don't apply theme while loading
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode, loading]);

  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Save preference to MongoDB if user is authenticated
    try {
      const token = localStorage.getItem('ems_auth_token');
      if (token) {
        await userPreferences.setPreference('darkMode', newDarkMode);
      }
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  const value = {
    darkMode,
    toggleDarkMode,
    loading
  };

  // Show loading state briefly while theme loads
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
