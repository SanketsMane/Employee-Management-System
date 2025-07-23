import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import DatabaseService from '../services/databaseService';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardFormonexAI, EmptyStateFormonexAI, AchievementFormonexAI } from '../components/animations/FormonexAI';
import { InteractiveElements, LoadingCharacter, FloatingAssistant, NotificationCharacter } from '../components/animations/InteractiveElements';
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

export default function EmployeeDashboard() {
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
  
  // AI Character states
  const [showWelcomeAI, setShowWelcomeAI] = useState(true);
  const [showAchievementAI, setShowAchievementAI] = useState(false);
  const [showNotificationAI, setShowNotificationAI] = useState(false);
  const [aiNotification, setAiNotification] = useState(null);

  useEffect(() => {
    loadEmployeeData();
    
    // Show welcome AI character for new sessions
    const hasSeenWelcome = sessionStorage.getItem('formonex_welcome_shown');
    if (!hasSeenWelcome) {
      setTimeout(() => {
        setShowWelcomeAI(true);
        sessionStorage.setItem('formonex_welcome_shown', 'true');
      }, 1000);
    }
  }, []);

  // Trigger achievement AI when certain milestones are reached
  useEffect(() => {
    if (employeeStats.completedTasks > 0 && employeeStats.completedTasks % 10 === 0) {
      setShowAchievementAI(true);
      setTimeout(() => setShowAchievementAI(false), 5000);
    }
  }, [employeeStats.completedTasks]);

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

  // AI Character interaction handlers
  const handleAIInteraction = (scenario) => {
    switch (scenario) {
      case 'tasks':
        setAiNotification({
          type: 'info',
          message: 'Ready to tackle your tasks? You can filter, prioritize, and track progress easily!'
        });
        setShowNotificationAI(true);
        break;
      case 'learning':
        setAiNotification({
          type: 'success',
          message: 'Keep learning! Complete courses to earn certificates and boost your skills.'
        });
        setShowNotificationAI(true);
        break;
      case 'achievement':
        setAiNotification({
          type: 'success',
          message: `Congratulations! You've completed ${employeeStats.completedTasks} tasks. Keep up the great work!`
        });
        setShowNotificationAI(true);
        break;
      default:
        setAiNotification({
          type: 'info',
          message: 'I am here to help you navigate Formonex! Click on me anytime for tips.'
        });
        setShowNotificationAI(true);
    }
    
    setTimeout(() => setShowNotificationAI(false), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center relative">
        <InteractiveElements />
        <LoadingCharacter 
          message={`Loading your dashboard, ${userProfile?.displayName || 'there'}...`}
          size="xl"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
      {/* Interactive Background Elements */}
      <InteractiveElements />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Enhanced Header with AI Character */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <motion.h1 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
              >
                Welcome back, {userProfile?.displayName || 'Employee'}! 👋
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-2 text-lg text-gray-600 dark:text-gray-300"
              >
                Ready to boost your productivity at Formonex today?
              </motion.p>
            </div>
            
            {/* Welcome AI Character */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
              className="ml-8"
            >
              <DashboardFormonexAI
                userName={userProfile?.displayName || 'Employee'}
                onInteraction={handleAIInteraction}
                size="large"
                showTips={true}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* AI Notifications */}
        <AnimatePresence>
          {showNotificationAI && aiNotification && (
            <NotificationCharacter
              type={aiNotification.type}
              message={aiNotification.message}
              onDismiss={() => setShowNotificationAI(false)}
              autoHide={true}
              duration={4000}
            />
          )}
        </AnimatePresence>

        {/* Achievement AI Character */}
        <AnimatePresence>
          {showAchievementAI && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: 100 }}
              className="fixed top-1/2 right-8 transform -translate-y-1/2 z-50"
            >
              <AchievementFormonexAI
                userName={userProfile?.displayName}
                size="xl"
                onInteraction={() => setShowAchievementAI(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Employee Stats Cards with Animations */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              title: 'Attendance Rate',
              value: `${employeeStats.attendanceRate}%`,
              subtitle: 'This month',
              icon: ClockIcon,
              color: 'from-green-400 to-emerald-600',
              bgColor: 'bg-green-100 dark:bg-green-900/30'
            },
            {
              title: 'Completed Tasks',
              value: employeeStats.completedTasks,
              subtitle: `${employeeStats.pendingTasks} pending`,
              icon: CheckCircleIcon,
              color: 'from-blue-400 to-blue-600',
              bgColor: 'bg-blue-100 dark:bg-blue-900/30'
            },
            {
              title: 'Learning Progress',
              value: `${employeeStats.completedCourses}/${employeeStats.enrolledCourses}`,
              subtitle: 'Courses completed',
              icon: AcademicCapIcon,
              color: 'from-purple-400 to-purple-600',
              bgColor: 'bg-purple-100 dark:bg-purple-900/30'
            },
            {
              title: 'Certificates Earned',
              value: employeeStats.certificates,
              subtitle: 'This year',
              icon: TrophyIcon,
              color: 'from-yellow-400 to-orange-600',
              bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="glass-card p-6 rounded-xl border border-white/20 relative overflow-hidden group cursor-pointer"
              onClick={() => handleAIInteraction('dashboard')}
            >
              {/* Animated Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                  <motion.p 
                    className="text-3xl font-bold text-gray-900 dark:text-white"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1, type: "spring", stiffness: 300 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.subtitle}</p>
                </div>
                <div className={`p-4 ${stat.bgColor} rounded-full group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-8 w-8 text-gray-700 dark:text-gray-300" />
                </div>
              </div>

              {/* Floating Particles */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-400 rounded-full"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${30 + i * 20}%`
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Main Content Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
        >
          {/* AI-Enhanced Upcoming Tasks */}
          <div className="lg:col-span-2">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="glass-card p-6 rounded-xl border border-white/20 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h3>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  onClick={() => handleAIInteraction('tasks')}
                >
                  View All
                </motion.button>
              </div>
              
              {upcomingTasks.length === 0 ? (
                <EmptyStateFormonexAI
                  title="No tasks assigned yet!"
                  message="Ready to get productive? Your tasks will appear here."
                  actionText="Explore Available Tasks"
                  onAction={() => console.log('Navigate to tasks')}
                />
              ) : (
                <div className="space-y-4">
                  {upcomingTasks.map((task, index) => (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                      className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer group relative overflow-hidden"
                      onClick={() => handleAIInteraction('tasks')}
                    >
                      {/* Task Priority Indicator */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                      
                      <div className="flex items-start justify-between ml-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {task.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Due: {format(task.dueDate, 'MMM dd, yyyy')}
                          </p>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Progress</span>
                              <span className="font-medium">{task.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                              <motion.div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${task.progress}%` }}
                                transition={{ delay: 1.2 + index * 0.1, duration: 1, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        </div>
                        <span className={`ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </div>

                      {/* Hover Effect Particles */}
                      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {[...Array(2)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-blue-400 rounded-full"
                            style={{
                              right: `${10 + i * 20}%`,
                              top: `${30 + i * 30}%`
                            }}
                            animate={{
                              scale: [0, 1, 0],
                              opacity: [0, 1, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.3,
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Enhanced Recent Activities */}
          <div>
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="glass-card p-6 rounded-xl border border-white/20"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Activities</h3>
              
              {recentActivities.length === 0 ? (
                <EmptyStateFormonexAI
                  title="No recent activities"
                  message="Your activities will appear here as you work!"
                  size="small"
                />
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <motion.div 
                      key={activity.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                      className="flex items-start space-x-3 p-3 rounded-lg transition-colors cursor-pointer"
                      onClick={() => handleAIInteraction('dashboard')}
                    >
                      <div className="flex-shrink-0 mt-0.5">
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
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

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

        {/* Enhanced Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="glass-card p-6 rounded-xl border border-white/20"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { icon: ClockIcon, label: 'Mark Attendance', color: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20', iconColor: 'text-blue-600 dark:text-blue-400' },
              { icon: CheckCircleIcon, label: 'View Tasks', color: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20', iconColor: 'text-green-600 dark:text-green-400' },
              { icon: AcademicCapIcon, label: 'Browse Courses', color: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20', iconColor: 'text-purple-600 dark:text-purple-400' },
              { icon: ChatBubbleLeftRightIcon, label: 'Team Chat', color: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20', iconColor: 'text-yellow-600 dark:text-yellow-400' },
              { icon: ArrowDownTrayIcon, label: 'Download Reports', color: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20', iconColor: 'text-red-600 dark:text-red-400' },
              { icon: BellIcon, label: 'Notifications', color: 'from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20', iconColor: 'text-gray-600 dark:text-gray-400' }
            ].map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center p-4 bg-gradient-to-r ${action.color} rounded-lg hover:shadow-lg transition-all duration-200 group`}
                onClick={() => handleAIInteraction('dashboard')}
              >
                <action.icon className={`h-8 w-8 ${action.iconColor} mb-2 group-hover:scale-110 transition-transform duration-200`} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Floating AI Assistant */}
        <FloatingAssistant
          position="bottom-right"
          onHelp={() => handleAIInteraction('help')}
          scenarios={['help', 'tips', 'dashboard', 'tasks', 'learning']}
        />
      </div>

      <Footer />
    </div>
  );
}
