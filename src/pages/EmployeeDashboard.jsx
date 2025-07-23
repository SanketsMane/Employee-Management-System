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
  TrophyIcon
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
      
      // Ensure each activity has the required properties
      const validatedActivities = activities.filter(activity => 
        activity && (activity.description || activity.activityType)
      );
      
      setRecentActivities(validatedActivities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]); // Set to empty array on error
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
      
      // Check if the date is valid
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
      // Fallback to placeholder data
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
        // Handle case where response doesn't have success field
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

    // Check if it's too early for full day
    if (shiftSettings) {
      const now = new Date();
      const [hours, minutes] = shiftSettings.shiftEnd.split(':').map(Number);
      const shiftEnd = new Date();
      shiftEnd.setHours(hours, minutes, 0, 0);
      
      const earlyCheckoutThreshold = new Date(shiftEnd.getTime() - (shiftSettings.halfDayThreshold * 60 * 60000));
      
      if (now < earlyCheckoutThreshold) {
        const confirmEarly = window.confirm(
          `Checking out before ${shiftEnd.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} will mark you as half day. Do you want to continue?`
        );
        if (!confirmEarly) return;
      }
    }

    try {
      setActionLoading(true);
      const response = await apiClient.post('/attendance/checkout', {
        location: {
          latitude: null,
          longitude: null,
          address: 'Office Location'
        }
      });
      
      if (response.success) {
        toast.success(response.message);
        if (response.shiftInfo?.isHalfDay) {
          toast.warning('Marked as half day due to early checkout', { duration: 4000 });
        }
        setAttendanceStatus(prev => ({
          ...prev,
          shiftInfo: response.shiftInfo
        }));
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
    try {
      setActionLoading(true);
      const response = await apiClient.post('/attendance/break');
      
      if (response.success) {
        toast.success(response.onBreak ? 'Break started!' : 'Break ended!');
        fetchTodayAttendance();
        fetchDashboardData();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to manage break');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick action cards for employees
  const quickActions = [
    {
      title: 'Check In/Out',
      description: 'Mark your attendance',
      icon: ClockIcon,
      href: '/attendance',
      color: 'bg-blue-500',
    },
    {
      title: 'My Tasks',
      description: 'View assigned tasks',
      icon: ClipboardDocumentListIcon,
      href: '/tasks',
      color: 'bg-green-500',
    },
    {
      title: 'Learning',
      description: 'Access learning materials',
      icon: AcademicCapIcon,
      href: '/learning',
      color: 'bg-purple-500',
    },
    {
      title: 'Team Chat',
      description: 'Communicate with team',
      icon: ChatBubbleLeftRightIcon,
      href: '/chat',
      color: 'bg-orange-500',
    },
  ];

  // Stats for employee dashboard - now using real data
  const stats = dashboardData ? [
    {
      title: 'Attendance This Month',
      value: `${dashboardData.stats.attendance.present}/${dashboardData.stats.attendance.total}`,
      icon: CalendarDaysIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
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
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">
      {/* Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
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
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-8 mb-8">
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
              className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                attendanceStatus.hasCheckedIn
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'border-green-300 hover:border-green-400 hover:bg-green-50 text-green-700'
              } ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <PlayIcon className="h-6 w-6 mr-2" />
              {attendanceStatus.hasCheckedIn ? 'Checked In' : 'Check In'}
            </button>

            <button
              onClick={handleBreak}
              disabled={!attendanceStatus.hasCheckedIn || attendanceStatus.hasCheckedOut || actionLoading}
              className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                attendanceStatus.onBreak
                  ? 'bg-orange-50 border-orange-200 text-orange-700'
                  : 'border-orange-300 hover:border-orange-400 hover:bg-orange-50 text-orange-700'
              } ${actionLoading || !attendanceStatus.hasCheckedIn || attendanceStatus.hasCheckedOut ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <PauseIcon className="h-6 w-6 mr-2" />
              {attendanceStatus.onBreak ? 'End Break' : 'Start Break'}
            </button>

            <button
              onClick={handleCheckOut}
              disabled={!attendanceStatus.hasCheckedIn || attendanceStatus.hasCheckedOut || actionLoading}
              className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                attendanceStatus.hasCheckedOut
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'border-red-300 hover:border-red-400 hover:bg-red-50 text-red-700'
              } ${actionLoading || !attendanceStatus.hasCheckedIn || attendanceStatus.hasCheckedOut ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <StopIcon className="h-6 w-6 mr-2" />
              {attendanceStatus.hasCheckedOut ? 'Checked Out' : 'Check Out'}
            </button>
          </div>

          {/* Attendance Status Info */}
          {attendanceStatus.attendance && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {attendanceStatus.attendance.checkIn && (
                  <div>
                    <span className="font-medium text-gray-700">Check In:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(attendanceStatus.attendance.checkIn).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                {attendanceStatus.attendance.checkOut && (
                  <div>
                    <span className="font-medium text-gray-700">Check Out:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(attendanceStatus.attendance.checkOut).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                {attendanceStatus.attendance.breaks && attendanceStatus.attendance.breaks.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Breaks:</span>
                    <span className="ml-2 text-gray-600">
                      {attendanceStatus.attendance.breaks.length} session(s)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <a
                  key={index}
                  href={action.href}
                  className="flex flex-col items-center p-6 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className={`p-3 rounded-full ${action.color} mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 text-center mb-2">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500 text-center">
                    {action.description}
                  </p>
                </a>
              );
            })}
          </div>
        </div>

        {/* Recent Tasks */}
        {dashboardData?.recentTasks && dashboardData.recentTasks.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Tasks</h2>
            <div className="space-y-4">
              {dashboardData.recentTasks.map((task, index) => (
                <div
                  key={task._id || index}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.priority} priority
                      </span>
                      <span className="text-xs text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <a
                href="/tasks"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                View all tasks
                <ChartBarIcon className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        )}

        {/* Recent Attendance */}
        {dashboardData?.recentAttendance && dashboardData.recentAttendance.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Attendance</h2>
            <div className="space-y-3">
              {dashboardData.recentAttendance.slice(-5).map((attendance, index) => (
                <div
                  key={attendance._id || index}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      attendance.status === 'present' ? 'bg-green-500' :
                      attendance.status === 'late' ? 'bg-orange-500' :
                      attendance.status === 'absent' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(attendance.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {attendance.checkIn ? `In: ${new Date(attendance.checkIn).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}` : 'Not checked in'}
                        {attendance.checkOut ? ` • Out: ${new Date(attendance.checkOut).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    attendance.status === 'present' ? 'bg-green-100 text-green-800' :
                    attendance.status === 'late' ? 'bg-orange-100 text-orange-800' :
                    attendance.status === 'absent' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {attendance.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <a
                href="/attendance"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                View full attendance
                <ClockIcon className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => {
                const { icon: ActivityIcon, color } = getActivityIcon(activity.activityType);
                return (
                  <div key={activity._id || index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${color}`}>
                      <ActivityIcon className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {activity.description || (activity.activityType ? activity.activityType.replace(/_/g, ' ') : 'Unknown Activity')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatActivityTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <ClockIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No recent activity found</p>
                <p className="text-gray-400 text-xs mt-1">Activity will appear here once you start using the system</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Attendance Calendar */}
        <AttendanceCalendar />
      </div>
    </div>
  );
}
