import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI } from '../services/api/dashboard';
import { apiClient } from '../services/api/client';
import toast from 'react-hot-toast';
import AttendanceCalendar from '../components/AttendanceCalendar';
import Chat from '../components/Chat';
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  PlayIcon,
  StopIcon,
  PauseIcon,
  BellIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  DocumentTextIcon,
  EyeIcon,
  CalendarIcon,
  BookOpenIcon,
  SparklesIcon,
  FireIcon,
  TrophyIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function EmployeeDashboard() {
  const { user, userProfile } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState({
    hasCheckedIn: false,
    hasCheckedOut: false,
    onBreak: false,
    attendance: null,
    shiftInfo: null
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [shiftSettings, setShiftSettings] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leaveData, setLeaveData] = useState({ monthlyLeaves: 0, warningMessage: null });
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchTodayAttendance();
    fetchShiftSettings();
    fetchRecentActivities();
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const response = await apiClient.get(`/leaves/my-leaves?year=${currentYear}`);
      if (response.success) {
        const monthlyLeaves = response.data.filter(leave => {
          const leaveDate = new Date(leave.startDate);
          return leaveDate.getMonth() + 1 === currentMonth && leave.status === 'approved';
        }).length;
        
        let warningMessage = null;
        if (monthlyLeaves >= 4) {
          warningMessage = "You've used most of your monthly leaves. Please plan your time off carefully to maintain productivity.";
        } else if (monthlyLeaves === 3) {
          warningMessage = "You have taken 3 leaves this month. Consider managing your remaining leaves wisely.";
        }
        
        setLeaveData({ monthlyLeaves, warningMessage });
      }
    } catch (error) {
      console.error('Error fetching leave data:', error);
      setLeaveData({ monthlyLeaves: 0, warningMessage: null });
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const response = await apiClient.get('/attendance/history?limit=30');
      if (response.success) {
        setAttendanceHistory(response.data);
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      setAttendanceHistory([]);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await apiClient.get('/activities/my-activities?limit=5');
      const activities = response.data || [];
      
      const validatedActivities = activities.filter(activity => 
        activity && (activity.description || activity.activityType)
      );
      
      setRecentActivities(validatedActivities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    }
  };

  const getActivityIcon = (activityType) => {
    if (!activityType) {
      return { icon: ClockIcon, color: 'bg-gray-100 text-gray-600' };
    }
    
    const iconMap = {
      'login': { icon: ClockIcon, color: 'bg-green-100 text-green-600' },
      'logout': { icon: ClockIcon, color: 'bg-red-100 text-red-600' },
      'attendance_check_in': { icon: PlayIcon, color: 'bg-blue-100 text-blue-600' },
      'attendance_check_out': { icon: StopIcon, color: 'bg-red-100 text-red-600' },
      'task_creation': { icon: ClipboardDocumentListIcon, color: 'bg-purple-100 text-purple-600' },
      'task_completion': { icon: CheckCircleIcon, color: 'bg-green-100 text-green-600' },
      'leave_application': { icon: CalendarDaysIcon, color: 'bg-yellow-100 text-yellow-600' },
      'profile_update': { icon: ChartBarIcon, color: 'bg-indigo-100 text-indigo-600' },
      'project_access': { icon: ChatBubbleLeftRightIcon, color: 'bg-orange-100 text-orange-600' }
    };
    
    return iconMap[activityType] || { icon: ClockIcon, color: 'bg-gray-100 text-gray-600' };
  };

  const formatActivityTime = (timestamp) => {
    if (!timestamp) {
      return 'Unknown time';
    }
    
    try {
      const now = new Date();
      const activityTime = new Date(timestamp);
      
      if (isNaN(activityTime.getTime())) {
        return 'Invalid date';
      }
      
      const diffInHours = Math.floor((now - activityTime) / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
        return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      } else if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      } else {
        return activityTime.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting activity time:', error);
      return 'Unknown time';
    }
  };

  const fetchShiftSettings = async () => {
    try {
      const response = await apiClient.get('/shift/settings');
      setShiftSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch shift settings:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const result = await dashboardAPI.getDashboardData();
      setDashboardData(result.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setDashboardData({
        stats: {
          attendance: { present: 0, total: 1, percentage: 0 },
          tasks: { completed: 0, total: 0, pending: 0, inProgress: 0 },
          learning: { progress: 0 }
        },
        recentTasks: [],
        recentAttendance: []
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await apiClient.get('/attendance/today');
      if (response.success) {
        setAttendanceStatus(response.data);
      } else {
        setAttendanceStatus(response);
      }
    } catch (error) {
      console.error('Failed to fetch today attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      const response = await apiClient.post('/attendance/checkin', {
        location: {
          latitude: null,
          longitude: null,
          address: 'Office Location'
        }
      });
      
      if (response.success) {
        toast.success(response.message);
        if (response.shiftInfo?.isLate) {
          toast.warning('You are marked as late for today', { duration: 4000 });
        }
        setAttendanceStatus(prev => ({
          ...prev,
          shiftInfo: response.shiftInfo
        }));
        fetchTodayAttendance();
        fetchDashboardData();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to check in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!attendanceStatus.hasCheckedIn) {
      toast.error('Please check in first');
      return;
    }

    try {
      setActionLoading(true);
      const response = await apiClient.post('/attendance/checkout');
      
      if (response.success) {
        toast.success(response.message);
        fetchTodayAttendance();
        fetchDashboardData();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to check out');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBreak = async () => {
    if (!attendanceStatus.hasCheckedIn) {
      toast.error('Please check in first');
      return;
    }

    try {
      setActionLoading(true);
      const endpoint = attendanceStatus.onBreak ? '/attendance/end-break' : '/attendance/start-break';
      const response = await apiClient.post(endpoint);
      
      if (response.success) {
        toast.success(response.message);
        fetchTodayAttendance();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update break status');
    } finally {
      setActionLoading(false);
    }
  };

  const stats = dashboardData ? [
    {
      title: 'Attendance This Month',
      value: `${dashboardData.stats.attendance.present}/${dashboardData.stats.attendance.total}`,
      icon: CalendarDaysIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      percentage: `${dashboardData.stats.attendance.percentage}%`
    },
    {
      title: 'Tasks Completed',
      value: `${dashboardData.stats.tasks.completed}/${dashboardData.stats.tasks.total}`,
      icon: CheckCircleIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      pending: dashboardData.stats.tasks.pending,
      inProgress: dashboardData.stats.tasks.inProgress
    },
    {
      title: 'Learning Progress',
      value: `${dashboardData.stats.learning.progress}%`,
      icon: AcademicCapIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation Tabs */}
      <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SparklesIcon className="w-5 h-5 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab('attendance');
                fetchAttendanceHistory();
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'attendance'
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CalendarIcon className="w-5 h-5 inline mr-2" />
              Attendance
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'chat'
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 inline mr-2" />
              Team Chat
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Hello, {userProfile?.fullName?.split(' ')[0] || 'there'}! 👋
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {currentTime.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-violet-600 font-semibold text-xl">
                    {currentTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center">
                      <TrophyIcon className="w-8 h-8 mr-3" />
                      <div>
                        <div className="text-sm opacity-90">Your Rank</div>
                        <div className="text-2xl font-bold">Top Performer</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Leave Warning */}
              {leaveData.warningMessage && (
                <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-400 mr-3" />
                    <div>
                      <p className="text-amber-800 font-medium">Leave Management Notice</p>
                      <p className="text-amber-700 text-sm mt-1">{leaveData.warningMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Shift Timing Info */}
              {shiftSettings && (
                <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ClockIcon className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <span className="text-blue-800 font-semibold text-lg">
                          Today's Shift: {shiftSettings.shiftStart} - {shiftSettings.shiftEnd}
                        </span>
                        <p className="text-blue-600 text-sm mt-1">Your dedicated work hours</p>
                      </div>
                    </div>
                    {attendanceStatus.shiftInfo && (
                      <div className="flex items-center space-x-3">
                        {attendanceStatus.shiftInfo.isLate && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                            <FireIcon className="w-4 h-4 mr-1" />
                            Late
                          </span>
                        )}
                        {attendanceStatus.shiftInfo.isHalfDay && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                            Half Day
                          </span>
                        )}
                        {attendanceStatus.shiftInfo.status === 'present' && !attendanceStatus.shiftInfo.isLate && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            On Time
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modern Attendance Controls */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/30 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <ClockIcon className="w-6 h-6 mr-3 text-violet-600" />
                Today's Attendance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={handleCheckIn}
                  disabled={attendanceStatus.hasCheckedIn || actionLoading}
                  className={`relative overflow-hidden rounded-xl p-6 transition-all duration-300 transform hover:scale-105 ${
                    attendanceStatus.hasCheckedIn
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <PlayIcon className="w-8 h-8 mr-3" />
                    <div className="text-left">
                      <div className="font-bold text-lg">Check In</div>
                      <div className="text-sm opacity-90">Start your day</div>
                    </div>
                  </div>
                  {attendanceStatus.hasCheckedIn && (
                    <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                      <CheckCircleIcon className="w-12 h-12 text-green-600" />
                    </div>
                  )}
                </button>

                <button
                  onClick={handleBreak}
                  disabled={!attendanceStatus.hasCheckedIn || attendanceStatus.hasCheckedOut || actionLoading}
                  className={`relative overflow-hidden rounded-xl p-6 transition-all duration-300 transform hover:scale-105 ${
                    !attendanceStatus.hasCheckedIn || attendanceStatus.hasCheckedOut
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : attendanceStatus.onBreak
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <PauseIcon className="w-8 h-8 mr-3" />
                    <div className="text-left">
                      <div className="font-bold text-lg">
                        {attendanceStatus.onBreak ? 'End Break' : 'Take Break'}
                      </div>
                      <div className="text-sm opacity-90">
                        {attendanceStatus.onBreak ? 'Resume work' : 'Short pause'}
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleCheckOut}
                  disabled={!attendanceStatus.hasCheckedIn || attendanceStatus.hasCheckedOut || actionLoading}
                  className={`relative overflow-hidden rounded-xl p-6 transition-all duration-300 transform hover:scale-105 ${
                    !attendanceStatus.hasCheckedIn || attendanceStatus.hasCheckedOut
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <StopIcon className="w-8 h-8 mr-3" />
                    <div className="text-left">
                      <div className="font-bold text-lg">Check Out</div>
                      <div className="text-sm opacity-90">End your day</div>
                    </div>
                  </div>
                  {attendanceStatus.hasCheckedOut && (
                    <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                      <CheckCircleIcon className="w-12 h-12 text-red-600" />
                    </div>
                  )}
                </button>
              </div>

              {/* Status Display */}
              {(attendanceStatus.hasCheckedIn || attendanceStatus.hasCheckedOut) && (
                <div className="mt-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex space-x-4">
                      {attendanceStatus.attendance?.checkIn && (
                        <div>
                          <span className="text-violet-600 font-medium">Check In:</span>
                          <span className="ml-2 text-gray-700">
                            {new Date(attendanceStatus.attendance.checkIn).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}
                      {attendanceStatus.attendance?.checkOut && (
                        <div>
                          <span className="text-violet-600 font-medium">Check Out:</span>
                          <span className="ml-2 text-gray-700">
                            {new Date(attendanceStatus.attendance.checkOut).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    {attendanceStatus.onBreak && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                        <PauseIcon className="w-4 h-4 mr-1" />
                        On Break
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modern Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/30 p-6 transform transition-all duration-300 hover:scale-105">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-xl ${stat.bgColor} mr-4`}>
                        <IconComponent className={`h-8 w-8 ${stat.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        {stat.percentage && (
                          <p className={`text-sm font-medium ${stat.color}`}>{stat.percentage}</p>
                        )}
                        {(stat.pending !== undefined || stat.inProgress !== undefined) && (
                          <div className="flex space-x-3 mt-2">
                            {stat.pending !== undefined && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                {stat.pending} pending
                              </span>
                            )}
                            {stat.inProgress !== undefined && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {stat.inProgress} in progress
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Activities */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/30 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <ClockIcon className="w-5 h-5 mr-3 text-violet-600" />
                Recent Activities
              </h3>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => {
                    const { icon: ActivityIcon, color } = getActivityIcon(activity.type);
                    return (
                      <div key={index} className="flex items-center p-4 bg-white/50 rounded-xl border border-gray-100">
                        <div className={`p-2 rounded-full ${color} mr-4`}>
                          <ActivityIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action || activity.description || 'Unknown activity'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatActivityTime(activity.timestamp || activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activities</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/30 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <CalendarIcon className="w-6 h-6 mr-3 text-violet-600" />
                Attendance History
              </h2>
              <AttendanceCalendar />
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/30 p-6">
            <Chat />
          </div>
        )}
      </div>
    </div>
  );
}
