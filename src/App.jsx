import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Attendance from './pages/Attendance';
import Tasks from './pages/Tasks';
import Chat from './pages/Chat';
import Learning from './pages/Learning';
import Profile from './pages/Profile';
import AdminEmployees from './pages/admin/Employees';
import AdminBatches from './pages/admin/Batches';
import AdminReports from './pages/admin/Reports';
import AdminActivityMonitor from './pages/admin/ActivityMonitor';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuth } from './contexts/AuthContext';

function AppContent() {
  const { loading, isAuthenticated } = useAuth();

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
        <Route path="/chat" element={<ProtectedRoute><Layout><Chat /></Layout></ProtectedRoute>} />
        <Route path="/learning" element={<ProtectedRoute><Layout><Learning /></Layout></ProtectedRoute>} />
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
        <Route path="/admin/batches" element={
          <ProtectedRoute adminOnly={true}>
            <Layout><AdminBatches /></Layout>
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
