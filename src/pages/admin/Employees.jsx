import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UsersIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  SparklesIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../../services/api/client';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Employees() {
  const { userProfile } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [selectedEmployeeForShift, setSelectedEmployeeForShift] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [shiftSettings, setShiftSettings] = useState({
    startTime: '09:00',
    endTime: '18:00',
    lateThresholdMinutes: 30,
    halfDayThresholdHours: 4,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    breakDurationMinutes: 60
  });

  // Load employees on component mount
  useEffect(() => {
    if (userProfile?.role === 'admin') {
      loadEmployees();
    }
  }, [userProfile]);

  // Filter employees based on search and status
  useEffect(() => {
    let filtered = employees;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.todayStatus === statusFilter);
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, statusFilter]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/employees');
      const employeesData = response.data?.data || response.data || response;
      setEmployees(employeesData);
      setFilteredEmployees(employeesData);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeDetails = async (employeeId) => {
    try {
      setLoading(true);
      
      // Get employee basic info
      const employee = employees.find(emp => emp._id === employeeId);
      
      // Get employee attendance logs
      const logsResponse = await apiClient.get(`/admin/employee/${employeeId}/logs`);
      const logsData = logsResponse.data?.data || logsResponse.data || logsResponse;
      
      setEmployeeDetails({
        ...employee,
        attendanceLogs: logsData.logs || logsData,
        stats: logsData.stats || {}
      });
      setShowDetails(true);
    } catch (error) {
      console.error('Error loading employee details:', error);
      toast.error('Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      const response = await apiClient.delete(`/admin/employee/${employeeId}`);
      if (response.success !== false) {
        toast.success('Employee deleted successfully');
        loadEmployees(); // Reload the list
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };

    const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const openShiftModal = async (employee) => {
    setSelectedEmployeeForShift(employee);
    try {
      // Try to load existing shift settings for this employee
      const response = await apiClient.get(`/admin/employee/${employee._id}/shift`);
      if (response.data) {
        setShiftSettings(response.data);
      }
    } catch (error) {
      // If no custom shift settings exist, use defaults
      console.log('No custom shift settings found, using defaults');
    }
    setShowShiftModal(true);
  };

  const handleSaveShiftSettings = async () => {
    if (!selectedEmployeeForShift) return;
    
    try {
      setLoading(true);
      await apiClient.post(`/admin/employee/${selectedEmployeeForShift._id}/shift`, shiftSettings);
      toast.success(`Shift settings updated for ${selectedEmployeeForShift.fullName}`);
      setShowShiftModal(false);
      loadEmployees(); // Refresh the employee list
    } catch (error) {
      console.error('Error saving shift settings:', error);
      toast.error('Failed to save shift settings');
    } finally {
      setLoading(false);
    }
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

  const getStatusBadge = (status) => {
    const statusColors = {
      present: 'bg-green-100 text-green-800',
      late: 'bg-yellow-100 text-yellow-800',
      absent: 'bg-red-100 text-red-800',
      'work-from-home': 'bg-blue-100 text-blue-800',
      'half-day': 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        statusColors[status] || 'bg-gray-100 text-gray-800'
      }`}>
        {status?.replace('-', ' ').toUpperCase() || 'NO DATA'}
      </span>
    );
  };

  const getModernStatusBadge = (status) => {
    const statusConfig = {
      present: {
        colors: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
        icon: '✓',
        label: 'Present'
      },
      late: {
        colors: 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white',
        icon: '⏰',
        label: 'Late'
      },
      absent: {
        colors: 'bg-gradient-to-r from-red-500 to-pink-600 text-white',
        icon: '✗',
        label: 'Absent'
      },
      'work-from-home': {
        colors: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white',
        icon: '🏠',
        label: 'WFH'
      },
      'half-day': {
        colors: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white',
        icon: '⏱️',
        label: 'Half Day'
      }
    };

    const config = statusConfig[status] || {
      colors: 'bg-gradient-to-r from-gray-500 to-slate-600 text-white',
      icon: '?',
      label: 'Unknown'
    };

    return (
      <motion.span
        whileHover={{ scale: 1.05 }}
        className={`inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-bold rounded-xl shadow-lg ${config.colors}`}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </motion.span>
    );
  };

  if (userProfile?.role !== 'admin') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center"
      >
        <div className="text-center p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <ExclamationTriangleIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this page.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/25"
              >
                <UsersIcon className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Employee Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                  Manage your team with advanced analytics and controls
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 rounded-2xl shadow-lg"
              >
                <span className="text-white font-bold text-lg">
                  {employees.length} Total
                </span>
              </motion.div>
              
              {/* View Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 shadow-inner">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 shadow-md text-violet-600 dark:text-violet-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">Grid</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-700 shadow-md text-violet-600 dark:text-violet-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <ListBulletIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">List</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-6"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Input */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-6 w-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                placeholder="Search employees by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-lg backdrop-blur-sm transition-all duration-200"
              />
            </div>

            {/* Status Filter */}
            <div className="lg:w-64">
              <div className="relative">
                <FunnelIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-lg backdrop-blur-sm transition-all duration-200 appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                  <option value="work-from-home">Work from Home</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Employee List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent flex items-center space-x-3">
                <SparklesIcon className="w-6 h-6 text-violet-600" />
                <span>Team Members ({filteredEmployees.length})</span>
              </h2>
              {filteredEmployees.length > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {searchTerm || statusFilter !== 'all' ? 'Filtered results' : 'All employees'}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full mx-auto"
              />
              <p className="text-center mt-4 text-gray-600 dark:text-gray-400">Loading employees...</p>
            </div>
          ) : filteredEmployees.length > 0 ? (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="p-6">
                  <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    <AnimatePresence>
                      {filteredEmployees.map((employee, index) => (
                        <motion.div
                          key={employee._id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -8, scale: 1.02 }}
                          className="group relative bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-2xl transition-all duration-300"
                        >
                          {/* Avatar and Status */}
                          <div className="flex items-center justify-between mb-4">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="relative"
                            >
                              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                                <span className="text-xl font-bold text-white">
                                  {employee.fullName?.charAt(0)}
                                </span>
                              </div>
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full border-2 border-white dark:border-gray-800"
                              />
                            </motion.div>
                            
                            <div className="text-right">
                              {getModernStatusBadge(employee.todayStatus)}
                            </div>
                          </div>

                          {/* Employee Info */}
                          <div className="mb-4">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                              {employee.fullName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {employee.email}
                            </p>
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="px-3 py-1 bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-700 dark:text-violet-300 rounded-full">
                                {employee.department || 'No Dept'}
                              </span>
                            </div>
                          </div>

                          {/* Productivity Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Productivity</span>
                              <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                                {employee.averageProductivity || 0}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(employee.averageProductivity || 0, 100)}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                                className="bg-gradient-to-r from-violet-600 to-purple-600 h-2 rounded-full"
                              />
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => loadEmployeeDetails(employee._id)}
                              className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-1"
                            >
                              <EyeIcon className="w-4 h-4" />
                              <span>View</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openShiftModal(employee)}
                              className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200"
                            >
                              <ClockIcon className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Productivity
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Join Date
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                      <AnimatePresence>
                        {filteredEmployees.map((employee, index) => (
                          <motion.tr
                            key={employee._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 dark:hover:from-gray-800/50 dark:hover:to-gray-700/50 transition-all duration-200"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-4">
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  className="relative"
                                >
                                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-lg font-bold text-white">
                                      {employee.fullName?.charAt(0)}
                                    </span>
                                  </div>
                                </motion.div>
                                <div>
                                  <div className="font-bold text-gray-900 dark:text-white">
                                    {employee.fullName}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {employee.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {employee.department || 'Not Assigned'}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {employee.position || 'No Position'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getModernStatusBadge(employee.todayStatus)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 min-w-[80px]">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(employee.averageProductivity || 0, 100)}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 }}
                                    className="bg-gradient-to-r from-violet-600 to-purple-600 h-2 rounded-full"
                                  />
                                </div>
                                <span className="text-sm font-bold text-violet-600 dark:text-violet-400 min-w-[3rem]">
                                  {employee.averageProductivity || 0}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(employee.dateOfJoining)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => loadEmployeeDetails(employee._id)}
                                  className="px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-1"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                  <span>View</span>
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => openShiftModal(employee)}
                                  className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-1"
                                >
                                  <ClockIcon className="w-4 h-4" />
                                  <span>Shift</span>
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setDeleteConfirm(employee)}
                                  className="px-3 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-1"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                  <span>Delete</span>
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-500/25"
              >
                <UserCircleIcon className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No employees found</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria or filters to find the employees you\'re looking for.' 
                  : 'No employees have been registered yet. Start by adding your first team member.'
                }
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Employee Details Modal */}
        {showDetails && employeeDetails && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Employee Details - {employeeDetails.fullName}
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Employee Info */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <div className="text-center mb-6">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl font-bold text-white">
                          {employeeDetails.fullName?.charAt(0)}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {employeeDetails.fullName}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">{employeeDetails.email}</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</label>
                        <p className="text-gray-900 dark:text-white">{employeeDetails.department || 'Not Assigned'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Position</label>
                        <p className="text-gray-900 dark:text-white">{employeeDetails.position || 'No Position'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Join Date</label>
                        <p className="text-gray-900 dark:text-white">{formatDate(employeeDetails.dateOfJoining)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                        <div className="mt-1">
                          {getStatusBadge(employeeDetails.todayStatus)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  {employeeDetails.stats && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-4">
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Statistics</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Days</span>
                          <span className="font-medium dark:text-white">{employeeDetails.stats.totalDays || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Present Days</span>
                          <span className="font-medium text-green-600">{employeeDetails.stats.presentDays || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Late Days</span>
                          <span className="font-medium text-yellow-600">{employeeDetails.stats.lateDays || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Avg Working Hours</span>
                          <span className="font-medium dark:text-white">{formatDuration(employeeDetails.stats.averageWorkingHours)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Avg Productivity</span>
                          <span className="font-medium dark:text-white">{employeeDetails.stats.averageProductivity?.toFixed(1) || 0}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Attendance Logs */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Attendance Logs</h5>
                    
                    {employeeDetails.attendanceLogs && employeeDetails.attendanceLogs.length > 0 ? (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {employeeDetails.attendanceLogs.map((log) => (
                          <div key={log._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {formatDate(log.date)}
                                </span>
                              </div>
                              {getStatusBadge(log.status)}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Check In:</span>
                                <p className="font-medium dark:text-white">{formatTime(log.checkIn)}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Check Out:</span>
                                <p className="font-medium dark:text-white">{formatTime(log.checkOut)}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Working Hours:</span>
                                <p className="font-medium dark:text-white">{formatDuration(log.workingHours)}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Productivity:</span>
                                <p className="font-medium dark:text-white">{log.productivityScore?.toFixed(1) || 0}%</p>
                              </div>
                            </div>

                            {log.breaks && log.breaks.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Breaks:</span>
                                <div className="mt-1 space-y-1">
                                  {log.breaks.map((breakSession, index) => (
                                    <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                                      {formatTime(breakSession.start)} - {formatTime(breakSession.end)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {log.notes && (
                              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Notes:</span>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{log.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No attendance logs found for this employee</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3 text-center">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Employee</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete <strong>{deleteConfirm.fullName}</strong>? 
                    This action cannot be undone and will remove all associated data.
                  </p>
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(deleteConfirm._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shift Settings Modal */}
        {showShiftModal && selectedEmployeeForShift && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Shift Settings for {selectedEmployeeForShift.fullName}
                  </h3>
                  <button
                    onClick={() => setShowShiftModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shift Timing */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Shift Start Time
                    </label>
                    <input
                      type="time"
                      value={shiftSettings.startTime}
                      onChange={(e) => setShiftSettings(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Shift End Time
                    </label>
                    <input
                      type="time"
                      value={shiftSettings.endTime}
                      onChange={(e) => setShiftSettings(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  {/* Late Threshold */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Late Threshold (minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={shiftSettings.lateThresholdMinutes}
                      onChange={(e) => setShiftSettings(prev => ({ ...prev, lateThresholdMinutes: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  {/* Half Day Threshold */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Half Day Threshold (hours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={shiftSettings.halfDayThresholdHours}
                      onChange={(e) => setShiftSettings(prev => ({ ...prev, halfDayThresholdHours: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  {/* Break Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Break Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={shiftSettings.breakDurationMinutes}
                      onChange={(e) => setShiftSettings(prev => ({ ...prev, breakDurationMinutes: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  {/* Working Days */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Working Days
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <label key={day} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={shiftSettings.workingDays.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setShiftSettings(prev => ({
                                  ...prev,
                                  workingDays: [...prev.workingDays, day]
                                }));
                              } else {
                                setShiftSettings(prev => ({
                                  ...prev,
                                  workingDays: prev.workingDays.filter(d => d !== day)
                                }));
                              }
                            }}
                            className="mr-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-xs text-gray-700 dark:text-gray-300">
                            {day.slice(0, 3)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => setShowShiftModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveShiftSettings}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
