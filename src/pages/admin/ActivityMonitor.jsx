import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../../components/Footer';
import {
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  EyeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BellIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { format, formatDistanceToNow } from 'date-fns';

export default function ActivityMonitor() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showRealTime, setShowRealTime] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const activityTypes = ['all', 'login', 'logout', 'course_access', 'task_completion', 'file_upload', 'admin_action'];
  const statusTypes = ['all', 'success', 'warning', 'error', 'info'];

  useEffect(() => {
    loadActivityData();
    const interval = autoRefresh ? setInterval(loadActivityData, 30000) : null; // Refresh every 30 seconds
    return () => interval && clearInterval(interval);
  }, [autoRefresh]);

  const loadActivityData = async () => {
    setLoading(true);
    try {
      // Mock real-time activity data
      const mockActivities = [
        {
          id: 1,
          type: 'login',
          user: 'John Doe',
          userId: 'user_001',
          action: 'User logged in',
          timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
          ip: '192.168.1.100',
          device: 'Chrome on Windows',
          status: 'success',
          details: 'Successful login from corporate network'
        },
        {
          id: 2,
          type: 'course_access',
          user: 'Jane Smith',
          userId: 'user_002',
          action: 'Accessed React Development course',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          ip: '192.168.1.105',
          device: 'Chrome on MacOS',
          status: 'success',
          details: 'Started Module 3: Advanced Hooks'
        },
        {
          id: 3,
          type: 'task_completion',
          user: 'Mike Johnson',
          userId: 'user_003',
          action: 'Completed task: API Integration',
          timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          ip: '192.168.1.110',
          device: 'Edge on Windows',
          status: 'success',
          details: 'Task completed with 95% accuracy'
        },
        {
          id: 4,
          type: 'file_upload',
          user: 'Sarah Wilson',
          userId: 'user_004',
          action: 'Uploaded assignment file',
          timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          ip: '192.168.1.115',
          device: 'Firefox on Linux',
          status: 'success',
          details: 'Uploaded project_final.zip (2.3MB)'
        },
        {
          id: 5,
          type: 'admin_action',
          user: 'Admin User',
          userId: 'admin_001',
          action: 'Created new batch: Python Basics',
          timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
          ip: '192.168.1.200',
          device: 'Chrome on Windows',
          status: 'success',
          details: 'Batch created with 25 capacity'
        },
        {
          id: 6,
          type: 'login',
          user: 'Unknown User',
          userId: 'unknown',
          action: 'Failed login attempt',
          timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
          ip: '203.0.113.45',
          device: 'Unknown Browser',
          status: 'error',
          details: 'Invalid credentials - IP blocked for 15 minutes'
        },
        {
          id: 7,
          type: 'logout',
          user: 'Alex Chen',
          userId: 'user_005',
          action: 'User logged out',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          ip: '192.168.1.120',
          device: 'Safari on iOS',
          status: 'success',
          details: 'Session ended normally'
        }
      ];

      const mockActiveUsers = [
        { id: 'user_001', name: 'John Doe', lastActive: new Date(Date.now() - 2 * 60 * 1000), status: 'online', currentPage: 'Dashboard' },
        { id: 'user_002', name: 'Jane Smith', lastActive: new Date(Date.now() - 5 * 60 * 1000), status: 'online', currentPage: 'React Development Course' },
        { id: 'user_003', name: 'Mike Johnson', lastActive: new Date(Date.now() - 10 * 60 * 1000), status: 'online', currentPage: 'Task Management' },
        { id: 'user_004', name: 'Sarah Wilson', lastActive: new Date(Date.now() - 15 * 60 * 1000), status: 'idle', currentPage: 'File Upload' },
        { id: 'user_006', name: 'Emily Davis', lastActive: new Date(Date.now() - 8 * 60 * 1000), status: 'online', currentPage: 'Learning Library' }
      ];

      const mockSystemStats = {
        totalUsers: 48,
        activeUsers: 5,
        totalSessions: 127,
        activeSessions: 5,
        todayLogins: 23,
        failedLogins: 2,
        systemUptime: '15 days, 6 hours',
        averageSessionTime: '2h 34m',
        peakConcurrentUsers: 12,
        systemLoad: 45 // percentage
      };

      setActivities(mockActivities);
      setActiveUsers(mockActiveUsers);
      setSystemStats(mockSystemStats);
    } catch (error) {
      console.error('Error loading activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login': return <UserIcon className="h-5 w-5" />;
      case 'logout': return <UserIcon className="h-5 w-5" />;
      case 'course_access': return <ComputerDesktopIcon className="h-5 w-5" />;
      case 'task_completion': return <CheckCircleIcon className="h-5 w-5" />;
      case 'file_upload': return <ArrowPathIcon className="h-5 w-5" />;
      case 'admin_action': return <ShieldCheckIcon className="h-5 w-5" />;
      default: return <EyeIcon className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'error': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'info': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getUserStatus = (status) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'idle': return 'bg-yellow-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getFilteredActivities = () => {
    return activities.filter(activity => {
      const matchesSearch = activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           activity.action.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || activity.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  };

  const renderSystemStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="glass-card p-6 rounded-xl border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Users</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemStats.activeUsers}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">of {systemStats.totalUsers} total</p>
          </div>
          <div className="p-3 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600">
            <UserIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Sessions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemStats.activeSessions}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">of {systemStats.totalSessions} today</p>
          </div>
          <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600">
            <ComputerDesktopIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Today's Logins</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemStats.todayLogins}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{systemStats.failedLogins} failed</p>
          </div>
          <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600">
            <CheckCircleIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">System Load</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemStats.systemLoad}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Uptime: {systemStats.systemUptime}</p>
          </div>
          <div className="p-3 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-600">
            <ChartBarIcon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveUsers = () => (
    <div className="glass-card p-6 rounded-xl border border-white/20 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Active Users ({activeUsers.length})
        </h3>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Real-time</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Current Page
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Last Active
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {activeUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 relative">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${getUserStatus(user.status)}`}></div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === 'online' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                      : user.status === 'idle'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'
                  }`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {user.currentPage}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(user.lastActive, { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderActivityFeed = () => (
    <div className="glass-card p-6 rounded-xl border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Activity Feed
        </h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
              autoRefresh 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'
            }`}
          >
            {autoRefresh ? <PlayIcon className="h-4 w-4 mr-1" /> : <PauseIcon className="h-4 w-4 mr-1" />}
            {autoRefresh ? 'Auto-refresh' : 'Paused'}
          </button>
          <button
            onClick={loadActivityData}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {getFilteredActivities().map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className={`flex-shrink-0 p-2 rounded-full ${getStatusColor(activity.status)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.user}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {activity.action}
                  </p>
                </div>
                <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                  <p>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</p>
                  <p>{format(activity.timestamp, 'HH:mm:ss')}</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <p>{activity.details}</p>
                <p className="mt-1">
                  <span className="font-medium">IP:</span> {activity.ip} | 
                  <span className="font-medium"> Device:</span> {activity.device}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {getFilteredActivities().length === 0 && (
        <div className="text-center py-12">
          <EyeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No activities found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="glass-card p-6 rounded-xl border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Activity Monitor
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Real-time monitoring of user activities and system performance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Live</span>
              </div>
              <BellIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* System Stats */}
        {renderSystemStats()}

        {/* Active Users */}
        {renderActiveUsers()}

        {/* Filters */}
        <div className="glass-card p-6 rounded-xl border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {activityTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {statusTypes.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        {loading ? (
          <div className="glass-card p-6 rounded-xl border border-white/20">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </div>
        ) : (
          renderActivityFeed()
        )}

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
