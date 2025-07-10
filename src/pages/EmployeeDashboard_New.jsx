import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import DatabaseService from '../services/databaseService';
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  UserGroupIcon,
  TrophyIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, isToday } from 'date-fns';
import toast from 'react-hot-toast';

export default function EmployeeDashboard() {
  const { user, userProfile, useFirebase } = useAuth();
  
  // State management
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
  
  const [attendanceStatus, setAttendanceStatus] = useState({
    isOnline: false,
    clockInTime: null
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user?.uid, useFirebase]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (useFirebase && user?.uid) {
        // Load real data from Firebase
        const [tasks, attendance, learningProgress, activities] = await Promise.all([
          DatabaseService.list(DatabaseService.COLLECTIONS.TASKS, {
            where: [{ field: 'assignedTo', operator: '==', value: user.uid }]
          }),
          DatabaseService.list(DatabaseService.COLLECTIONS.ATTENDANCE, {
            where: [{ field: 'employeeId', operator: '==', value: user.uid }]
          }),
          DatabaseService.list(DatabaseService.COLLECTIONS.LEARNING_PROGRESS, {
            where: [{ field: 'employeeId', operator: '==', value: user.uid }]
          }),
          DatabaseService.list(DatabaseService.COLLECTIONS.ACTIVITIES, {
            where: [{ field: 'employeeId', operator: '==', value: user.uid }],
            orderBy: [{ field: 'timestamp', direction: 'desc' }],
            limit: 10
          })
        ]);

        // Process stats
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const pendingTasks = tasks.filter(task => task.status === 'pending').length;
        
        const totalHours = attendance.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
        const todayAttendance = attendance.find(record => isToday(new Date(record.date)));
        const todayHours = todayAttendance?.hoursWorked || 0;
        
        const attendanceRate = Math.round((attendance.filter(record => record.isPresent).length / Math.max(attendance.length, 1)) * 100);
        
        const enrolledCourses = learningProgress.length;
        const completedCourses = learningProgress.filter(progress => progress.completionPercentage === 100).length;

        setEmployeeStats({
          attendanceRate,
          completedTasks,
          pendingTasks,
          totalHours: Math.round(totalHours),
          todayHours: Math.round(todayHours * 10) / 10,
          enrolledCourses,
          completedCourses,
          certificates: completedCourses
        });

        setRecentActivities(activities);
        setUpcomingTasks(tasks.filter(task => task.status === 'pending').slice(0, 5));
        
        // Generate attendance chart data
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
          const date = subDays(new Date(), i);
          const dayRecord = attendance.find(record => 
            format(new Date(record.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          );
          chartData.push({
            day: format(date, 'EEE'),
            hours: dayRecord?.hoursWorked || 0,
            present: dayRecord?.isPresent ? 1 : 0
          });
        }
        setAttendanceData(chartData);

        // Check current clock-in status
        const clockInData = localStorage.getItem(`clockIn_${user.uid}`);
        if (clockInData) {
          const { clockInTime } = JSON.parse(clockInData);
          setAttendanceStatus({
            isOnline: true,
            clockInTime: new Date(clockInTime)
          });
        }

      } else {
        // Demo data
        setEmployeeStats({
          attendanceRate: 92,
          completedTasks: 28,
          pendingTasks: 7,
          totalHours: 156,
          todayHours: 6.5,
          enrolledCourses: 4,
          completedCourses: 2,
          certificates: 2
        });

        setRecentActivities([
          { id: 1, action: 'Completed task: Website Design Review', timestamp: new Date(), type: 'task' },
          { id: 2, action: 'Clocked in for today', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), type: 'attendance' },
          { id: 3, action: 'Started course: React Advanced Concepts', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), type: 'learning' },
        ]);

        setUpcomingTasks([
          { id: 1, title: 'Prepare monthly report', dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), priority: 'high' },
          { id: 2, title: 'Review team proposals', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), priority: 'medium' },
          { id: 3, title: 'Update project documentation', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), priority: 'low' },
        ]);

        const chartData = [];
        for (let i = 6; i >= 0; i--) {
          const date = subDays(new Date(), i);
          chartData.push({
            day: format(date, 'EEE'),
            hours: Math.random() * 8 + 2,
            present: Math.random() > 0.1 ? 1 : 0
          });
        }
        setAttendanceData(chartData);
      }

      setNotifications([
        { id: 1, title: 'New task assigned', message: 'You have a new task assigned for this week', type: 'info' },
        { id: 2, title: 'Course deadline approaching', message: 'Complete React course by Friday', type: 'warning' }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Clock In/Out',
      description: 'Manage your attendance',
      icon: ClockIcon,
      link: '/attendance',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'View Tasks',
      description: 'Check your assigned tasks',
      icon: CheckCircleIcon,
      link: '/tasks',
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Team Chat',
      description: 'Connect with your team',
      icon: ChatBubbleLeftRightIcon,
      link: '/chat',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Learning Hub',
      description: 'Continue your courses',
      icon: AcademicCapIcon,
      link: '/learning',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50'
    }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {userProfile?.displayName || 'Employee'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Here's your dashboard overview for {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </p>
          {attendanceStatus.isOnline && (
            <div className="mt-4 flex items-center text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              You're currently clocked in since {format(attendanceStatus.clockInTime, 'h:mm a')}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{employeeStats.attendanceRate}%</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <CalendarDaysIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{employeeStats.completedTasks}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hours Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{employeeStats.todayHours}h</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <ClockIcon className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Courses Enrolled</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{employeeStats.enrolledCourses}</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <AcademicCapIcon className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                <div className={`p-3 ${action.bgColor} dark:bg-gray-700 rounded-lg mb-4 w-fit`}>
                  <action.icon className={`h-6 w-6 ${action.color.replace('bg-', 'text-')}`} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{action.description}</p>
                <div className="flex items-center mt-3 text-blue-600 dark:text-blue-400 text-sm font-medium">
                  Go to {action.title.toLowerCase()}
                  <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Charts and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Attendance Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Weekly Attendance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" className="text-gray-600 dark:text-gray-400" />
                  <YAxis className="text-gray-600 dark:text-gray-400" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgb(31 41 55)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Bar dataKey="hours" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Activities</h3>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'task' ? 'bg-green-100 text-green-600' :
                    activity.type === 'attendance' ? 'bg-blue-100 text-blue-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {activity.type === 'task' && <CheckCircleIcon className="h-4 w-4" />}
                    {activity.type === 'attendance' && <ClockIcon className="h-4 w-4" />}
                    {activity.type === 'learning' && <AcademicCapIcon className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">{activity.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {format(new Date(activity.timestamp), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activities</p>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Tasks and Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Tasks */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h3>
              <Link to="/tasks" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
              {upcomingTasks.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming tasks</p>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Notifications</h3>
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`p-2 rounded-full ${
                    notification.type === 'info' ? 'bg-blue-100 text-blue-600' :
                    notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <BellIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.message}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No new notifications</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
