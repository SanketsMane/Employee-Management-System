import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/EmployeeDashboard_New';
import AdminDashboard from './pages/admin/AdminDashboard';
import Attendance from './pages/Attendance';
import Tasks from './pages/Tasks';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import EmployeeProjects from './pages/EmployeeProjects';
import AdminEmployees from './pages/admin/Employees';
import './styles/formonex-ai.css';
import AdminProjects from './pages/admin/Projects';
import AdminReports from './pages/admin/Reports';
import AdminActivityMonitor from './pages/admin/ActivityMonitor';
import LeaveManagement from './pages/LeaveManagement';
import AdminLeaveManagement from './pages/admin/LeaveManagement';
import ShiftSettings from './pages/admin/ShiftSettings';
import Worksheet from './pages/Worksheet';
import WorksheetDashboard from './pages/admin/WorksheetDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import FormonexSplashScreen from './components/FormonexSplashScreen';
import { useAuth } from './contexts/AuthContext';
import { useState, useEffect } from 'react';

import { userPreferences } from './services/userPreferences.js';

function AppContent() {
  const { loading, isAuthenticated } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [splashLoading, setSplashLoading] = useState(true);

  useEffect(() => {
    // Check splash screen preference from MongoDB
    const checkSplashPreference = async () => {
      try {
        // First check localStorage for backward compatibility
        const localHasSeenSplash = localStorage.getItem('formonex-splash-seen');
        
        if (localHasSeenSplash) {
          // Migrate to MongoDB and remove from localStorage
          await userPreferences.setPreference('formonex-splash-seen', true);
          localStorage.removeItem('formonex-splash-seen');
          setShowSplash(false);
        } else {
          // Check MongoDB
          const hasSeenSplash = await userPreferences.getPreference('formonex-splash-seen', false);
          setShowSplash(!hasSeenSplash);
        }
      } catch (error) {
        console.warn('Failed to check splash preference, showing splash:', error);
        setShowSplash(true);
      } finally {
        setSplashLoading(false);
      }
    };

    checkSplashPreference();
  }, []);

  const handleSplashComplete = async () => {
    try {
      await userPreferences.setPreference('formonex-splash-seen', true);
    } catch (error) {
      console.warn('Failed to save splash preference:', error);
      // Fallback to localStorage if MongoDB fails
      localStorage.setItem('formonex-splash-seen', 'true');
    }
    setShowSplash(false);
  };

  if (splashLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (showSplash) {
    return <FormonexSplashScreen onComplete={handleSplashComplete} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Redirect root to appropriate dashboard based on auth status */}
        <Route path="/" element={
          isAuthenticated() ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
        } />
        
        {/* Employee Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Layout><Attendance /></Layout></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Layout><Tasks /></Layout></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Layout><EmployeeProjects /></Layout></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Layout><Chat /></Layout></ProtectedRoute>} />
        <Route path="/worksheet" element={<ProtectedRoute><Layout><Worksheet /></Layout></ProtectedRoute>} />
        <Route path="/leave" element={<ProtectedRoute><Layout><LeaveManagement /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute adminOnly={true}>
            <Layout><AdminDashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/employees" element={
          <ProtectedRoute adminOnly={true}>
            <Layout><AdminEmployees /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/projects" element={
          <ProtectedRoute adminOnly={true}>
            <Layout><AdminProjects /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/leave" element={
          <ProtectedRoute adminOnly={true}>
            <Layout><AdminLeaveManagement /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/shift-settings" element={
          <ProtectedRoute adminOnly={true}>
            <Layout><ShiftSettings /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute adminOnly={true}>
            <Layout><AdminReports /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/activity" element={
          <ProtectedRoute adminOnly={true}>
            <Layout><AdminActivityMonitor /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/worksheets" element={
          <ProtectedRoute adminOnly={true}>
            <Layout><WorksheetDashboard /></Layout>
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
