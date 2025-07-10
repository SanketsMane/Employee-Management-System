import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DatabaseService from '../../services/databaseService';
import ManageEmployees from './ManageEmployees';
import ManageBatches from './ManageBatches';
import AssignBatchTask from './AssignBatchTask';
import AssignIndividualTask from './AssignIndividualTask';
import LearningLibrary from './LearningLibrary';
import ExportReports from './ExportReports';
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  BookOpenIcon,
  DocumentArrowDownIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  TrophyIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth, subDays, addDays } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, userProfile, isAdmin, useFirebase } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [onlineEmployees, setOnlineEmployees] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalEmployees: 0,
    onlineEmployees: 0,
    totalBatches: 0,
    activeTasks: 0,
    completedTasks: 0,
    pendingRequests: 0,
    learningMaterials: 0,
    monthlyAttendance: 0
  });
  const [chartData, setChartData] = useState({
    attendanceChart: [],
    taskChart: [],
    performanceChart: [],
    departmentChart: []
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'dashboard', name: 'Dashboard Overview', icon: HomeIcon },
    { id: 'employees', name: 'Manage Employees', icon: UsersIcon },
    { id: 'batches', name: 'Manage Batches', icon: UserGroupIcon },
    { id: 'batch-tasks', name: 'Assign Batch Tasks', icon: ClipboardDocumentListIcon },
    { id: 'individual-tasks', name: 'Individual Tasks & Chat', icon: ClipboardDocumentCheckIcon },
    { id: 'learning', name: 'Learning Library', icon: BookOpenIcon },
    { id: 'reports', name: 'Export Reports', icon: DocumentArrowDownIcon }
  ];

  useEffect(() => {
    if (!isAdmin()) {
      toast.error('Access denied. Admin privileges required.');
      return;
    }
    loadAdminData();
    loadOnlineEmployees();
    
    // Set up real-time listeners
    const interval = setInterval(() => {
      loadOnlineEmployees();
      loadRecentActivities();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [user?.uid, useFirebase]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      if (useFirebase) {
        // Load real data from Firebase
        const [employees, batches, tasks, attendance] = await Promise.all([
          DatabaseService.list(DatabaseService.COLLECTIONS.USERS, {
            where: [{ field: 'role', operator: '==', value: 'employee' }]
          }),
          DatabaseService.list(DatabaseService.COLLECTIONS.BATCHES),
          DatabaseService.list(DatabaseService.COLLECTIONS.TASKS),
          DatabaseService.list(DatabaseService.COLLECTIONS.ATTENDANCE)
        ]);

        const stats = {
          totalEmployees: employees.length,
          onlineEmployees: employees.filter(emp => emp.isOnline).length,
          totalBatches: batches.length,
          activeTasks: tasks.filter(task => task.status === 'in_progress').length,
          completedTasks: tasks.filter(task => task.status === 'completed').length,
          pendingRequests: batches.reduce((sum, batch) => sum + (batch.pendingRequests?.length || 0), 0),
          learningMaterials: 25, // This would come from learning materials collection
          monthlyAttendance: Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
        };

        setAdminStats(stats);
      } else {
        // Demo data
        setAdminStats({
          totalEmployees: 45,
          onlineEmployees: 28,
          totalBatches: 8,
          activeTasks: 23,
          completedTasks: 156,
          pendingRequests: 7,
          learningMaterials: 25,
          monthlyAttendance: 94
        });

        // Demo chart data
        setChartData({
          attendanceChart: [
            { name: 'Mon', present: 42, absent: 3 },
            { name: 'Tue', present: 38, absent: 7 },
            { name: 'Wed', present: 41, absent: 4 },
            { name: 'Thu', present: 39, absent: 6 },
            { name: 'Fri', present: 43, absent: 2 },
            { name: 'Sat', present: 25, absent: 20 },
            { name: 'Sun', present: 0, absent: 45 }
          ],
          taskChart: [
            { name: 'Completed', value: 156, color: '#10B981' },
            { name: 'In Progress', value: 23, color: '#3B82F6' },
            { name: 'Pending', value: 12, color: '#F59E0B' },
            { name: 'Overdue', value: 5, color: '#EF4444' }
          ],
          performanceChart: [
            { month: 'Jan', efficiency: 85, satisfaction: 90 },
            { month: 'Feb', efficiency: 88, satisfaction: 92 },
            { month: 'Mar', efficiency: 92, satisfaction: 89 },
            { month: 'Apr', efficiency: 90, satisfaction: 94 },
            { month: 'May', efficiency: 94, satisfaction: 96 },
            { month: 'Jun', efficiency: 96, satisfaction: 95 }
          ],
          departmentChart: [
            { name: 'Development', value: 15, color: '#3B82F6' },
            { name: 'Design', value: 8, color: '#10B981' },
            { name: 'Marketing', value: 12, color: '#F59E0B' },
            { name: 'HR', value: 6, color: '#8B5CF6' },
            { name: 'Sales', value: 4, color: '#EF4444' }
          ]
        });
      }

      loadRecentActivities();
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadOnlineEmployees = async () => {
    try {
      if (useFirebase) {
        // Real-time online status would be implemented with Firebase Realtime Database
        const onlineUsers = await DatabaseService.list(DatabaseService.COLLECTIONS.USERS, {
          where: [
            { field: 'role', operator: '==', value: 'employee' },
            { field: 'isOnline', operator: '==', value: true }
          ]
        });
        setOnlineEmployees(onlineUsers);
      } else {
        // Demo online employees
        const demoOnlineEmployees = [
          { id: 'emp1', name: 'John Doe', department: 'Development', lastSeen: new Date() },
          { id: 'emp2', name: 'Jane Smith', department: 'Design', lastSeen: new Date() },
          { id: 'emp3', name: 'Mike Johnson', department: 'Marketing', lastSeen: new Date() },
          { id: 'emp4', name: 'Sarah Wilson', department: 'HR', lastSeen: new Date() }
        ];
        setOnlineEmployees(demoOnlineEmployees);
      }
    } catch (error) {
      console.error('Error loading online employees:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      if (useFirebase) {
        const activities = await DatabaseService.list(DatabaseService.COLLECTIONS.ACTIVITY_LOGS, {
          orderBy: [{ field: 'timestamp', direction: 'desc' }],
          limit: 10
        });
        setRecentActivities(activities);
      } else {
        // Demo activities
        const demoActivities = [
          {
            id: 1,
            type: 'task_completed',
            user: 'John Doe',
            description: 'completed task "API Integration"',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            icon: '✅'
          },
          {
            id: 2,
            type: 'batch_joined',
            user: 'Jane Smith',
            description: 'joined React Development Batch',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            icon: '👥'
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
          }
        ];
        setRecentActivities(demoActivities);
      }
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // You can also persist this to localStorage or user preferences
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Employees</dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">{adminStats.totalEmployees}</dd>
                  <dd className="text-sm text-green-600 dark:text-green-400">{adminStats.onlineEmployees} online now</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Batches</dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">{adminStats.totalBatches}</dd>
                  <dd className="text-sm text-purple-600 dark:text-purple-400">{adminStats.pendingRequests} pending requests</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Tasks Completed</dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">{adminStats.completedTasks}</dd>
                  <dd className="text-sm text-orange-600 dark:text-orange-400">{adminStats.activeTasks} active</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Attendance Rate</dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">{adminStats.monthlyAttendance}%</dd>
                  <dd className="text-sm text-green-600 dark:text-green-400">This month</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.attendanceChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" fill="#10B981" name="Present" />
              <Bar dataKey="absent" fill="#EF4444" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Distribution */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.taskChart}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.taskChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData.performanceChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="efficiency"
              stackId="1"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.6}
              name="Efficiency %"
            />
            <Area
              type="monotone"
              dataKey="satisfaction"
              stackId="2"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
              name="Satisfaction %"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Online Employees & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Online Employees */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Online Employees</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Live</span>
            </div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {onlineEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {employee.name.charAt(0)}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {employee.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {employee.department}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activities</h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs">
                    {activity.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{activity.user}</span> {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(activity.timestamp), 'MMM dd, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardOverview();
      case 'employees':
        return <ManageEmployees />;
      case 'batches':
        return <ManageBatches />;
      case 'batch-tasks':
        return <AssignBatchTask />;
      case 'individual-tasks':
        return <AssignIndividualTask />;
      case 'learning':
        return <LearningLibrary />;
      case 'reports':
        return <ExportReports />;
      default:
        return renderDashboardOverview();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getCurrentGreeting()}, {userProfile?.displayName || user?.displayName || 'Admin'}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {format(new Date(), 'EEEE, MMMM dd, yyyy')} • {format(new Date(), 'h:mm a')}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {darkMode ? (
                    <SunIcon className="h-6 w-6" />
                  ) : (
                    <MoonIcon className="h-6 w-6" />
                  )}
                </button>
                
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {adminStats.pendingRequests}
                  </span>
                </button>
                
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Cog6ToothIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
}
      if (useFirebase) {
        await loadFirebaseData();
      } else {
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DatabaseService from '../../services/databaseService';
import ManageEmployees from './ManageEmployees';
import ManageBatches from './ManageBatches';
import AssignBatchTask from './AssignBatchTask';
import AssignIndividualTask from './AssignIndividualTask';
import LearningLibrary from './LearningLibrary';
import ExportReports from './ExportReports';
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  BookOpenIcon,
  DocumentArrowDownIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  TrophyIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth, subDays, addDays } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, userProfile, isAdmin, useFirebase } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [onlineEmployees, setOnlineEmployees] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalEmployees: 0,
    onlineEmployees: 0,
    totalBatches: 0,
    activeTasks: 0,
    completedTasks: 0,
    pendingRequests: 0,
    learningMaterials: 0,
    monthlyAttendance: 0
  });
  const [chartData, setChartData] = useState({
    attendanceChart: [],
    taskChart: [],
    performanceChart: [],
    departmentChart: []
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'dashboard', name: 'Dashboard Overview', icon: HomeIcon },
    { id: 'employees', name: 'Manage Employees', icon: UsersIcon },
    { id: 'batches', name: 'Manage Batches', icon: UserGroupIcon },
    { id: 'batch-tasks', name: 'Assign Batch Tasks', icon: ClipboardDocumentListIcon },
    { id: 'individual-tasks', name: 'Individual Tasks & Chat', icon: ClipboardDocumentCheckIcon },
    { id: 'learning', name: 'Learning Library', icon: BookOpenIcon },
    { id: 'reports', name: 'Export Reports', icon: DocumentArrowDownIcon }
  ];

  useEffect(() => {
    if (!isAdmin()) {
      toast.error('Access denied. Admin privileges required.');
      return;
    }
    loadAdminData();
    loadOnlineEmployees();
    
    // Set up real-time listeners
    const interval = setInterval(() => {
      loadOnlineEmployees();
      loadRecentActivities();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [user?.uid, useFirebase]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      if (useFirebase) {
        // Load real data from Firebase
        const [employees, batches, tasks, attendance] = await Promise.all([
          DatabaseService.list(DatabaseService.COLLECTIONS.USERS, {
            where: [{ field: 'role', operator: '==', value: 'employee' }]
          }),
          DatabaseService.list(DatabaseService.COLLECTIONS.BATCHES),
          DatabaseService.list(DatabaseService.COLLECTIONS.TASKS),
          DatabaseService.list(DatabaseService.COLLECTIONS.ATTENDANCE)
        ]);

        const stats = {
          totalEmployees: employees.length,
          onlineEmployees: employees.filter(emp => emp.isOnline).length,
          totalBatches: batches.length,
          activeTasks: tasks.filter(task => task.status === 'in_progress').length,
          completedTasks: tasks.filter(task => task.status === 'completed').length,
          pendingRequests: batches.reduce((sum, batch) => sum + (batch.pendingRequests?.length || 0), 0),
          learningMaterials: 25, // This would come from learning materials collection
          monthlyAttendance: Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
        };

        setAdminStats(stats);
      } else {
        // Demo data
        setAdminStats({
          totalEmployees: 45,
          onlineEmployees: 28,
          totalBatches: 8,
          activeTasks: 23,
          completedTasks: 156,
          pendingRequests: 7,
          learningMaterials: 25,
          monthlyAttendance: 94
        });

        // Demo chart data
        setChartData({
          attendanceChart: [
            { name: 'Mon', present: 42, absent: 3 },
            { name: 'Tue', present: 38, absent: 7 },
            { name: 'Wed', present: 41, absent: 4 },
            { name: 'Thu', present: 39, absent: 6 },
            { name: 'Fri', present: 43, absent: 2 },
            { name: 'Sat', present: 25, absent: 20 },
            { name: 'Sun', present: 0, absent: 45 }
          ],
          taskChart: [
            { name: 'Completed', value: 156, color: '#10B981' },
            { name: 'In Progress', value: 23, color: '#3B82F6' },
            { name: 'Pending', value: 12, color: '#F59E0B' },
            { name: 'Overdue', value: 5, color: '#EF4444' }
          ],
          performanceChart: [
            { month: 'Jan', efficiency: 85, satisfaction: 90 },
            { month: 'Feb', efficiency: 88, satisfaction: 92 },
            { month: 'Mar', efficiency: 92, satisfaction: 89 },
            { month: 'Apr', efficiency: 90, satisfaction: 94 },
            { month: 'May', efficiency: 94, satisfaction: 96 },
            { month: 'Jun', efficiency: 96, satisfaction: 95 }
          ],
          departmentChart: [
            { name: 'Development', value: 15, color: '#3B82F6' },
            { name: 'Design', value: 8, color: '#10B981' },
            { name: 'Marketing', value: 12, color: '#F59E0B' },
            { name: 'HR', value: 6, color: '#8B5CF6' },
            { name: 'Sales', value: 4, color: '#EF4444' }
          ]
        });
      }

      loadRecentActivities();
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadOnlineEmployees = async () => {
    try {
      if (useFirebase) {
        // Real-time online status would be implemented with Firebase Realtime Database
        const onlineUsers = await DatabaseService.list(DatabaseService.COLLECTIONS.USERS, {
          where: [
            { field: 'role', operator: '==', value: 'employee' },
            { field: 'isOnline', operator: '==', value: true }
          ]
        });
        setOnlineEmployees(onlineUsers);
      } else {
        // Demo online employees
        const demoOnlineEmployees = [
          { id: 'emp1', name: 'John Doe', department: 'Development', lastSeen: new Date() },
          { id: 'emp2', name: 'Jane Smith', department: 'Design', lastSeen: new Date() },
          { id: 'emp3', name: 'Mike Johnson', department: 'Marketing', lastSeen: new Date() },
          { id: 'emp4', name: 'Sarah Wilson', department: 'HR', lastSeen: new Date() }
        ];
        setOnlineEmployees(demoOnlineEmployees);
      }
    } catch (error) {
      console.error('Error loading online employees:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      if (useFirebase) {
        const activities = await DatabaseService.list(DatabaseService.COLLECTIONS.ACTIVITY_LOGS, {
          orderBy: [{ field: 'timestamp', direction: 'desc' }],
          limit: 10
        });
        setRecentActivities(activities);
      } else {
        // Demo activities
        const demoActivities = [
          {
            id: 1,
            type: 'task_completed',
            user: 'John Doe',
            description: 'completed task "API Integration"',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            icon: '✅'
          },
          {
            id: 2,
            type: 'batch_joined',
            user: 'Jane Smith',
            description: 'joined React Development Batch',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            icon: '👥'
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
          }
        ];
        setRecentActivities(demoActivities);
      }
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // You can also persist this to localStorage or user preferences
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Employees</dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">{adminStats.totalEmployees}</dd>
                  <dd className="text-sm text-green-600 dark:text-green-400">{adminStats.onlineEmployees} online now</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Batches</dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">{adminStats.totalBatches}</dd>
                  <dd className="text-sm text-purple-600 dark:text-purple-400">{adminStats.pendingRequests} pending requests</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Tasks Completed</dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">{adminStats.completedTasks}</dd>
                  <dd className="text-sm text-orange-600 dark:text-orange-400">{adminStats.activeTasks} active</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Attendance Rate</dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">{adminStats.monthlyAttendance}%</dd>
                  <dd className="text-sm text-green-600 dark:text-green-400">This month</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.attendanceChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" fill="#10B981" name="Present" />
              <Bar dataKey="absent" fill="#EF4444" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Distribution */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.taskChart}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.taskChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData.performanceChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="efficiency"
              stackId="1"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.6}
              name="Efficiency %"
            />
            <Area
              type="monotone"
              dataKey="satisfaction"
              stackId="2"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
              name="Satisfaction %"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Online Employees & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Online Employees */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Online Employees</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Live</span>
            </div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {onlineEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {employee.name.charAt(0)}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {employee.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {employee.department}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activities</h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs">
                    {activity.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{activity.user}</span> {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(activity.timestamp), 'MMM dd, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardOverview();
      case 'employees':
        return <ManageEmployees />;
      case 'batches':
        return <ManageBatches />;
      case 'batch-tasks':
        return <AssignBatchTask />;
      case 'individual-tasks':
        return <AssignIndividualTask />;
      case 'learning':
        return <LearningLibrary />;
      case 'reports':
        return <ExportReports />;
      default:
        return renderDashboardOverview();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getCurrentGreeting()}, {userProfile?.displayName || user?.displayName || 'Admin'}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {format(new Date(), 'EEEE, MMMM dd, yyyy')} • {format(new Date(), 'h:mm a')}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {darkMode ? (
                    <SunIcon className="h-6 w-6" />
                  ) : (
                    <MoonIcon className="h-6 w-6" />
                  )}
                </button>
                
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {adminStats.pendingRequests}
                  </span>
                </button>
                
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Cog6ToothIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
}
      activeEmployees,
      totalBatches: batches.length,
      activeBatches,
      completedTrainings,
      pendingApprovals,
      systemAlerts,
      monthlyRevenue: Math.floor(Math.random() * 300000) + 200000 // Mock revenue
    });

    // Set recent activities from activity logs
    setRecentActivities(activityLogs.slice(0, 10).map(log => ({
      id: log.id,
      type: log.action,
      message: log.details,
      timestamp: log.timestamp?.toDate() || new Date(),
      user: log.userId || 'System',
      action: log.action
    })));

    // Calculate employee statistics by department
    const departmentStats = employees.reduce((acc, emp) => {
      const dept = emp.department || 'Unknown';
      if (!acc[dept]) {
        acc[dept] = { count: 0, totalPerformance: 0 };
      }
      acc[dept].count++;
      acc[dept].totalPerformance += emp.performanceScore || 85; // Default score
      return acc;
    }, {});

    setEmployeeStats(Object.entries(departmentStats).map(([dept, stats]) => ({
      department: dept,
      employees: stats.count,
      performance: Math.round(stats.totalPerformance / stats.count)
    })));

    // Generate performance data for charts
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date: format(date, 'MMM dd'),
        users: Math.floor(Math.random() * 50) + 100,
        completions: Math.floor(Math.random() * 30) + 40,
        revenue: Math.floor(Math.random() * 15000) + 5000
      };
    }).reverse();

    setPerformanceData(last30Days);
  };

  const loadDemoData = async () => {
    // Simulate API calls
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock admin statistics
    setAdminStats({
      totalEmployees: 156,
      activeEmployees: 142,
      totalBatches: 24,
      activeBatches: 8,
      completedTrainings: 89,
      pendingApprovals: 12,
      systemAlerts: 3,
      monthlyRevenue: 245000
    });

    // Mock recent activities
    setRecentActivities([
      {
        id: 1,
        type: 'user_registered',
        message: 'John Doe registered for React Advanced Course',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        user: 'John Doe',
        action: 'Registration'
      },
      {
        id: 2,
        type: 'batch_completed',
        message: 'UI/UX Design Batch completed with 95% success rate',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        user: 'System',
        action: 'Batch Completion'
      },
      {
        id: 3,
        type: 'approval_pending',
        message: 'New training batch requires approval',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        user: 'Sarah Wilson',
        action: 'Approval Required'
      },
      {
        id: 4,
        type: 'employee_promoted',
        message: 'Alice Johnson promoted to Senior Developer',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        user: 'HR Department',
        action: 'Promotion'
      }
    ]);

    // Mock employee performance data
    setEmployeeStats([
      { department: 'Development', employees: 45, performance: 92 },
      { department: 'Design', employees: 28, performance: 88 },
      { department: 'Marketing', employees: 32, performance: 85 },
      { department: 'Sales', employees: 25, performance: 90 },
      { department: 'HR', employees: 12, performance: 87 },
      { department: 'Finance', employees: 14, performance: 91 }
    ]);

    // Mock performance data
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date: format(date, 'MMM dd'),
        users: Math.floor(Math.random() * 50) + 100,
        completions: Math.floor(Math.random() * 30) + 40,
        revenue: Math.floor(Math.random() * 15000) + 5000
      };
    }).reverse();

    setPerformanceData(last30Days);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registered': return <UsersIcon className="h-5 w-5 text-blue-500" />;
      case 'batch_completed': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'approval_pending': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'employee_promoted': return <AcademicCapIcon className="h-5 w-5 text-purple-500" />;
      default: return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Welcome back, {userProfile?.displayName || 'Administrator'}! Here's what's happening in your organization.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export Report
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <CogIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Admin Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 rounded-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{adminStats.totalEmployees}</p>
                <p className="text-sm text-green-600 dark:text-green-400">+12% from last month</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Batches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{adminStats.activeBatches}</p>
                <p className="text-sm text-green-600 dark:text-green-400">+8% from last month</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <AcademicCapIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{adminStats.pendingApprovals}</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Requires attention</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{adminStats.systemAlerts}</p>
                <p className="text-sm text-red-600 dark:text-red-400">Active alerts</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <ShieldCheckIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Department Performance */}
          <div className="glass-card p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Department Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="performance" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Trends */}
          <div className="glass-card p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Performance Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completion" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="efficiency" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="glass-card p-6 rounded-xl border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.message}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.user}
                    </p>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(activity.timestamp, 'h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {activity.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6 rounded-xl border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-all duration-200">
              <UsersIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Add Employee</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/30 dark:hover:to-green-700/30 transition-all duration-200">
              <AcademicCapIcon className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Create Batch</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/30 dark:hover:to-purple-700/30 transition-all duration-200">
              <ChartBarIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">View Reports</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg hover:from-yellow-100 hover:to-yellow-200 dark:hover:from-yellow-800/30 dark:hover:to-yellow-700/30 transition-all duration-200">
              <ClockIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Approvals</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg hover:from-red-100 hover:to-red-200 dark:hover:from-red-800/30 dark:hover:to-red-700/30 transition-all duration-200">
              <BellIcon className="h-8 w-8 text-red-600 dark:text-red-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Alerts</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-lg hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700/30 dark:hover:to-gray-600/30 transition-all duration-200">
              <CogIcon className="h-8 w-8 text-gray-600 dark:text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Settings</span>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
