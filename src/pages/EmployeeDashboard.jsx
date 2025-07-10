import { useState, useEffect, useRef } from 'react';
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
  ArrowRightIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  FaceSmileIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  PowerIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  XCircleIcon as XCircleIconSolid,
  PlayIcon as PlayIconSolid,
  PauseIcon as PauseIconSolid,
  BellIcon as BellIconSolid
} from '@heroicons/react/24/solid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, isToday } from 'date-fns';
import toast from 'react-hot-toast';

export default function EmployeeDashboard() {
  const { user, userProfile, logout, useFirebase } = useAuth();
  
  // Main state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Original dashboard state
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
    totalTimeToday: 0
  });
  
  // Batch state
  const [availableBatches, setAvailableBatches] = useState([]);
  const [currentBatch, setCurrentBatch] = useState(null);
  const [batchRequests, setBatchRequests] = useState([]);
  const [searchBatch, setSearchBatch] = useState('');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState('all');
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Learning materials state
  const [learningMaterials, setLearningMaterials] = useState([]);
  
  // Original dashboard state
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Refs
  const socketRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeData();
        initializeRealTimeFeatures();
        startTimeTracking();
      } catch (error) {
        console.error('Error during dashboard initialization:', error);
        // Ensure loading is set to false even if initialization fails
        setLoading(false);
        toast.error('Dashboard loaded with limited functionality');
      }
    };

    initialize();
    
    return () => {
      cleanup();
    };
  }, [user?.uid, useFirebase]);

  const initializeData = async () => {
    try {
      // Only initialize Firebase-related data if Firebase is enabled and user is authenticated
      if (useFirebase && user?.uid) {
        await Promise.all([
          loadDashboardData(),
          loadAttendanceStatus(),
          loadBatches(),
          loadTasks(),
          loadNotifications(),
          loadLearningMaterials(),
          loadUserBatch()
        ]);
      } else {
        // Load demo data when Firebase is not available
        await loadDashboardData();
        setLoading(false);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      // Fallback to demo data on Firebase errors
      await loadDashboardData();
      setLoading(false);
      toast.error('Using demo data - Firebase connection unavailable');
    }
  };

  const initializeRealTimeFeatures = () => {
    // Check if user was already clocked in from localStorage
    const clockInData = localStorage.getItem(`clockIn_${user?.uid}`);
    if (clockInData) {
      const { clockInTime } = JSON.parse(clockInData);
      setAttendanceStatus(prev => ({
        ...prev,
        isOnline: true,
        clockInTime: new Date(clockInTime)
      }));
    }

    // Initialize Socket.IO for real-time features
    initializeSocket();
    
    // Handle page close/refresh
    window.addEventListener('beforeunload', handleAutoLogout);
    window.addEventListener('unload', handleAutoLogout);
  };

  const initializeSocket = () => {
    // Socket.IO connection would be initialized here
    // For demo purposes, we'll simulate real-time updates
    console.log('Socket connection initialized for real-time features');
    
    // Simulate real-time notifications
    setTimeout(() => {
      addNotification({
        id: Date.now(),
        title: 'Welcome!',
        message: 'Dashboard loaded successfully with real-time features',
        type: 'info',
        timestamp: new Date()
      });
    }, 2000);
  };

  const startTimeTracking = () => {
    // Update current time every second
    intervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
      
      // Update total hours if logged in
      if (attendanceStatus.isOnline && attendanceStatus.clockInTime) {
        const diffMs = new Date() - new Date(attendanceStatus.clockInTime);
        const diffHours = diffMs / (1000 * 60 * 60);
        setAttendanceStatus(prev => ({
          ...prev,
          totalTimeToday: diffHours
        }));
      }
    }, 1000);
  };

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    window.removeEventListener('beforeunload', handleAutoLogout);
    window.removeEventListener('unload', handleAutoLogout);
  };

  const handleAutoLogout = () => {
    if (attendanceStatus.isOnline) {
      handleClockOut();
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (useFirebase && user?.uid) {
        try {
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
        } catch (firebaseError) {
          console.error('Firebase error, falling back to demo data:', firebaseError);
          loadDemoData();
        }
      } else {
        // Demo data or Firebase disabled
        loadDemoData();
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

  const loadDemoData = () => {
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
  };

  // Real-time Attendance Functions
  const loadAttendanceStatus = async () => {
    if (!useFirebase || !user?.uid) {
      console.log('Firebase not enabled or user not authenticated, skipping attendance status load');
      return;
    }
    
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const attendance = await DatabaseService.list(DatabaseService.COLLECTIONS.ATTENDANCE, {
        where: [
          { field: 'employeeId', operator: '==', value: user.uid },
          { field: 'date', operator: '==', value: today }
        ]
      });
      
      if (attendance.length > 0) {
        const todayAttendance = attendance[0];
        setAttendanceStatus({
          isOnline: !todayAttendance.clockOutTime,
          clockInTime: todayAttendance.clockInTime ? new Date(todayAttendance.clockInTime) : null,
          totalTimeToday: todayAttendance.totalHours || 0
        });
      }
    } catch (error) {
      console.error('Error loading attendance status:', error);
      // Don't show toast error for this, just log it
    }
  };

  const handleClockIn = async () => {
    try {
      const clockInTime = new Date();
      const today = format(clockInTime, 'yyyy-MM-dd');
      
      const attendanceData = {
        employeeId: user?.uid,
        employeeName: userProfile?.displayName || user?.displayName,
        date: today,
        clockInTime: clockInTime.toISOString(),
        clockOutTime: null,
        totalHours: 0,
        status: 'online'
      };
      
      if (useFirebase && user?.uid) {
        try {
          await DatabaseService.create(DatabaseService.COLLECTIONS.ATTENDANCE, attendanceData);
        } catch (firebaseError) {
          console.error('Firebase error during clock in:', firebaseError);
          // Continue with local storage even if Firebase fails
        }
      }
      
      // Store in localStorage for persistence
      localStorage.setItem(`clockIn_${user?.uid}`, JSON.stringify({
        clockInTime: clockInTime.toISOString()
      }));
      
      setAttendanceStatus({
        isOnline: true,
        clockInTime: clockInTime,
        totalTimeToday: 0
      });
      
      // Update real-time status
      updateOnlineStatus(true);
      toast.success('Successfully clocked in!');
      
      // Add activity
      addRecentActivity('Clocked in for today', 'attendance');
    } catch (error) {
      console.error('Error clocking in:', error);
      toast.error('Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      const clockOutTime = new Date();
      const totalHours = attendanceStatus.clockInTime ? 
        (clockOutTime - new Date(attendanceStatus.clockInTime)) / (1000 * 60 * 60) : 0;
      
      const today = format(clockOutTime, 'yyyy-MM-dd');
      
      if (useFirebase && user?.uid) {
        try {
          // Find today's attendance record and update it
          const attendanceRecords = await DatabaseService.list(DatabaseService.COLLECTIONS.ATTENDANCE, {
            where: [
              { field: 'employeeId', operator: '==', value: user.uid },
              { field: 'date', operator: '==', value: today }
            ]
          });
          
          if (attendanceRecords.length > 0) {
            await DatabaseService.update(DatabaseService.COLLECTIONS.ATTENDANCE, attendanceRecords[0].id, {
              clockOutTime: clockOutTime.toISOString(),
              totalHours: totalHours,
              status: 'offline'
            });
          }
        } catch (firebaseError) {
          console.error('Firebase error during clock out:', firebaseError);
          // Continue with local updates even if Firebase fails
        }
      }
      
      // Remove from localStorage
      localStorage.removeItem(`clockIn_${user?.uid}`);
      
      setAttendanceStatus({
        isOnline: false,
        clockInTime: attendanceStatus.clockInTime,
        totalTimeToday: totalHours
      });
      
      // Update real-time status
      updateOnlineStatus(false);
      toast.success(`Successfully clocked out! Total hours: ${totalHours.toFixed(2)}h`);
      
      // Add activity
      addRecentActivity(`Clocked out after ${totalHours.toFixed(2)} hours`, 'attendance');
    } catch (error) {
      console.error('Error clocking out:', error);
      toast.error('Failed to clock out');
    }
  };

  const updateOnlineStatus = (isOnline) => {
    // Real-time status update would be handled by Socket.IO
    console.log(`User status updated: ${isOnline ? 'Online' : 'Offline'}`);
  };

  // Batch Functions
  const loadBatches = async () => {
    try {
      if (useFirebase && user?.uid) {
        const batches = await DatabaseService.list(DatabaseService.COLLECTIONS.BATCHES);
        setAvailableBatches(batches.filter(batch => batch.status === 'active'));
      } else {
        // Demo data
        setAvailableBatches([
          { id: 1, name: 'Frontend Development', description: 'React, Angular, Vue.js training', memberCount: 15, status: 'active' },
          { id: 2, name: 'Backend Development', description: 'Node.js, Express, MongoDB training', memberCount: 12, status: 'active' },
          { id: 3, name: 'DevOps Training', description: 'Docker, Kubernetes, CI/CD', memberCount: 8, status: 'active' }
        ]);
      }
    } catch (error) {
      console.error('Error loading batches:', error);
      // Fallback to demo data
      setAvailableBatches([
        { id: 1, name: 'Frontend Development', description: 'React, Angular, Vue.js training', memberCount: 15, status: 'active' },
        { id: 2, name: 'Backend Development', description: 'Node.js, Express, MongoDB training', memberCount: 12, status: 'active' },
        { id: 3, name: 'DevOps Training', description: 'Docker, Kubernetes, CI/CD', memberCount: 8, status: 'active' }
      ]);
    }
  };

  const loadUserBatch = async () => {
    try {
      if (useFirebase && user?.uid) {
        const userBatches = await DatabaseService.list(DatabaseService.COLLECTIONS.BATCH_MEMBERS, {
          where: [{ field: 'employeeId', operator: '==', value: user.uid }]
        });
        
        if (userBatches.length > 0) {
          const batchId = userBatches[0].batchId;
          const batch = await DatabaseService.get(DatabaseService.COLLECTIONS.BATCHES, batchId);
          setCurrentBatch(batch);
          loadChatMessages(batchId);
        }
      } else {
        // Demo - simulate user is in Frontend batch
        const demoBatch = { id: 1, name: 'Frontend Development', description: 'React, Angular, Vue.js training', memberCount: 15 };
        setCurrentBatch(demoBatch);
        loadChatMessages(1);
      }
    } catch (error) {
      console.error('Error loading user batch:', error);
    }
  };

  const requestBatchJoin = async (batchId) => {
    try {
      const requestData = {
        employeeId: user?.uid,
        employeeName: userProfile?.displayName || user?.displayName,
        batchId: batchId,
        status: 'pending',
        requestDate: new Date().toISOString()
      };
      
      if (useFirebase) {
        await DatabaseService.create(DatabaseService.COLLECTIONS.BATCH_REQUESTS, requestData);
      }
      
      toast.success('Batch request sent successfully!');
      setBatchRequests(prev => [...prev, requestData]);
      
      // Add notification for demo
      addNotification({
        id: Date.now(),
        title: 'Batch Request Sent',
        message: 'Your batch join request has been sent to admin for approval',
        type: 'info',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error requesting batch join:', error);
      toast.error('Failed to send batch request');
    }
  };

  // Chat Functions
  const loadChatMessages = async (batchId) => {
    try {
      if (useFirebase) {
        const messages = await DatabaseService.list(DatabaseService.COLLECTIONS.CHAT_MESSAGES, {
          where: [{ field: 'batchId', operator: '==', value: batchId }],
          orderBy: [{ field: 'timestamp', direction: 'asc' }]
        });
        setChatMessages(messages);
      } else {
        // Demo messages
        setChatMessages([
          {
            id: 1,
            senderId: 'demo-user',
            senderName: 'John Doe',
            message: 'Welcome to the Frontend Development batch!',
            type: 'text',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            senderId: user?.uid,
            senderName: userProfile?.displayName || 'You',
            message: 'Thank you! Excited to learn React!',
            type: 'text',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        ]);
      }
      scrollToBottom();
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentBatch) return;
    
    try {
      const messageData = {
        id: Date.now(),
        batchId: currentBatch.id,
        senderId: user?.uid,
        senderName: userProfile?.displayName || user?.displayName,
        message: newMessage.trim(),
        type: 'text',
        timestamp: new Date().toISOString()
      };
      
      if (useFirebase) {
        await DatabaseService.create(DatabaseService.COLLECTIONS.CHAT_MESSAGES, messageData);
      }
      
      setChatMessages(prev => [...prev, messageData]);
      setNewMessage('');
      scrollToBottom();
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const sendImageMessage = async (file) => {
    if (!file || !currentBatch) return;
    
    try {
      // Create a local URL for demo purposes
      const imageUrl = URL.createObjectURL(file);
      
      const messageData = {
        id: Date.now(),
        batchId: currentBatch.id,
        senderId: user?.uid,
        senderName: userProfile?.displayName || user?.displayName,
        message: imageUrl,
        type: 'image',
        filename: file.name,
        timestamp: new Date().toISOString()
      };
      
      if (useFirebase) {
        // Here you would upload the file to storage and get the URL
        await DatabaseService.create(DatabaseService.COLLECTIONS.CHAT_MESSAGES, messageData);
      }
      
      setChatMessages(prev => [...prev, messageData]);
      scrollToBottom();
      toast.success('Image sent!');
    } catch (error) {
      console.error('Error sending image:', error);
      toast.error('Failed to send image');
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Task Functions
  const loadTasks = async () => {
    try {
      if (useFirebase && user?.uid) {
        const userTasks = await DatabaseService.list(DatabaseService.COLLECTIONS.TASKS, {
          where: [{ field: 'assignedTo', operator: '==', value: user.uid }]
        });
        setTasks(userTasks);
      } else {
        // Demo tasks
        setTasks([
          {
            id: 1,
            title: 'Complete React Tutorial',
            description: 'Finish the official React tutorial and build a simple app',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            priority: 'high',
            status: 'pending',
            assignedBy: 'Admin'
          },
          {
            id: 2,
            title: 'Review Team Code',
            description: 'Review the pull requests from team members',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            priority: 'medium',
            status: 'working',
            assignedBy: 'Project Manager'
          },
          {
            id: 3,
            title: 'Update Documentation',
            description: 'Update the project documentation with latest changes',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            priority: 'low',
            status: 'completed',
            assignedBy: 'Team Lead'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      if (useFirebase) {
        await DatabaseService.update(DatabaseService.COLLECTIONS.TASKS, taskId, {
          status: status,
          updatedAt: new Date().toISOString()
        });
      }
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status } : task
      ));
      
      toast.success(`Task marked as ${status}`);
      
      // Add activity
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        addRecentActivity(`Updated task: ${task.title} to ${status}`, 'task');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  // Notification Functions
  const loadNotifications = async () => {
    try {
      if (useFirebase && user?.uid) {
        const userNotifications = await DatabaseService.list(DatabaseService.COLLECTIONS.NOTIFICATIONS, {
          where: [{ field: 'recipientId', operator: '==', value: user.uid }],
          orderBy: [{ field: 'timestamp', direction: 'desc' }]
        });
        setNotifications(userNotifications);
        setUnreadCount(userNotifications.filter(n => !n.read).length);
      } else {
        // Demo notifications
        const demoNotifications = [
          {
            id: 1,
            title: 'New Task Assigned',
            message: 'You have been assigned: Complete React Tutorial',
            type: 'task',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            read: false
          },
          {
            id: 2,
            title: 'Batch Message',
            message: 'New message in Frontend Development group',
            type: 'message',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            read: false
          },
          {
            id: 3,
            title: 'System Announcement',
            message: 'System maintenance scheduled for this weekend',
            type: 'announcement',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            read: true
          }
        ];
        setNotifications(demoNotifications);
        setUnreadCount(demoNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification
    toast.success(notification.message, {
      duration: 4000,
      icon: '🔔'
    });
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      if (useFirebase) {
        await DatabaseService.update(DatabaseService.COLLECTIONS.NOTIFICATIONS, notificationId, {
          read: true
        });
      }
      
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Learning Materials Functions
  const loadLearningMaterials = async () => {
    try {
      if (useFirebase) {
        const materials = await DatabaseService.list(DatabaseService.COLLECTIONS.LEARNING_MATERIALS);
        setLearningMaterials(materials);
      } else {
        // Demo materials
        setLearningMaterials([
          {
            id: 1,
            title: 'React Fundamentals',
            description: 'Complete guide to React fundamentals and hooks',
            type: 'pdf',
            category: 'required',
            url: '/files/react-fundamentals.pdf',
            uploadedBy: 'Admin',
            uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          },
          {
            id: 2,
            title: 'Advanced JavaScript Concepts',
            description: 'Video series on advanced JavaScript topics',
            type: 'video',
            category: 'recommended',
            url: 'https://example.com/js-advanced',
            uploadedBy: 'Admin',
            uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          },
          {
            id: 3,
            title: 'MDN Web Docs',
            description: 'Official Mozilla documentation for web technologies',
            type: 'link',
            category: 'reference',
            url: 'https://developer.mozilla.org',
            uploadedBy: 'Admin',
            uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading learning materials:', error);
    }
  };

  // Helper Functions
  const addRecentActivity = (action, type) => {
    const activity = {
      id: Date.now(),
      action,
      type,
      timestamp: new Date()
    };
    setRecentActivities(prev => [activity, ...prev.slice(0, 9)]); // Keep only 10 recent activities
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getFilteredTasks = () => {
    if (taskFilter === 'all') return tasks;
    return tasks.filter(task => task.status === taskFilter);
  };

  const getFilteredBatches = () => {
    if (!searchBatch) return availableBatches;
    return availableBatches.filter(batch => 
      batch.name.toLowerCase().includes(searchBatch.toLowerCase()) ||
      batch.description.toLowerCase().includes(searchBatch.toLowerCase())
    );
  };

  // More render functions and main return will be added
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'batch', name: 'Batch Request', icon: UserGroupIcon },
    { id: 'chat', name: 'Group Chat', icon: ChatBubbleLeftRightIcon },
    { id: 'tasks', name: 'Tasks', icon: CheckCircleIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon, badge: unreadCount },
    { id: 'learning', name: 'Learning', icon: AcademicCapIcon },
    { id: 'profile', name: 'Profile', icon: UserIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Render Functions
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Greeting and Real-time Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getGreeting()}, {userProfile?.displayName || 'Employee'}! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {format(currentTime, 'EEEE, MMMM do, yyyy • h:mm:ss a')}
            </p>
            <div className="flex items-center mt-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                attendanceStatus.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className={`text-sm font-medium ${
                attendanceStatus.isOnline ? 'text-green-600' : 'text-gray-500'
              }`}>
                {attendanceStatus.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            {!attendanceStatus.isOnline ? (
              <button
                onClick={handleClockIn}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <PlayIconSolid className="h-5 w-5 mr-2" />
                Log In
              </button>
            ) : (
              <button
                onClick={handleClockOut}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <PauseIconSolid className="h-5 w-5 mr-2" />
                Log Out
              </button>
            )}
          </div>
        </div>
        
        {attendanceStatus.isOnline && attendanceStatus.clockInTime && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Login Time</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {format(new Date(attendanceStatus.clockInTime), 'h:mm a')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Hours Today</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {attendanceStatus.totalTimeToday.toFixed(2)}h
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tasks.filter(t => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Batch</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {currentBatch ? currentBatch.name : 'None'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Learning Materials</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {learningMaterials.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
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

      {/* Upcoming Tasks */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h3>
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
          >
            View all
          </button>
        </div>
        <div className="space-y-3">
          {upcomingTasks.slice(0, 3).map((task) => (
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
    </div>
  );

  const renderBatchRequest = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Batch Request</h2>
      </div>
      
      {currentBatch ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Current Batch: {currentBatch.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {currentBatch.description}
              </p>
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Active Member
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Search Batches */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search batches..."
                  value={searchBatch}
                  onChange={(e) => setSearchBatch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredBatches().map((batch) => (
                <div key={batch.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{batch.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{batch.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{batch.memberCount || 0} members</span>
                    <button
                      onClick={() => requestBatchJoin(batch.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      Request Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderChat = () => {
    if (!currentBatch) {
      return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Join a Batch to Access Chat
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be part of a batch to participate in group chat.
          </p>
          <button
            onClick={() => setActiveTab('batch')}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Browse Batches
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-[600px] flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {currentBatch.name} - Group Chat
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentBatch.memberCount || 0} members
          </p>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === user?.uid 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}>
                {message.senderId !== user?.uid && (
                  <p className="text-xs font-medium mb-1 opacity-75">{message.senderName}</p>
                )}
                
                {message.type === 'text' ? (
                  <p>{message.message}</p>
                ) : message.type === 'image' ? (
                  <div>
                    <img
                      src={message.message}
                      alt="Shared"
                      className="max-w-full h-auto rounded cursor-pointer"
                      onClick={() => window.open(message.message, '_blank')}
                    />
                    {message.filename && (
                      <p className="text-xs mt-1 opacity-75">{message.filename}</p>
                    )}
                  </div>
                ) : null}
                
                <p className="text-xs mt-1 opacity-75">
                  {format(new Date(message.timestamp), 'h:mm a')}
                </p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        
        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={(e) => e.target.files[0] && sendImageMessage(e.target.files[0])}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <PhotoIcon className="h-5 w-5" />
            </button>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTasks = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h2>
        <div className="flex space-x-2">
          {['all', 'pending', 'working', 'completed'].map((filter) => (
            <button
              key={filter}
              onClick={() => setTaskFilter(filter)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                taskFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        {getFilteredTasks().map((task) => (
          <div key={task.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                <div className="flex items-center mt-3 space-x-4">
                  <span className="text-sm text-gray-500">
                    Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.priority} priority
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => updateTaskStatus(task.id, 'completed')}
                  className={`p-2 rounded-lg transition-colors ${
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-600'
                      : 'text-gray-400 hover:bg-green-100 hover:text-green-600'
                  }`}
                  title="Mark as completed"
                >
                  <CheckCircleIconSolid className="h-5 w-5" />
                </button>
                
                <button
                  onClick={() => updateTaskStatus(task.id, 'working')}
                  className={`p-2 rounded-lg transition-colors ${
                    task.status === 'working'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'text-gray-400 hover:bg-yellow-100 hover:text-yellow-600'
                  }`}
                  title="Working on it"
                >
                  <ClockIconSolid className="h-5 w-5" />
                </button>
                
                <button
                  onClick={() => updateTaskStatus(task.id, 'pending')}
                  className={`p-2 rounded-lg transition-colors ${
                    task.status === 'pending'
                      ? 'bg-red-100 text-red-600'
                      : 'text-gray-400 hover:bg-red-100 hover:text-red-600'
                  }`}
                  title="Mark as pending"
                >
                  <XCircleIconSolid className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {getFilteredTasks().length === 0 && (
          <div className="text-center py-8">
            <CheckCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
        {unreadCount > 0 && (
          <span className="px-2 py-1 bg-blue-600 text-white text-sm rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 cursor-pointer ${
              notification.read 
                ? 'border-gray-300 dark:border-gray-600' 
                : 'border-blue-500'
            }`}
            onClick={() => !notification.read && markNotificationAsRead(notification.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  notification.type === 'task' ? 'bg-blue-100 text-blue-600' :
                  notification.type === 'message' ? 'bg-green-100 text-green-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {notification.type === 'task' && <CheckCircleIcon className="h-5 w-5" />}
                  {notification.type === 'message' && <ChatBubbleLeftRightIcon className="h-5 w-5" />}
                  {notification.type === 'announcement' && <BellIcon className="h-5 w-5" />}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {notification.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {format(new Date(notification.timestamp), 'MMM dd, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              
              {!notification.read && (
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
        ))}
        
        {notifications.length === 0 && (
          <div className="text-center py-8">
            <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderLearning = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Materials</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningMaterials.map((material) => (
          <div key={material.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${
                  material.type === 'pdf' ? 'bg-red-100 text-red-600' :
                  material.type === 'video' ? 'bg-blue-100 text-blue-600' :
                  material.type === 'link' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {material.type === 'pdf' && <DocumentArrowDownIcon className="h-6 w-6" />}
                  {material.type === 'video' && <PlayIconSolid className="h-6 w-6" />}
                  {material.type === 'link' && <EyeIcon className="h-6 w-6" />}
                  {!['pdf', 'video', 'link'].includes(material.type) && <AcademicCapIcon className="h-6 w-6" />}
                </div>
              </div>
              
              <span className={`px-2 py-1 text-xs rounded-full ${
                material.category === 'required' ? 'bg-red-100 text-red-800' :
                material.category === 'recommended' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {material.category || 'general'}
              </span>
            </div>
            
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {material.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {material.description}
            </p>
            
            <div className="flex space-x-2">
              {material.type === 'link' ? (
                <a
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  View
                </a>
              ) : (
                <a
                  href={material.url}
                  download
                  className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                  Download
                </a>
              )}
            </div>
          </div>
        ))}
        
        {learningMaterials.length === 0 && (
          <div className="col-span-full text-center py-8">
            <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No learning materials available</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {userProfile?.displayName?.charAt(0) || user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {userProfile?.displayName || user?.displayName || user?.email || 'User'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Employee</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {userProfile?.displayName || user?.displayName || 'Not set'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user?.email || 'Not set'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                <p className="font-medium text-gray-900 dark:text-white">Employee</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Batch</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentBatch ? currentBatch.name : 'Not assigned'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={logout}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
                {tab.badge > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'batch' && renderBatchRequest()}
        {activeTab === 'chat' && renderChat()}
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'notifications' && renderNotifications()}
        {activeTab === 'learning' && renderLearning()}
        {activeTab === 'profile' && renderProfile()}
      </div>
    </div>
  );
}
