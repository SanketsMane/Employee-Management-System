import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../services/api/client';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  ChartBarIcon,
  EyeIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  BoltIcon,
  TrophyIcon,
  FireIcon,
  StarIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon
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

const STATUS_COLORS = {
  'Completed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Pending': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
};

const STATUS_ICONS = {
  'Completed': CheckCircleIcon,
  'In Progress': PlayIcon,
  'Pending': ExclamationTriangleIcon
};

export default function WorksheetDashboard() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('today');
  const [todayOverview, setTodayOverview] = useState([]);
  const [teamComparison, setTeamComparison] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedWorksheet, setSelectedWorksheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('weekly');

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      fetchTodayOverview();
      fetchTeamComparison();
    }
  }, [userProfile, range]);

  const fetchTodayOverview = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/worksheet/admin/today-overview');
      if (response.success) {
        setTodayOverview(response.data);
      }
    } catch (error) {
      console.error('Error fetching today overview:', error);
      toast.error('Failed to load today\'s overview');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamComparison = async () => {
    try {
      const response = await apiClient.get(`/worksheet/admin/team-comparison?range=${range}`);
      if (response.success) {
        setTeamComparison(response.data);
      }
    } catch (error) {
      console.error('Error fetching team comparison:', error);
      toast.error('Failed to load team comparison');
    }
  };

  const fetchEmployeeWorksheet = async (employeeId, date) => {
    try {
      const response = await apiClient.get(`/worksheet/${employeeId}/${date}`);
      if (response.success) {
        setSelectedWorksheet(response.data);
      }
    } catch (error) {
      console.error('Error fetching employee worksheet:', error);
      toast.error('Failed to load employee worksheet');
    }
  };

  const getProductivityColor = (score) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300';
    if (score >= 75) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
    if (score >= 60) return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
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

  // Enhanced Stats Card Component
  const ModernStatsCard = ({ icon: Icon, title, value, subtitle, trend, gradient, bgColor }) => (
    <motion.div
      variants={itemVariants}
      className={`relative overflow-hidden rounded-2xl p-6 ${bgColor} border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300 group`}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className={`text-xs px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
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

  // Modern Employee Card Component
  const ModernEmployeeCard = ({ employee, onViewDetails }) => {
    const StatusIcon = STATUS_ICONS[employee.taskSummary?.status] || DocumentTextIcon;
    
    return (
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300 group"
        whileHover={{ y: -4 }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-md">
                <span className="text-lg font-bold text-white">
                  {employee.employee?.fullName?.charAt(0) || 'N'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {employee.employee?.fullName || 'Unknown'}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {employee.employee?.department || 'No Department'}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getProductivityColor(employee.productivityScore)}`}>
            {employee.productivityScore}%
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {employee.taskSummary?.completed || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {employee.taskSummary?.inProgress || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">
              {employee.taskSummary?.pending || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-4 h-4" />
            <span>{formatDuration(employee.totalWorkHours * 60)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CalendarDaysIcon className="w-4 h-4" />
            <span>{employee.date}</span>
          </div>
        </div>

        <button
          onClick={() => onViewDetails(employee)}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-2 px-4 rounded-xl font-medium hover:from-violet-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <EyeIcon className="w-4 h-4" />
          <span>View Details</span>
        </button>
      </motion.div>
    );
  };

  if (userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-xl"
        >
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">You don't have permission to access this page.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Header */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <DocumentTextIcon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Worksheet Analytics
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400 text-lg">
                  Track team productivity and performance
                </p>
              </div>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
              </select>
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
                { id: 'today', label: 'Today\'s Overview', icon: CalendarDaysIcon },
                { id: 'analytics', label: 'Team Analytics', icon: ChartBarIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
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
          {activeTab === 'today' && (
            <motion.div
              key="today"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-8"
            >
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <>
                  {/* Today's Quick Stats */}
                  <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ModernStatsCard
                      icon={UserGroupIcon}
                      title="Active Employees"
                      value={todayOverview.length}
                      subtitle="Working today"
                      trend={5}
                      gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                      bgColor="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20"
                    />
                    <ModernStatsCard
                      icon={CheckCircleIcon}
                      title="Tasks Completed"
                      value={todayOverview.reduce((sum, emp) => sum + (emp.taskSummary?.completed || 0), 0)}
                      subtitle="Today's achievements"
                      trend={8}
                      gradient="bg-gradient-to-br from-emerald-500 to-green-600"
                      bgColor="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20"
                    />
                    <ModernStatsCard
                      icon={ClockIcon}
                      title="Total Hours"
                      value={todayOverview.reduce((sum, emp) => sum + (emp.totalWorkHours || 0), 0)}
                      subtitle="Work hours logged"
                      trend={3}
                      gradient="bg-gradient-to-br from-purple-500 to-pink-600"
                      bgColor="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20"
                    />
                    <ModernStatsCard
                      icon={TrophyIcon}
                      title="Avg Productivity"
                      value={`${(todayOverview.reduce((sum, emp) => sum + (emp.productivityScore || 0), 0) / todayOverview.length || 0).toFixed(1)}%`}
                      subtitle="Team average"
                      trend={6}
                      gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                      bgColor="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20"
                    />
                  </motion.div>

                  {/* Employee Cards Grid */}
                  <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Performance</h2>
                      <div className="flex items-center space-x-2">
                        <StarIcon className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Today's Activity</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {todayOverview.map((employee, index) => (
                        <ModernEmployeeCard
                          key={employee.employee?._id || index}
                          employee={employee}
                          onViewDetails={(emp) => {
                            setSelectedEmployee(emp);
                            fetchEmployeeWorksheet(emp.employee._id, emp.date);
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-8"
            >
              {teamComparison && (
                <>
                  {/* Team Performance Analytics */}
                  <motion.div
                    variants={itemVariants}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-gray-700/20 shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Team Productivity Trends</h3>
                        <p className="text-gray-600 dark:text-gray-400">Performance comparison across team members</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BoltIcon className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{range.charAt(0).toUpperCase() + range.slice(1)} View</span>
                      </div>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={teamComparison.teamData}>
                          <defs>
                            <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.7}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                          <XAxis dataKey="employee.name" stroke="#6b7280" />
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
                            dataKey="averageProductivity" 
                            fill="url(#productivityGradient)" 
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* Task Completion Analysis */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <motion.div
                      variants={itemVariants}
                      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-gray-700/20 shadow-xl"
                    >
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Task Completion Rate</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { 
                                  name: 'Completed', 
                                  value: teamComparison.teamData.reduce((sum, emp) => sum + emp.totalTasksCompleted, 0),
                                  color: '#10b981' 
                                },
                                { 
                                  name: 'Pending', 
                                  value: teamComparison.teamData.reduce((sum, emp) => sum + (emp.totalTasks - emp.totalTasksCompleted), 0),
                                  color: '#f59e0b' 
                                }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {[{ color: '#10b981' }, { color: '#f59e0b' }].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-gray-700/20 shadow-xl"
                    >
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Work Hours Distribution</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={teamComparison.teamData}>
                            <defs>
                              <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                            <XAxis dataKey="employee.name" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip />
                            <Area
                              type="monotone"
                              dataKey="totalWorkHours"
                              stroke="#3b82f6"
                              fill="url(#hoursGradient)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Employee Details Modal */}
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
                      {selectedEmployee.employee?.fullName?.charAt(0) || 'N'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedEmployee.employee?.fullName || 'Unknown Employee'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">Detailed Worksheet Analysis</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedEmployee(null);
                    setSelectedWorksheet(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors duration-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="p-8">
                {selectedWorksheet ? (
                  <div className="space-y-6">
                    {/* Productivity Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                        <div className="text-3xl font-bold text-emerald-600 mb-2">
                          {selectedWorksheet.productivityScore}%
                        </div>
                        <p className="text-emerald-700 dark:text-emerald-300 font-medium">Productivity Score</p>
                      </div>
                      <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {formatDuration(selectedWorksheet.totalWorkHours * 60)}
                        </div>
                        <p className="text-blue-700 dark:text-blue-300 font-medium">Work Hours</p>
                      </div>
                      <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          {selectedWorksheet.taskSummary?.total || 0}
                        </div>
                        <p className="text-purple-700 dark:text-purple-300 font-medium">Total Tasks</p>
                      </div>
                    </div>

                    {/* Task Breakdown */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Breakdown</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-600 mb-1">
                            {selectedWorksheet.taskSummary?.completed || 0}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {selectedWorksheet.taskSummary?.inProgress || 0}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-amber-600 mb-1">
                            {selectedWorksheet.taskSummary?.pending || 0}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                )}
              </div>

              <div className="flex justify-end p-8 border-t border-gray-200 dark:border-gray-700/50">
                <button
                  onClick={() => {
                    setSelectedEmployee(null);
                    setSelectedWorksheet(null);
                  }}
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
