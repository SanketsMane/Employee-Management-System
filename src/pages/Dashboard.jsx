import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import DatabaseService from '../services/databaseService';
import AdminDashboard from './admin/AdminDashboard';
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  BookOpenIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, userProfile } = useAuth();
  
  // Check if user is admin and redirect to appropriate dashboard
  const isAdmin = userProfile?.role === 'admin' || user?.email === 'admin@company.com';
  
  if (isAdmin) {
    return <AdminDashboard />;
  }
  
  // Employee Dashboard Component
  return <EmployeeDashboard />;
}

function EmployeeDashboard() {
  const { user, userProfile } = useAuth();
  const [employeeStats, setEmployeeStats] = useState({
    attendanceRate: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalHours: 0,
    todayHours: 0,
    enrolledCourses: 0,
    completedCourses: 0,
    certificates: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [learningProgress, setLearningProgress] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    setLoading(true);
    try {
      // Simulate API calls - Replace with actual database calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock employee statistics
      setEmployeeStats({
        attendanceRate: 94,
        completedTasks: 28,
        pendingTasks: 5,
        totalHours: 168,
        todayHours: 7.5,
        enrolledCourses: 6,
        completedCourses: 4,
        certificates: 3
      });

      // Mock recent activities
      setRecentActivities([
        {
          id: 1,
          type: 'task_completed',
          message: 'Completed "API Integration" task',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          status: 'completed'
        },
        {
          id: 2,
          type: 'course_enrolled',
          message: 'Enrolled in "Advanced React Patterns"',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'enrolled'
        },
        {
          id: 3,
          type: 'certificate_earned',
          message: 'Earned certificate for "JavaScript Fundamentals"',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          status: 'achieved'
        },
        {
          id: 4,
          type: 'attendance_marked',
          message: 'Attendance marked for today',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          status: 'present'
        }
      ]);

      // Mock upcoming tasks
      setUpcomingTasks([
        {
          id: 1,
          title: 'Complete React Component Refactoring',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          priority: 'high',
          progress: 75
        },
        {
          id: 2,
          title: 'Review Code for Authentication Module',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          priority: 'medium',
          progress: 40
        },
        {
          id: 3,
          title: 'Complete Online Training Assessment',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          priority: 'low',
          progress: 20
        }
      ]);

      // Mock learning progress
      setLearningProgress([
        { course: 'React Fundamentals', progress: 100, status: 'completed' },
        { course: 'Node.js Basics', progress: 85, status: 'in-progress' },
        { course: 'Database Design', progress: 60, status: 'in-progress' },
        { course: 'Advanced JavaScript', progress: 100, status: 'completed' },
        { course: 'UI/UX Principles', progress: 30, status: 'in-progress' },
        { course: 'Project Management', progress: 0, status: 'not-started' }
      ]);

      // Mock attendance data
      setAttendanceData([
        { day: 'Mon', hours: 8, status: 'present' },
        { day: 'Tue', hours: 7.5, status: 'present' },
        { day: 'Wed', hours: 8, status: 'present' },
        { day: 'Thu', hours: 7, status: 'present' },
        { day: 'Fri', hours: 8, status: 'present' },
        { day: 'Sat', hours: 0, status: 'off' },
        { day: 'Sun', hours: 0, status: 'off' }
      ]);

      // Mock notifications
      setNotifications([
        {
          id: 1,
          title: 'New Assignment Available',
          message: 'You have a new task assigned: "Mobile App Testing"',
          type: 'task',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          unread: true
        },
        {
          id: 2,
          title: 'Training Reminder',
          message: 'React Advanced Course session starts at 2:00 PM',
          type: 'training',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          unread: true
        },
        {
          id: 3,
          title: 'Certificate Available',
          message: 'Your JavaScript Fundamentals certificate is ready',
          type: 'achievement',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          unread: false
        }
      ]);

    } catch (error) {
      console.error('Error loading employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_completed': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'course_enrolled': return <AcademicCapIcon className="h-5 w-5 text-blue-500" />;
      case 'certificate_earned': return <TrophyIcon className="h-5 w-5 text-yellow-500" />;
      case 'attendance_marked': return <ClockIcon className="h-5 w-5 text-purple-500" />;
      default: return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {userProfile?.displayName || 'Employee'}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Here's your progress and upcoming tasks for today.
          </p>
        </div>

        {/* Employee Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 rounded-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{employeeStats.attendanceRate}%</p>
                <p className="text-sm text-green-600 dark:text-green-400">This month</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <ClockIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{employeeStats.completedTasks}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">{employeeStats.pendingTasks} pending</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <CheckCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Learning Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{employeeStats.completedCourses}/{employeeStats.enrolledCourses}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">Courses completed</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <AcademicCapIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Certificates Earned</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{employeeStats.certificates}</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">This year</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <TrophyIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Upcoming Tasks */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 rounded-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h3>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Due: {format(task.dueDate, 'MMM dd, yyyy')}
                        </p>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="font-medium">{task.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <span className={`ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            <div className="glass-card p-6 rounded-xl border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Activities</h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.message}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(activity.timestamp, 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Learning Progress */}
        <div className="glass-card p-6 rounded-xl border border-white/20 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Learning Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {learningProgress.map((course, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{course.course}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    course.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    course.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {course.status === 'not-started' ? 'Not Started' : 
                     course.status === 'in-progress' ? 'In Progress' : 'Completed'}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        course.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                {course.status === 'in-progress' && (
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    Continue Learning
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6 rounded-xl border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-all duration-200">
              <ClockIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Mark Attendance</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/30 dark:hover:to-green-700/30 transition-all duration-200">
              <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">View Tasks</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/30 dark:hover:to-purple-700/30 transition-all duration-200">
              <AcademicCapIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Browse Courses</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg hover:from-yellow-100 hover:to-yellow-200 dark:hover:from-yellow-800/30 dark:hover:to-yellow-700/30 transition-all duration-200">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Team Chat</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg hover:from-red-100 hover:to-red-200 dark:hover:from-red-800/30 dark:hover:to-red-700/30 transition-all duration-200">
              <ArrowDownTrayIcon className="h-8 w-8 text-red-600 dark:text-red-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Download Reports</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-lg hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700/30 dark:hover:to-gray-600/30 transition-all duration-200">
              <BellIcon className="h-8 w-8 text-gray-600 dark:text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Notifications</span>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
        totalEmployees: 45,
        presentToday: 38,
        onlineNow: 24,
        pendingTasks: 12,
        completedTasks: 28,
        totalHours: 1560,
        todayHours: 320,
        activeBatches: 6,
        completedCourses: 145
      };

      const mockAttendanceChart = [
        { name: 'Mon', present: 42, absent: 3 },
        { name: 'Tue', present: 38, absent: 7 },
        { name: 'Wed', present: 41, absent: 4 },
        { name: 'Thu', present: 39, absent: 6 },
        { name: 'Fri', present: 43, absent: 2 },
        { name: 'Sat', present: 25, absent: 20 },
        { name: 'Sun', present: 0, absent: 45 }
      ];

      const mockTaskChart = [
        { name: 'Completed', value: 28, color: '#10B981' },
        { name: 'In Progress', value: 15, color: '#3B82F6' },
        { name: 'Pending', value: 12, color: '#F59E0B' },
        { name: 'Overdue', value: 5, color: '#EF4444' }
      ];

      const mockActivities = [
        {
          id: 1,
          type: 'login',
          user: 'John Doe',
          description: 'logged in',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          icon: '🔓'
        },
        {
          id: 2,
          type: 'task_completed',
          user: 'Jane Smith',
          description: 'completed task "Update Documentation"',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          icon: '✅'
        },
        {
          id: 3,
          type: 'attendance',
          user: 'Mike Johnson',
          description: 'marked attendance',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          icon: '⏰'
        },
        {
          id: 4,
          type: 'course_completed',
          user: 'Sarah Wilson',
          description: 'completed "React Fundamentals" course',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          icon: '🎓'
        },
        {
          id: 5,
          type: 'batch_assigned',
          user: 'Admin',
          description: 'assigned 5 employees to new training batch',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          icon: '👥'
        }
      ];

      setStats(mockStats);
      setAttendanceChart(mockAttendanceChart);
      setTaskChart(mockTaskChart);
      setRecentActivities(mockActivities);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeListeners = () => {
    // Listen to online users status
    const unsubscribeStatus = getAllUsersStatus((snapshot) => {
      if (snapshot.exists()) {
        const statusData = snapshot.val();
        const onlineUsersList = Object.entries(statusData)
          .filter(([_, status]) => status.state === 'online')
          .map(([userId, status]) => ({
            id: userId,
            ...status
          }));
        setOnlineUsers(onlineUsersList);
        
        // Update online count in stats
        setStats(prev => ({
          ...prev,
          onlineNow: onlineUsersList.length
        }));
      }
    });

    // Listen to activity logs (admin only)
    if (isAdmin()) {
      const unsubscribeActivities = getAllActivityLogs((snapshot) => {
        if (snapshot.exists()) {
          const activitiesData = snapshot.val();
          const recentActivitiesList = Object.entries(activitiesData)
            .flatMap(([userId, activities]) => 
              Object.entries(activities).map(([activityId, activity]) => ({
                id: activityId,
                userId,
                ...activity
              }))
            )
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);
          
          setRecentActivities(recentActivitiesList);
        }
      });

      return () => {
        unsubscribeStatus();
        unsubscribeActivities();
      };
    }

    return () => {
      unsubscribeStatus();
    };
  };

  const handleExportData = async (type) => {
    const startDate = subDays(new Date(), 30);
    const endDate = new Date();
    
    try {
      let result;
      switch (type) {
        case 'attendance':
          result = await exportAttendanceToExcel(startDate, endDate);
          break;
        case 'tasks':
          result = await exportTasksToExcel(startDate, endDate);
          break;
        default:
          return;
      }
      
      if (result.success) {
        toast.success(`${type} data exported successfully`);
      } else {
        toast.error(`Failed to export ${type} data`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', trend, subtitle }) => (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {value}
                </div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend > 0 ? '+' : ''}{trend}%
                  </div>
                )}
              </dd>
              {subtitle && (
                <dd className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {subtitle}
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const OnlineUsersWidget = () => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Online Users ({onlineUsers.length})
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Live</span>
        </div>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {onlineUsers.slice(0, 10).map((user) => (
          <div key={user.id} className="flex items-center space-x-3">
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <UsersIcon className="h-4 w-4 text-gray-400" />
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.department} • {user.role}
              </p>
            </div>
          </div>
        ))}
        {onlineUsers.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No users currently online
          </p>
        )}
      </div>
    </div>
  );

  const RecentActivitiesWidget = () => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Activities
      </h3>
      <div className="flow-root">
        <ul className="-mb-8 max-h-64 overflow-y-auto">
          {recentActivities.map((activity, index) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {index !== recentActivities.length - 1 && (
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ring-8 ring-white dark:ring-gray-800 text-sm">
                      {activity.icon}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {activity.user}
                        </span>{' '}
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      <time>
                        {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-xl text-white p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {userProfile?.displayName || user?.displayName || 'User'}! 👋
          </h1>
          <p className="text-blue-100 text-lg mb-4">
            {isAdmin() 
              ? "Here's what's happening with your team today."
              : "Track your progress and stay updated with your tasks."
            }
          </p>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-100">System Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-blue-200" />
              <span className="text-sm text-blue-100">{format(new Date(), 'HH:mm')}</span>
            </div>
            <div className="text-sm text-blue-100">
              {format(new Date(), 'EEEE, MMMM dd, yyyy')}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={UsersIcon}
          color="blue"
          trend={5}
          subtitle="Active employees"
        />
        <StatCard
          title="Online Now"
          value={stats.onlineNow}
          icon={CheckCircleIcon}
          color="green"
          subtitle="Currently active"
        />
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          icon={CalendarDaysIcon}
          color="indigo"
          trend={2}
          subtitle={`Out of ${stats.totalEmployees}`}
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={ExclamationTriangleIcon}
          color="yellow"
          trend={-8}
          subtitle="Awaiting completion"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Completed Tasks"
          value={stats.completedTasks}
          icon={CheckCircleIcon}
          color="green"
          subtitle="This month"
        />
        <StatCard
          title="Active Batches"
          value={stats.activeBatches}
          icon={AcademicCapIcon}
          color="purple"
          subtitle="Training programs"
        />
        <StatCard
          title="Total Hours"
          value={`${stats.totalHours}h`}
          icon={ClockIcon}
          color="blue"
          subtitle="This month"
        />
        <StatCard
          title="Today's Hours"
          value={`${stats.todayHours}h`}
          icon={ClockIcon}
          color="indigo"
          subtitle="All employees"
        />
      </div>

      {/* Charts Section */}
      {isAdmin() && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Chart */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Weekly Attendance
              </h3>
              {hasPermission('canExportData') && (
                <button
                  onClick={() => handleExportData('attendance')}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-600 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300"
                >
                  <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                  Export
                </button>
              )}
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={attendanceChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" fill="#10B981" name="Present" />
                <Bar dataKey="absent" fill="#EF4444" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Task Distribution Chart */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Task Distribution
              </h3>
              {hasPermission('canExportData') && (
                <button
                  onClick={() => handleExportData('tasks')}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-600 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300"
                >
                  <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                  Export
                </button>
              )}
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={taskChart}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {taskChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Activity Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isAdmin() && <OnlineUsersWidget />}
        {isAdmin() && <RecentActivitiesWidget />}
        
        {/* Employee-specific widgets */}
        {!isAdmin() && (
          <>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                My Tasks Today
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Complete project documentation
                  </span>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    Pending
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Review team proposals
                  </span>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    In Progress
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Learning Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      React Development
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      UI/UX Design
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">40%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
