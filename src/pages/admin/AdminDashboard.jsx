import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../../components/Footer';
import DatabaseService from '../../services/databaseService';
import { exportAttendanceToExcel, exportTaskPerformanceToExcel } from '../../services/excelService';
import { 
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  BellIcon,
  AcademicCapIcon,
  ArrowDownTrayIcon,
  CogIcon,
  ShieldCheckIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  UserGroupIcon,
  PlayIcon,
  PauseIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  Area,
  AreaChart
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday } from 'date-fns';
import toast from 'react-hot-toast';

// Import all admin components
import ManageEmployees from './ManageEmployees';
import ManageBatches from './ManageBatches';
import AssignBatchTask from './AssignBatchTask';
import AssignIndividualTask from './AssignIndividualTask';
import LearningLibrary from './LearningLibrary';
import ExportReports from './ExportReports';

export default function AdminDashboard() {
  const { user, userProfile, isAdmin, useFirebase, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Dashboard State
  const [adminStats, setAdminStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    onlineEmployees: 0,
    totalBatches: 0,
    activeBatches: 0,
    pendingRequests: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalLearningMaterials: 0,
    systemAlerts: 0,
    weeklyTaskCompletion: 0,
    monthlyTaskCompletion: 0
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [employeeStatusData, setEmployeeStatusData] = useState([]);
  const [taskCompletionData, setTaskCompletionData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [absentEmployees, setAbsentEmployees] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Real-time data
  const [onlineEmployeesList, setOnlineEmployeesList] = useState([]);
  const socketRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isAdmin()) {
      toast.error('Access denied. Admin privileges required.');
      return;
    }
    
    initializeAdminDashboard();
    startTimeTracking();
    initializeRealTimeFeatures();
    
    return () => {
      cleanup();
    };
  }, [user?.uid, useFirebase]);

  const initializeAdminDashboard = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAdminStats(),
        loadRecentActivities(),
        loadTaskCompletionData(),
        loadAttendanceData(),
        loadAbsentEmployees(),
        loadNotifications()
      ]);
    } catch (error) {
      console.error('Error initializing admin dashboard:', error);
      toast.error('Failed to load admin dashboard');
      await loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const startTimeTracking = () => {
    intervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
  };

  const initializeRealTimeFeatures = () => {
    // Initialize WebSocket connection for real-time updates
    if (typeof window !== 'undefined') {
      // Socket.IO would be implemented here in a real application
      console.log('Real-time features initialized');
      
      // Simulate real-time employee status updates
      setInterval(() => {
        updateOnlineEmployees();
      }, 30000); // Update every 30 seconds
    }
  };

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const loadAdminStats = async () => {
    try {
      if (useFirebase && user?.uid) {
        // Load real data from Firebase
        const [employees, batches, tasks, requests, materials] = await Promise.all([
          DatabaseService.list(DatabaseService.COLLECTIONS.USERS, {
            where: [{ field: 'role', operator: '==', value: 'employee' }]
          }),
          DatabaseService.list(DatabaseService.COLLECTIONS.BATCHES),
          DatabaseService.list(DatabaseService.COLLECTIONS.TASKS),
          DatabaseService.list(DatabaseService.COLLECTIONS.BATCH_REQUESTS, {
            where: [{ field: 'status', operator: '==', value: 'pending' }]
          }),
          DatabaseService.list(DatabaseService.COLLECTIONS.LEARNING_MATERIALS)
        ]);

        const activeEmployees = employees.filter(emp => emp.status === 'active').length;
        const onlineEmployees = employees.filter(emp => emp.isOnline).length;
        const activeBatches = batches.filter(batch => batch.status === 'active').length;
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const pendingTasks = tasks.filter(task => task.status === 'pending').length;

        // Calculate weekly and monthly completion rates
        const weekStart = startOfWeek(new Date());
        const weekEnd = endOfWeek(new Date());
        const monthStart = startOfMonth(new Date());
        const monthEnd = endOfMonth(new Date());

        const weeklyTasks = tasks.filter(task => {
          const taskDate = new Date(task.createdAt);
          return taskDate >= weekStart && taskDate <= weekEnd;
        });
        
        const monthlyTasks = tasks.filter(task => {
          const taskDate = new Date(task.createdAt);
          return taskDate >= monthStart && taskDate <= monthEnd;
        });

        const weeklyCompletion = weeklyTasks.length > 0 ? 
          Math.round((weeklyTasks.filter(t => t.status === 'completed').length / weeklyTasks.length) * 100) : 0;
        
        const monthlyCompletion = monthlyTasks.length > 0 ? 
          Math.round((monthlyTasks.filter(t => t.status === 'completed').length / monthlyTasks.length) * 100) : 0;

        setAdminStats({
          totalEmployees: employees.length,
          activeEmployees,
          onlineEmployees,
          totalBatches: batches.length,
          activeBatches,
          pendingRequests: requests.length,
          completedTasks,
          pendingTasks,
          totalLearningMaterials: materials.length,
          systemAlerts: 3, // This would be calculated based on actual system conditions
          weeklyTaskCompletion: weeklyCompletion,
          monthlyTaskCompletion: monthlyCompletion
        });

        setOnlineEmployeesList(employees.filter(emp => emp.isOnline));
      } else {
        loadDemoStats();
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
      loadDemoStats();
    }
  };

  const loadDemoStats = () => {
    setAdminStats({
      totalEmployees: 156,
      activeEmployees: 142,
      onlineEmployees: 89,
      totalBatches: 24,
      activeBatches: 18,
      pendingRequests: 12,
      completedTasks: 342,
      pendingTasks: 67,
      totalLearningMaterials: 45,
      systemAlerts: 3,
      weeklyTaskCompletion: 78,
      monthlyTaskCompletion: 82
    });

    setOnlineEmployeesList([
      { id: 1, name: 'John Doe', department: 'Development', status: 'online' },
      { id: 2, name: 'Jane Smith', department: 'Design', status: 'online' },
      { id: 3, name: 'Mike Johnson', department: 'Marketing', status: 'online' },
      { id: 4, name: 'Sarah Wilson', department: 'HR', status: 'online' },
    ]);
  };

  const loadRecentActivities = async () => {
    try {
      if (useFirebase) {
        const activities = await DatabaseService.list(DatabaseService.COLLECTIONS.ACTIVITIES, {
          orderBy: [{ field: 'timestamp', direction: 'desc' }],
          limit: 10
        });
        setRecentActivities(activities);
      } else {
        setRecentActivities([
          {
            id: 1,
            type: 'employee_login',
            message: 'John Doe logged in',
            user: 'John Doe',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            action: 'Login'
          },
          {
            id: 2,
            type: 'task_completed',
            message: 'React Tutorial task completed by Jane Smith',
            user: 'Jane Smith',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            action: 'Task Completion'
          },
          {
            id: 3,
            type: 'batch_request',
            message: 'New batch join request from Mike Johnson',
            user: 'Mike Johnson',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            action: 'Batch Request'
          },
          {
            id: 4,
            type: 'material_uploaded',
            message: 'New learning material uploaded: Advanced React Patterns',
            user: 'Admin',
            timestamp: new Date(Date.now() - 45 * 60 * 1000),
            action: 'Upload'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  const loadTaskCompletionData = () => {
    // Generate task completion data for the last 7 days
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      data.push({
        day: format(date, 'EEE'),
        completed: Math.floor(Math.random() * 30) + 20,
        pending: Math.floor(Math.random() * 15) + 5,
        total: Math.floor(Math.random() * 50) + 30
      });
    }
    setTaskCompletionData(data);
  };

  const loadAttendanceData = () => {
    // Generate attendance data for the last 30 days
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      data.push({
        date: format(date, 'MMM dd'),
        present: Math.floor(Math.random() * 20) + 120,
        absent: Math.floor(Math.random() * 10) + 5,
        late: Math.floor(Math.random() * 8) + 2
      });
    }
    setAttendanceData(data);
  };

  const loadAbsentEmployees = async () => {
    try {
      if (useFirebase) {
        const today = format(new Date(), 'yyyy-MM-dd');
        const allEmployees = await DatabaseService.list(DatabaseService.COLLECTIONS.USERS, {
          where: [{ field: 'role', operator: '==', value: 'employee' }]
        });
        
        const todayAttendance = await DatabaseService.list(DatabaseService.COLLECTIONS.ATTENDANCE, {
          where: [{ field: 'date', operator: '==', value: today }]
        });
        
        const presentEmployeeIds = todayAttendance.map(att => att.employeeId);
        const absentToday = allEmployees.filter(emp => !presentEmployeeIds.includes(emp.id));
        
        setAbsentEmployees(absentToday);
      } else {
        // Demo data for employees who didn't log in today
        setAbsentEmployees([
          { id: 1, name: 'Robert Brown', department: 'Finance', email: 'robert@company.com' },
          { id: 2, name: 'Lisa Davis', department: 'Operations', email: 'lisa@company.com' },
          { id: 3, name: 'Tom Wilson', department: 'Sales', email: 'tom@company.com' }
        ]);
      }
    } catch (error) {
      console.error('Error loading absent employees:', error);
    }
  };

  const loadNotifications = () => {
    const mockNotifications = [
      {
        id: 1,
        title: 'System Maintenance',
        message: 'Scheduled maintenance tonight at 2 AM',
        type: 'warning',
        timestamp: new Date(),
        read: false
      },
      {
        id: 2,
        title: 'New Batch Request',
        message: '5 new batch join requests pending approval',
        type: 'info',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false
      },
      {
        id: 3,
        title: 'Task Deadline Alert',
        message: '12 tasks are due tomorrow',
        type: 'urgent',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: true
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadNotifications(mockNotifications.filter(n => !n.read).length);
  };

  const loadDemoData = async () => {
    loadDemoStats();
    await loadRecentActivities();
    loadTaskCompletionData();
    loadAttendanceData();
    await loadAbsentEmployees();
    loadNotifications();
  };

  const updateOnlineEmployees = () => {
    // Simulate real-time employee status updates
    const currentOnline = adminStats.onlineEmployees;
    const randomChange = Math.floor(Math.random() * 6) - 3; // -3 to +3
    const newOnlineCount = Math.max(0, Math.min(adminStats.totalEmployees, currentOnline + randomChange));
    
    setAdminStats(prev => ({
      ...prev,
      onlineEmployees: newOnlineCount
    }));
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'employee_login': return <UsersIcon className="h-5 w-5 text-green-500" />;
      case 'task_completed': return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'batch_request': return <UserGroupIcon className="h-5 w-5 text-yellow-500" />;
      case 'material_uploaded': return <DocumentTextIcon className="h-5 w-5 text-purple-500" />;
      default: return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleExportAttendance = async (dateRange) => {
    try {
      toast.loading('Generating attendance report...');
      const { startDate, endDate } = dateRange;
      await exportAttendanceToExcel(startDate, endDate);
      toast.dismiss();
      toast.success('Attendance report exported successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export attendance report');
      console.error('Export error:', error);
    }
  };

  const handleExportTasks = async (dateRange, type) => {
    try {
      toast.loading('Generating task performance report...');
      const { startDate, endDate } = dateRange;
      await exportTaskPerformanceToExcel(startDate, endDate, type);
      toast.dismiss();
      toast.success('Task performance report exported successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export task performance report');
      console.error('Export error:', error);
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'employees', name: 'Manage Employees', icon: UsersIcon },
    { id: 'batches', name: 'Manage Batches', icon: UserGroupIcon },
    { id: 'batch-tasks', name: 'Assign Batch Tasks', icon: CheckCircleIcon },
    { id: 'individual-tasks', name: 'Individual Tasks', icon: DocumentTextIcon },
    { id: 'learning', name: 'Learning Library', icon: AcademicCapIcon },
    { id: 'reports', name: 'Export Reports', icon: ArrowDownTrayIcon }
  ];

  const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header with Greeting and Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {getGreeting()}, {userProfile?.displayName || 'Administrator'}! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {format(currentTime, 'EEEE, MMMM do, yyyy • h:mm:ss a')}
            </p>
            <div className="flex items-center mt-3 space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  System Online
                </span>
              </div>
              <div className="flex items-center">
                <UsersIcon className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {adminStats.onlineEmployees} employees online
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <BellIcon className="h-6 w-6" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{adminStats.totalEmployees}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-green-600 dark:text-green-400">
                  {adminStats.activeEmployees} active
                </span>
                <span className="text-gray-300 dark:text-gray-600 mx-2">•</span>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {adminStats.onlineEmployees} online
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <UsersIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Batches</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{adminStats.activeBatches}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-yellow-600 dark:text-yellow-400">
                  {adminStats.pendingRequests} pending requests
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <UserGroupIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Task Completion</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{adminStats.weeklyTaskCompletion}%</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-green-600 dark:text-green-400">
                  {adminStats.completedTasks} completed
                </span>
                <span className="text-gray-300 dark:text-gray-600 mx-2">•</span>
                <span className="text-sm text-orange-600 dark:text-orange-400">
                  {adminStats.pendingTasks} pending
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <CheckCircleIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Status</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{adminStats.systemAlerts}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-red-600 dark:text-red-400">
                  Active alerts
                </span>
              </div>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Task Completion */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Weekly Task Completion</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskCompletionData}>
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
              <Bar dataKey="completed" fill="#10B981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="pending" fill="#F59E0B" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Attendance Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Monthly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" className="text-gray-600 dark:text-gray-400" />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgb(31 41 55)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Area type="monotone" dataKey="present" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
              <Area type="monotone" dataKey="late" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
              <Area type="monotone" dataKey="absent" stackId="1" stroke="#EF4444" fill="#EF4444" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real-time Employees Status & Absent Employees Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Online Employees */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Online Employees</h3>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm text-green-600 dark:text-green-400">Live</span>
            </div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {onlineEmployeesList.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{employee.department}</p>
                  </div>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Online</span>
              </div>
            ))}
          </div>
        </div>

        {/* Absent Employees Alert */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-red-200 dark:border-red-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Employees Not Logged In Today
            </h3>
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {absentEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{employee.department}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors">
                    Contact
                  </button>
                </div>
              </div>
            ))}
            {absentEmployees.length === 0 && (
              <p className="text-center text-green-600 dark:text-green-400 py-4">
                🎉 All employees have logged in today!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex-shrink-0 mt-1">
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
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'employees' && <ManageEmployees />}
          {activeTab === 'batches' && <ManageBatches />}
          {activeTab === 'batch-tasks' && <AssignBatchTask />}
          {activeTab === 'individual-tasks' && <AssignIndividualTask />}
          {activeTab === 'learning' && <LearningLibrary />}
          {activeTab === 'reports' && (
            <ExportReports 
              onExportAttendance={handleExportAttendance}
              onExportTasks={handleExportTasks}
            />
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
