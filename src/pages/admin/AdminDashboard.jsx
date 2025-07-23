import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UsersIcon, 
  ClockIcon, 
  ChartBarIcon,
  EyeIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BanknotesIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FireIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { apiClient } from '../../services/api/client';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeLogs, setEmployeeLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('week');

  // Load initial data
  useEffect(() => {
    if (userProfile?.role === 'admin') {
      loadDashboardData();
      loadEmployees();
    }
  }, [userProfile]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/dashboard');
      setDashboardStats(response.data || response);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await apiClient.get('/admin/employees');
      setEmployees(response.data || response);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const loadEmployeeLogs = async (employeeId) => {
    setLogsLoading(true);
    try {
      const response = await apiClient.get(`/admin/employee/${employeeId}/logs`);
      setEmployeeLogs(response.data || response);
    } catch (error) {
      console.error('Error loading employee logs:', error);
      toast.error('Failed to load employee logs');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    loadEmployeeLogs(employee._id);
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Prepare chart data
  const attendanceChartData = dashboardStats?.weeklyAttendance?.map(day => ({
    day: day.day,
    present: day.present,
    late: day.late,
    absent: day.absent
  })) || [];

  const productivityChartData = dashboardStats?.topPerformers?.map(emp => ({
    name: emp.name.split(' ')[0],
    productivity: emp.averageProductivity
  })) || [];

  const statusPieData = [
    { name: 'Present', value: dashboardStats?.todayStats?.present || 0, color: '#10b981' },
    { name: 'Late', value: dashboardStats?.todayStats?.late || 0, color: '#f59e0b' },
    { name: 'Absent', value: dashboardStats?.todayStats?.absent || 0, color: '#ef4444' },
    { name: 'WFH', value: dashboardStats?.todayStats?.workFromHome || 0, color: '#3b82f6' }
  ];

  // Modern Stats Card Component
  const StatsCard = ({ icon: Icon, title, value, subtitle, trend, color, bgColor, iconBg }) => (
    <motion.div
      variants={itemVariants}
      className={`relative overflow-hidden rounded-2xl p-6 ${bgColor} border border-white/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group`}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend > 0 ? (
                <ArrowUpIcon className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );

  if (userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-xl"
        >
          <ShieldCheckIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">You don't have permission to access this page.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Modern Header */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <ChartBarIcon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400 text-lg">
                  Real-time insights and analytics
                </p>
              </div>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-xl mb-8"
        >
          <div className="p-2">
            <nav className="flex space-x-2">
              {[
                { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                { id: 'employees', label: 'Team', icon: UserGroupIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-8"
            >
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : dashboardStats ? (
                <>
                  {/* Enhanced Stats Cards */}
                  <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                      icon={UsersIcon}
                      title="Total Employees"
                      value={dashboardStats.totalEmployees}
                      subtitle="Active workforce"
                      trend={5}
                      color="text-blue-600"
                      bgColor="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20"
                      iconBg="bg-blue-100 dark:bg-blue-900/30"
                    />
                    <StatsCard
                      icon={CheckCircleIcon}
                      title="Present Today"
                      value={dashboardStats.todayStats?.present || 0}
                      subtitle={`${((dashboardStats.todayStats?.present || 0) / dashboardStats.totalEmployees * 100).toFixed(1)}% attendance`}
                      trend={2}
                      color="text-emerald-600"
                      bgColor="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20"
                      iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                    />
                    <StatsCard
                      icon={ClockIcon}
                      title="Late Arrivals"
                      value={dashboardStats.todayStats?.late || 0}
                      subtitle="Need attention"
                      trend={-1}
                      color="text-amber-600"
                      bgColor="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20"
                      iconBg="bg-amber-100 dark:bg-amber-900/30"
                    />
                    <StatsCard
                      icon={ArrowTrendingUpIcon}
                      title="Avg Productivity"
                      value={`${dashboardStats.averageProductivity?.toFixed(1)}%`}
                      subtitle="This week"
                      trend={3}
                      color="text-purple-600"
                      bgColor="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20"
                      iconBg="bg-purple-100 dark:bg-purple-900/30"
                    />
                  </motion.div>

                  {/* Enhanced Charts Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Weekly Attendance Chart */}
                    <motion.div
                      variants={itemVariants}
                      className="xl:col-span-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-gray-700/20 shadow-xl"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Weekly Attendance Trends</h3>
                          <p className="text-gray-600 dark:text-gray-400">Track daily attendance patterns</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Present</span>
                          <div className="w-3 h-3 bg-amber-500 rounded-full ml-4"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Late</span>
                          <div className="w-3 h-3 bg-red-500 rounded-full ml-4"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Absent</span>
                        </div>
                      </div>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={attendanceChartData}>
                            <defs>
                              <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="lateGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                            <XAxis dataKey="day" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                                border: 'none',
                                borderRadius: '12px',
                                backdropFilter: 'blur(10px)'
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="present"
                              stackId="1"
                              stroke="#10b981"
                              fill="url(#presentGradient)"
                            />
                            <Area
                              type="monotone"
                              dataKey="late"
                              stackId="1"
                              stroke="#f59e0b"
                              fill="url(#lateGradient)"
                            />
                            <Area
                              type="monotone"
                              dataKey="absent"
                              stackId="1"
                              stroke="#ef4444"
                              fill="url(#absentGradient)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>

                    {/* Today's Status Distribution */}
                    <motion.div
                      variants={itemVariants}
                      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-gray-700/20 shadow-xl"
                    >
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Today's Status</h3>
                        <p className="text-gray-600 dark:text-gray-400">Current attendance breakdown</p>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {statusPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                                border: 'none',
                                borderRadius: '12px',
                                backdropFilter: 'blur(10px)'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {statusPieData.map((item, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}: {item.value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Enhanced Productivity Overview */}
                  <motion.div
                    variants={itemVariants}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-gray-700/20 shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Team Productivity Insights</h3>
                        <p className="text-gray-600 dark:text-gray-400">Performance metrics and trends</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <SparklesIcon className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Performers</span>
                      </div>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productivityChartData}>
                          <defs>
                            <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.7}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                          <XAxis dataKey="name" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'rgba(17, 24, 39, 0.8)',
                              border: 'none',
                              borderRadius: '12px',
                              backdropFilter: 'blur(10px)'
                            }}
                          />
                          <Bar 
                            dataKey="productivity" 
                            fill="url(#productivityGradient)" 
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </>
              ) : (
                <motion.div 
                  variants={itemVariants}
                  className="text-center py-12"
                >
                  <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No data available</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'employees' && (
            <motion.div
              key="employees"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-8"
            >
              {/* Enhanced Employee Table */}
              <motion.div
                variants={itemVariants}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-xl overflow-hidden"
              >
                <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700/50">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Team Overview</h3>
                  <p className="text-gray-600 dark:text-gray-400">Manage and monitor your team members</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Productivity
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
                      {employees.map((employee, index) => (
                        <motion.tr 
                          key={employee._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-md">
                                  <span className="text-sm font-bold text-white">
                                    {employee.name?.charAt(0)}
                                  </span>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">{employee.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                              {employee.department || 'Unassigned'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              employee.todayStatus === 'present' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                              employee.todayStatus === 'late' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                              employee.todayStatus === 'absent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {employee.todayStatus || 'No data'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${employee.averageProductivity || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {employee.averageProductivity?.toFixed(1) || 0}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewEmployee(employee)}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/30 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-lg transition-colors duration-200"
                            >
                              <EyeIcon className="h-4 w-4" />
                              <span>View Logs</span>
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Employee Logs Modal */}
      <AnimatePresence>
        {selectedEmployee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-w-4xl mx-auto my-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20"
            >
              <div className="flex items-center justify-between p-8 border-b border-gray-200 dark:border-gray-700/50">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-md">
                    <span className="text-lg font-bold text-white">
                      {selectedEmployee.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedEmployee.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">Attendance History</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors duration-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="p-8 max-h-96 overflow-y-auto">
                {logsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : employeeLogs.length > 0 ? (
                  <div className="space-y-4">
                    {employeeLogs.map((log, index) => (
                      <motion.div
                        key={log._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {new Date(log.date).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            log.status === 'present' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                            log.status === 'late' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                            log.status === 'absent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div className="space-y-1">
                            <p className="text-gray-500 dark:text-gray-400">Check In</p>
                            <p className="font-medium text-gray-900 dark:text-white">{formatTime(log.checkIn)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-500 dark:text-gray-400">Check Out</p>
                            <p className="font-medium text-gray-900 dark:text-white">{formatTime(log.checkOut)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-500 dark:text-gray-400">Working Hours</p>
                            <p className="font-medium text-gray-900 dark:text-white">{formatDuration(log.workingHours)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-500 dark:text-gray-400">Break Time</p>
                            <p className="font-medium text-gray-900 dark:text-white">{formatDuration(log.breakHours)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-500 dark:text-gray-400">Productivity</p>
                            <p className="font-medium text-gray-900 dark:text-white">{log.productivityScore?.toFixed(1)}%</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-500 dark:text-gray-400">Break Sessions</p>
                            <p className="font-medium text-gray-900 dark:text-white">{log.breaks?.length || 0}</p>
                          </div>
                        </div>
                        {log.notes && (
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Notes:</strong> {log.notes}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CalendarDaysIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No attendance logs found</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end p-8 border-t border-gray-200 dark:border-gray-700/50">
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
