import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api/auth.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      if (authAPI.isAuthenticated()) {
        const currentUser = authAPI.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setUserProfile(currentUser);
          
          // Optionally refresh user data from server
          try {
            const refreshedUser = await authAPI.refreshUser();
            setUser(refreshedUser);
            setUserProfile(refreshedUser);
          } catch (refreshError) {
            console.warn('Failed to refresh user data:', refreshError);
            // Keep using cached user data if refresh fails
          }
        }
      }
    } catch (error) {
      console.error('Auth state check error:', error);
      // Clear invalid auth state
      await authAPI.logout();
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const result = await authAPI.login(email, password);
      setUser(result.user);
      setUserProfile(result.user);
      toast.success('Login successful!');
      return { user: result.user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const result = await authAPI.register(userData);
      setUser(result.user);
      setUserProfile(result.user);
      toast.success('Registration successful!');
      return { user: result.user };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setUserProfile(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return userProfile?.role === 'admin';
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!(user && userProfile && authAPI.isAuthenticated());
  };

  // Update user profile
  const updateUserProfile = (updatedProfile) => {
    setUser(updatedProfile);
    setUserProfile(updatedProfile);
    // Profile is now managed by MongoDB backend, no localStorage needed
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!userProfile) return false;
    if (isAdmin()) return true; // Admins have all permissions
    
    // Add specific permission logic here if needed
    return false;
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
    isAdmin,
    isAuthenticated,
    hasPermission,
    // Remove Firebase-related props
    useFirebase: false // Always false now
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};