import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AuthService from '../services/authService';
import DatabaseService from '../services/databaseService';

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
  const [useFirebase, setUseFirebase] = useState(false); // Toggle for Firebase vs Demo mode

  useEffect(() => {
    // Check if we should use Firebase authentication
    const shouldUseFirebase = localStorage.getItem('useFirebase') === 'true';
    setUseFirebase(shouldUseFirebase);

    if (shouldUseFirebase) {
      // Firebase authentication
      const unsubscribe = AuthService.onAuthStateChanged(({ user, userProfile }) => {
        setUser(user);
        setUserProfile(userProfile);
        setLoading(false);
      });

      return unsubscribe;
    } else {
      // Demo mode - check for demo user in localStorage
      const demoUser = localStorage.getItem('demoUser');
      const demoProfile = localStorage.getItem('demoProfile');
      
      if (demoUser && demoProfile) {
        try {
          const parsedUser = JSON.parse(demoUser);
          const parsedProfile = JSON.parse(demoProfile);
          setUser(parsedUser);
          setUserProfile(parsedProfile);
        } catch (error) {
          console.error('Error parsing demo user data:', error);
          localStorage.removeItem('demoUser');
          localStorage.removeItem('demoProfile');
        }
      }
      
      setLoading(false);
    }
  }, [useFirebase]);

  // Enhanced login with Firebase or Demo mode
  const login = async (email, password, demoUserData = null) => {
    try {
      if (useFirebase && !demoUserData) {
        // Firebase authentication
        const { user, userProfile } = await AuthService.signIn(email, password);
        setUser(user);
        setUserProfile(userProfile);
        toast.success('Login successful!');
        return { user };
      } else {
        // Demo mode authentication
        if (demoUserData) {
          const mockUser = {
            uid: `demo_${demoUserData.role}_${Date.now()}`,
            email: demoUserData.email,
            displayName: demoUserData.name,
            role: demoUserData.role
          };
          
          const mockProfile = {
            uid: mockUser.uid,
            email: mockUser.email,
            displayName: mockUser.displayName,
            role: mockUser.role,
            department: mockUser.role === 'admin' ? 'Administration' : 'Development',
            position: mockUser.role === 'admin' ? 'System Administrator' : 'Software Developer',
            phone: '+1234567890',
            status: 'active',
            joinDate: new Date(),
            createdAt: new Date(),
            lastLogin: new Date(),
            permissions: mockUser.role === 'admin' ? ['all'] : ['read', 'write'],
            avatar: null,
            bio: `Demo ${mockUser.role} user`,
            skills: mockUser.role === 'admin' ? ['Administration', 'Management'] : ['JavaScript', 'React'],
            lastActivity: new Date(),
            isOnline: true
          };

          setUser(mockUser);
          setUserProfile(mockProfile);
          
          // Store in localStorage for persistence
          localStorage.setItem('demoUser', JSON.stringify(mockUser));
          localStorage.setItem('demoProfile', JSON.stringify(mockProfile));
          
          toast.success('Demo login successful!');
          return { user: mockUser };
        }

        // For non-demo login in demo mode
        throw new Error('Demo mode: Please use the demo login buttons or enable Firebase authentication.');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (useFirebase && user) {
        await AuthService.signOut(user.uid);
      } else {
        // Demo mode - clear localStorage
        localStorage.removeItem('demoUser');
        localStorage.removeItem('demoProfile');
      }
      
      setUser(null);
      setUserProfile(null);
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  // Toggle between Firebase and Demo mode
  const toggleAuthMode = () => {
    const newMode = !useFirebase;
    setUseFirebase(newMode);
    localStorage.setItem('useFirebase', newMode.toString());
    
    // Clear current auth state
    setUser(null);
    setUserProfile(null);
    localStorage.removeItem('demoUser');
    localStorage.removeItem('demoProfile');
    
    toast.success(`Switched to ${newMode ? 'Firebase' : 'Demo'} mode`);
  };

  // Check if user is admin
  const isAdmin = () => {
    return userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!userProfile;
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!userProfile) return false;
    if (isAdmin()) return true;
    return userProfile.permissions?.includes(permission) || false;
  };

  const value = {
    user,
    userProfile,
    loading,
    useFirebase,
    login,
    logout,
    toggleAuthMode,
    isAdmin,
    isAuthenticated,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
