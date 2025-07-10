import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import DatabaseService from '../services/databaseService';
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
  TrophyIcon,
  PowerIcon,
  UserGroupIcon,
  DocumentArrowDownIcon,
  ExclamationCircleIcon,
  PaperAirplaneIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  XCircleIcon as XCircleIconSolid
} from '@heroicons/react/24/solid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { format, subDays, isToday, startOfDay, endOfDay } from 'date-fns';
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
  
  // Real-time attendance state
  const [attendanceStatus, setAttendanceStatus] = useState({
    isOnline: false,
    clockInTime: null,
    totalTimeToday: 0,
    currentSession: 0
  });
  
  // Task management state
  const [todayTasks, setTodayTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState('all'); // all, completed, pending, not_completed
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  
  // Learning library state
  const [learningResources, setLearningResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Navigation state
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // General state
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [learningProgress, setLearningProgress] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Refs for real-time functionality
  const intervalRef = useRef(null);
  const sessionStartTime = useRef(null);

  useEffect(() => {
    loadEmployeeData();
    initializeRealTimeFeatures();
    
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      handleAutoLogout();
    };
  }, [user?.uid, useFirebase]);

  // Real-time features initialization
  const initializeRealTimeFeatures = () => {
    // Check if user was already clocked in
    const savedClockIn = localStorage.getItem(`clockIn_${user?.uid}`);
    if (savedClockIn) {
      const clockInTime = new Date(savedClockIn);
      setAttendanceStatus(prev => ({
        ...prev,
        isOnline: true,
        clockInTime,
        currentSession: Date.now() - clockInTime.getTime()
      }));
      sessionStartTime.current = clockInTime;
      startSessionTimer();
    }
    
    // Handle browser close/refresh
    window.addEventListener('beforeunload', handleAutoLogout);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Load chat messages and set up real-time updates
    loadChatMessages();
    
    return () => {
      window.removeEventListener('beforeunload', handleAutoLogout);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  };

  // Attendance Management
  const handleClockIn = async () => {
    try {
      const clockInTime = new Date();
      sessionStartTime.current = clockInTime;
      
      // Update local state
      setAttendanceStatus(prev => ({
        ...prev,
        isOnline: true,
        clockInTime,
        currentSession: 0
      }));
      
      // Save to localStorage
      localStorage.setItem(`clockIn_${user?.uid}`, clockInTime.toISOString());
      
      // Save to database
      if (useFirebase) {
        await DatabaseService.create(DatabaseService.COLLECTIONS.ATTENDANCE, {
          employeeId: user.uid,
          date: format(clockInTime, 'yyyy-MM-dd'),
          clockIn: clockInTime,
          status: 'present',
          isActive: true
        });
        
        // Log activity
        await DatabaseService.logActivity({
          userId: user.uid,
          action: 'clock_in',
          details: `${userProfile?.displayName} clocked in`,
          timestamp: clockInTime
        });
      }
      
      startSessionTimer();
      toast.success('Clocked in successfully!');
      
      // Reload data to update stats
      loadEmployeeData();
    } catch (error) {
      console.error('Error clocking in:', error);
      toast.error('Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      const clockOutTime = new Date();
      const sessionDuration = sessionStartTime.current ? 
        clockOutTime.getTime() - sessionStartTime.current.getTime() : 0;
      const hoursWorked = sessionDuration / (1000 * 60 * 60);
      
      // Update local state
      setAttendanceStatus(prev => ({
        ...prev,
        isOnline: false,
        clockInTime: null,
        totalTimeToday: prev.totalTimeToday + sessionDuration,
        currentSession: 0
      }));
      
      // Clear localStorage
      localStorage.removeItem(`clockIn_${user?.uid}`);
      
      // Save to database
      if (useFirebase) {
        // Find today's attendance record and update it
        const todayAttendance = await DatabaseService.list(DatabaseService.COLLECTIONS.ATTENDANCE, {
          where: [
            { field: 'employeeId', operator: '==', value: user.uid },
            { field: 'date', operator: '==', value: format(clockOutTime, 'yyyy-MM-dd') },
            { field: 'isActive', operator: '==', value: true }
          ]
        });
        
        if (todayAttendance.length > 0) {
          await DatabaseService.update(DatabaseService.COLLECTIONS.ATTENDANCE, todayAttendance[0].id, {
            clockOut: clockOutTime,
            hoursWorked: hoursWorked,
            isActive: false
          });
        }
        
        // Log activity
        await DatabaseService.logActivity({
          userId: user.uid,
          action: 'clock_out',
          details: `${userProfile?.displayName} clocked out (${hoursWorked.toFixed(2)}h worked)`,
          timestamp: clockOutTime
        });
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      toast.success(`Clocked out! You worked ${hoursWorked.toFixed(2)} hours today.`);
      
      // Reload data to update stats
      loadEmployeeData();
    } catch (error) {
      console.error('Error clocking out:', error);
      toast.error('Failed to clock out');
    }
  };

  const handleAutoLogout = () => {
    if (attendanceStatus.isOnline) {
      // Auto clock out when browser closes
      handleClockOut();
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden && attendanceStatus.isOnline) {
      // Optionally pause timer when tab is not visible
      console.log('Tab hidden - user may be away');
    } else if (!document.hidden && attendanceStatus.isOnline) {
      console.log('Tab visible - user is back');
    }
  };

  const startSessionTimer = () => {
    intervalRef.current = setInterval(() => {
      if (sessionStartTime.current) {
        const currentSession = Date.now() - sessionStartTime.current.getTime();
        setAttendanceStatus(prev => ({
          ...prev,
          currentSession
        }));
      }
    }, 1000);
  };

  // Task Management
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      if (useFirebase) {
        await DatabaseService.update(DatabaseService.COLLECTIONS.TASKS, taskId, {
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date() : null
        });
        
        // Log activity
        await DatabaseService.logActivity({
          userId: user.uid,
          action: 'task_updated',
          details: `Task status updated to ${newStatus}`,
          timestamp: new Date()
        });
      }
      
      // Update local state
      setTodayTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      toast.success(`Task marked as ${newStatus}`);
      loadEmployeeData(); // Refresh stats
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  // Chat functionality
  const loadChatMessages = async () => {
    try {
      if (useFirebase) {
        // Set up real-time listener for chat messages
        const unsubscribe = DatabaseService.onSnapshot(
          'chat_messages',
          (messages) => {
            setChatMessages(messages.sort((a, b) => a.timestamp - b.timestamp));
            scrollToBottom();
          },
          {
            orderBy: { field: 'timestamp', direction: 'desc' },
            limit: 100
          }
        );
        
        return unsubscribe;
      } else {
        // Demo chat messages
        setChatMessages([
          {
            id: 1,
            message: 'Good morning everyone! 👋',
            sender: 'Alice Johnson',
            senderId: 'demo_user_1',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            isAdmin: false
          },
          {
            id: 2,
            message: 'Team meeting at 2 PM today. Please check your calendars.',
            sender: 'Admin User',
            senderId: 'demo_admin',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            isAdmin: true
          },
          {
            id: 3,
            message: 'Thanks for the reminder!',
            sender: 'Bob Smith',
            senderId: 'demo_user_2',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            isAdmin: false
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const message = {
        message: newMessage.trim(),
        sender: userProfile?.displayName || 'Unknown User',
        senderId: user?.uid,
        timestamp: new Date(),
        isAdmin: userProfile?.role === 'admin'
      };
      
      if (useFirebase) {
        await DatabaseService.create('chat_messages', message);
      } else {
        // Demo mode - add to local state
        setChatMessages(prev => [...prev, { ...message, id: Date.now() }]);
      }
      
      setNewMessage('');
      scrollToBottom();
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Learning Resources
  const loadLearningResources = async () => {
    try {
      if (useFirebase) {
        const resources = await DatabaseService.list('learning_resources', {
          where: [{ field: 'isActive', operator: '==', value: true }],
          orderBy: { field: 'createdAt', direction: 'desc' }
        });
        setLearningResources(resources);
      } else {
        // Demo learning resources
        setLearningResources([
          {
            id: 1,
            title: 'React.js Complete Guide',
            description: 'Comprehensive guide to React.js development',
            type: 'pdf',
            category: 'programming',
            url: '/resources/react-guide.pdf',
            uploadedBy: 'Admin User',
            uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            downloads: 45
          },
          {
            id: 2,
            title: 'JavaScript ES6+ Features',
            description: 'Modern JavaScript features and best practices',
            type: 'video',
            category: 'programming',
            url: 'https://example.com/js-video',
            uploadedBy: 'Admin User',
            uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            downloads: 32
          },
          {
            id: 3,
            title: 'UI/UX Design Principles',
            description: 'Essential design principles for modern applications',
            type: 'link',
            category: 'design',
            url: 'https://example.com/design-principles',
            uploadedBy: 'Design Team',
            uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            downloads: 28
          },
          {
            id: 4,
            title: 'Project Management Basics',
            description: 'Introduction to agile project management',
            type: 'pdf',
            category: 'management',
            url: '/resources/pm-basics.pdf',
            uploadedBy: 'HR Department',
            uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            downloads: 15
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading learning resources:', error);
    }
  };

  const downloadResource = async (resourceId) => {
    try {
      const resource = learningResources.find(r => r.id === resourceId);
      if (!resource) return;
      
      if (resource.type === 'link') {
        window.open(resource.url, '_blank');
      } else {
        // For PDFs and other files, trigger download
        const link = document.createElement('a');
        link.href = resource.url;
        link.download = resource.title;
        link.click();
      }
      
      // Update download count
      if (useFirebase) {
        await DatabaseService.update('learning_resources', resourceId, {
          downloads: (resource.downloads || 0) + 1
        });
      }
      
      // Log activity
      if (useFirebase) {
        await DatabaseService.logActivity({
          userId: user.uid,
          action: 'resource_downloaded',
          details: `Downloaded: ${resource.title}`,
          timestamp: new Date()
        });
      }
      
      toast.success('Resource accessed successfully!');
    } catch (error) {
      console.error('Error downloading resource:', error);
      toast.error('Failed to access resource');
    }
  };

  const loadEmployeeData = async () => {
    setLoading(true);
    try {
      if (useFirebase && user?.uid) {
        await loadFirebaseData();
      } else {
        await loadDemoData();
      }
      
      // Load additional features
      await loadTodayTasks();
      await loadLearningResources();
    } catch (error) {
      console.error('Error loading employee data:', error);
      toast.error('Failed to load dashboard data');
      await loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadTodayTasks = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      if (useFirebase) {
        const tasks = await DatabaseService.list(DatabaseService.COLLECTIONS.TASKS, {
          where: [
            { field: 'assignedTo', operator: '==', value: user.uid },
            { field: 'dueDate', operator: '>=', value: startOfDay(new Date()) },
            { field: 'dueDate', operator: '<=', value: endOfDay(new Date()) }
          ]
        });
        setTodayTasks(tasks);
      } else {
        // Demo tasks for today
        setTodayTasks([
          {
            id: 1,
            title: 'Complete React Component',
            description: 'Finish the user profile component',
            status: 'pending',
            priority: 'high',
            dueDate: new Date(),
            assignedBy: 'Project Manager',
            estimatedHours: 4
          },
          {
            id: 2,
            title: 'Review Pull Request #42',
            description: 'Code review for authentication module',
            status: 'completed',
            priority: 'medium',
            dueDate: new Date(),
            assignedBy: 'Tech Lead',
            estimatedHours: 1
          },
          {
            id: 3,
            title: 'Update Documentation',
            description: 'Update API documentation for new endpoints',
            status: 'pending',
            priority: 'low',
            dueDate: new Date(),
            assignedBy: 'Tech Lead',
            estimatedHours: 2
          },
          {
            id: 4,
            title: 'Team Meeting Preparation',
            description: 'Prepare weekly status report',
            status: 'not_completed',
            priority: 'medium',
            dueDate: new Date(),
            assignedBy: 'Project Manager',
            estimatedHours: 0.5
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading today tasks:', error);
    }
  };

  const loadFirebaseData = async () => {
    // Load employee's personal data from Firebase
    const [tasks, courses, attendance, notifications] = await Promise.all([
      DatabaseService.getTasksByEmployee(user.uid),
      DatabaseService.getActiveCourses(),
      DatabaseService.getAttendanceByEmployee(user.uid),
      DatabaseService.getUserNotifications(user.uid)
    ]);

    // Calculate employee statistics
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const enrolledCourses = courses.filter(course => course.enrolledStudents?.includes(user.uid)).length;
    const completedCourses = courses.filter(course => course.completedStudents?.includes(user.uid)).length;
    
    // Calculate attendance rate
    const totalAttendanceDays = attendance.length;
    const presentDays = attendance.filter(record => record.status === 'present').length;
    const attendanceRate = totalAttendanceDays > 0 ? Math.round((presentDays / totalAttendanceDays) * 100) : 0;

    // Calculate total hours worked
    const totalHours = attendance.reduce((sum, record) => {
      if (record.hoursWorked) {
        return sum + record.hoursWorked;
      }
      return sum;
    }, 0);

    // Get today's hours
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.find(record => record.date === today);
    const todayHours = todayAttendance?.hoursWorked || 0;

    setEmployeeStats({
      attendanceRate,
      completedTasks,
      pendingTasks,
      totalHours,
      todayHours,
      enrolledCourses,
      completedCourses,
      certificates: completedCourses // Assuming certificates = completed courses
    });

    // Set recent activities
    setRecentActivities([
      ...tasks.slice(0, 5).map(task => ({
        id: task.id,
        type: 'task_completed',
        message: `${task.status === 'completed' ? 'Completed' : 'Assigned'} "${task.title}" task`,
        timestamp: task.updatedAt?.toDate() || new Date(),
        status: task.status
      })),
      ...attendance.slice(0, 3).map(record => ({
        id: record.id,
        type: 'attendance_marked',
        message: `Attendance marked - ${record.status}`,
        timestamp: record.createdAt?.toDate() || new Date(),
        status: record.status
      }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 4));

    // Set upcoming tasks
    setUpcomingTasks(tasks.filter(task => 
      task.status === 'pending' && new Date(task.dueDate) > new Date()
    ).slice(0, 5));

    // Set learning progress
    setLearningProgress(courses.filter(course => 
      course.enrolledStudents?.includes(user.uid)
    ).map(course => ({
      id: course.id,
      course: course.title,
      progress: course.completedStudents?.includes(user.uid) ? 100 : 
               Math.floor(Math.random() * 80) + 10, // Random progress for demo
      status: course.completedStudents?.includes(user.uid) ? 'completed' : 'in-progress'
    })));

    // Generate attendance data for chart
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      const dayRecord = attendance.find(record => 
        record.date === format(date, 'yyyy-MM-dd')
      );
      return {
        date: format(date, 'MMM dd'),
        hours: dayRecord?.hoursWorked || 0,
        present: dayRecord?.status === 'present' ? 1 : 0
      };
    }).reverse();

    setAttendanceData(last7Days);

    // Set notifications
    setNotifications(notifications.filter(notif => !notif.read).slice(0, 5).map(notif => ({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      timestamp: notif.createdAt?.toDate() || new Date(),
      type: notif.type || 'info',
      unread: !notif.read
    })));
  };

  const loadDemoData = async () => {
    // Demo data simulation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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

    setUpcomingTasks([
      {
        id: 1,
        title: 'Complete React Component Refactoring',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        priority: 'high',
        status: 'pending'
      },
      {
        id: 2,
        title: 'Attend Team Meeting',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        status: 'pending'
      },
      {
        id: 3,
        title: 'Submit Weekly Report',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: 'low',
        status: 'pending'
      }
    ]);

    setLearningProgress([
      {
        id: 1,
        course: 'React.js Fundamentals',
        progress: 85,
        status: 'in-progress'
      },
      {
        id: 2,
        course: 'JavaScript Advanced',
        progress: 60,
        status: 'in-progress'
      },
      {
        id: 3,
        course: 'Database Design',
        progress: 100,
        status: 'completed'
      }
    ]);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date: format(date, 'MMM dd'),
        hours: Math.floor(Math.random() * 3) + 6,
        present: Math.random() > 0.1 ? 1 : 0
      };
    }).reverse();
    
    setAttendanceData(last7Days);

    setNotifications([
      {
        id: 1,
        title: 'New Course Available',
        message: 'Advanced React Patterns course is now available',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: 'info',
        unread: true
      },
      {
        id: 2,
        title: 'Task Reminder',
        message: 'Database assignment due in 2 days',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'warning',
        unread: true
      }
    ]);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'course_enrolled':
        return <AcademicCapIcon className="h-5 w-5 text-blue-500" />;
      case 'certificate_earned':
        return <TrophyIcon className="h-5 w-5 text-yellow-500" />;
      case 'attendance_marked':
        return <ClockIcon className="h-5 w-5 text-indigo-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

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
            Here's your dashboard overview for today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 rounded-xl border border-white/20">
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

          <div className="glass-card p-6 rounded-xl border border-white/20">
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

          <div className="glass-card p-6 rounded-xl border border-white/20">
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

          <div className="glass-card p-6 rounded-xl border border-white/20">
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

        {/* Charts and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Attendance Chart */}
          <div className="glass-card p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Weekly Attendance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Bar dataKey="hours" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="glass-card p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Activities</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(activity.timestamp, 'MMM dd, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Tasks & Learning Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Upcoming Tasks */}
          <div className="glass-card p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Upcoming Tasks</h3>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Due: {format(task.dueDate, 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Progress */}
          <div className="glass-card p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Learning Progress</h3>
            <div className="space-y-4">
              {learningProgress.map((course) => (
                <div key={course.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{course.course}</h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="glass-card p-6 rounded-xl border border-white/20 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Notifications</h3>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    <BellIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{notification.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {format(notification.timestamp, 'MMM dd, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
