import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../services/api/client';
import Footer from '../../components/Footer';
import {
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentChartBarIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function AdminReports() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState({
    attendance: [],
    tasks: [],
    leaves: [],
    employees: []
  });
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeProjects: 0,
    completionRate: 0,
    avgAttendance: 0
  });
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const departments = ['all', 'Development', 'Design', 'Marketing', 'HR', 'Business'];

  const getOverallStats = async () => {
    try {
      const response = await apiClient.get('/analytics/reports/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching overview stats:', error);
      return {
        totalEmployees: 0,
        activeProjects: 0,
        completionRate: 0,
        avgAttendance: 0
      };
    }
  };

  useEffect(() => {
    loadReportData();
    loadStats();
  }, [selectedReport, dateRange]);

  const loadStats = async () => {
    try {
      const statsData = await getOverallStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadReportData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      
      switch (selectedReport) {
        case 'attendance':
          endpoint = `/analytics/reports/attendance?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
          if (selectedDepartment !== 'all') {
            endpoint += `&department=${selectedDepartment}`;
          }
          break;
        case 'tasks':
          endpoint = `/analytics/reports/tasks`;
          if (selectedDepartment !== 'all') {
            endpoint += `?department=${selectedDepartment}`;
          }
          break;
        case 'employees':
          endpoint = `/analytics/reports/employees`;
          if (selectedDepartment !== 'all') {
            endpoint += `?department=${selectedDepartment}`;
          }
          break;
        case 'leaves':
          endpoint = `/analytics/reports/leaves?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
          if (selectedDepartment !== 'all') {
            endpoint += `&department=${selectedDepartment}`;
          }
          break;
        default:
          endpoint = `/analytics/reports/overview`;
      }

      const response = await apiClient.get(endpoint);
      setReportData({
        ...reportData,
        [selectedReport]: response.data
      });

    } catch (error) {
      console.error('Error loading report data:', error);
      setReportData({
        ...reportData,
        [selectedReport]: []
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const data = reportData[selectedReport];
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedReport}_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const keys = Object.keys(data[0]);
    const csvContent = [
      keys.join(','),
      ...data.map(row => keys.map(key => row[key]).join(','))
    ].join('\n');
    
    return csvContent;
  };

  const renderStatsCards = () => {
    const cards = [
      { label: 'Total Employees', value: stats.totalEmployees, icon: UsersIcon, color: 'text-blue-600' },
      { label: 'Active Projects', value: stats.activeProjects, icon: DocumentChartBarIcon, color: 'text-green-600' },
      { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: CheckCircleIcon, color: 'text-purple-600' },
      { label: 'Avg Attendance', value: `${stats.avgAttendance}%`, icon: ClockIcon, color: 'text-orange-600' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <div key={index} className="glass-card p-6 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-gradient-to-r from-primary-500/20 to-secondary-500/20 ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAttendanceReport = () => (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-xl border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Daily Attendance Overview
          </h3>
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Last 5 days</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Present
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Absent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Late
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Attendance Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {reportData.attendance.map((record, index) => {
                const attendanceRate = ((record.present / record.total) * 100).toFixed(1);
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {format(new Date(record.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                      {record.present}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-medium">
                      {record.absent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                      {record.late}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${attendanceRate}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{attendanceRate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTasksReport = () => (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-xl border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tasks by Department
          </h3>
          <div className="flex items-center space-x-2">
            <ChartPieIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Department Performance</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Pending
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Overdue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Completion Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {reportData.tasks.map((record, index) => {
                const rate = ((record.completed / record.total) * 100).toFixed(1);
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                      {record.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                      {record.completed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                      {record.pending}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-medium">
                      {record.overdue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${rate}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderLeavesReport = () => (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-xl border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Leave Statistics
          </h3>
          <div className="flex items-center space-x-2">
            <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Leave Analysis</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportData.leaves.map((leave, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">{leave.leaveType}</h4>
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  {leave.approvalRate}% Approved
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Total Requests</span>
                  <span className="font-medium text-gray-900 dark:text-white">{leave.totalRequests}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Approved</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{leave.approved}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Pending</span>
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">{leave.pending}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Rejected</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{leave.rejected}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Total Days</span>
                  <span className="font-medium text-gray-900 dark:text-white">{leave.totalDays}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${leave.approvalRate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {reportData.leaves.length === 0 && (
          <div className="text-center py-12">
            <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No leave data available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No leave requests found for the selected date range and filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderEmployeesReport = () => (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-xl border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Employee Performance
          </h3>
          <div className="flex items-center space-x-2">
            <UsersIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Top Performers</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tasks Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Learning Hours
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {reportData.employees.map((employee, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                    {employee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                    {employee.tasksCompleted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2 w-16">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${employee.attendance}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{employee.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 dark:text-purple-400 font-medium">
                    {employee.learningHours}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReport = () => {
    switch (selectedReport) {
      case 'attendance':
        return renderAttendanceReport();
      case 'tasks':
        return renderTasksReport();
      case 'leaves':
        return renderLeavesReport();
      case 'employees':
        return renderEmployeesReport();
      default:
        return renderAttendanceReport();
    }
  };

  const renderModernStatsCards = () => {
    const cards = [
      { 
        label: 'Total Employees', 
        value: stats.totalEmployees, 
        icon: UsersIcon, 
        color: 'from-blue-500 to-cyan-600',
        bgColor: 'from-blue-500/10 to-cyan-500/10'
      },
      { 
        label: 'Active Projects', 
        value: stats.activeProjects, 
        icon: DocumentChartBarIcon, 
        color: 'from-emerald-500 to-teal-600',
        bgColor: 'from-emerald-500/10 to-teal-500/10'
      },
      { 
        label: 'Completion Rate', 
        value: `${stats.completionRate}%`, 
        icon: CheckCircleIcon, 
        color: 'from-purple-500 to-indigo-600',
        bgColor: 'from-purple-500/10 to-indigo-500/10'
      },
      { 
        label: 'Avg Attendance', 
        value: `${stats.avgAttendance}%`, 
        icon: ClockIcon, 
        color: 'from-orange-500 to-amber-600',
        bgColor: 'from-orange-500/10 to-amber-500/10'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`relative overflow-hidden bg-gradient-to-br ${card.bgColor} backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-2xl transition-all duration-300`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
              <motion.div 
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className={`p-4 rounded-2xl bg-gradient-to-r ${card.color} shadow-lg`}
              >
                <card.icon className="w-8 h-8 text-white" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderModernReport = () => {
    switch (selectedReport) {
      case 'attendance':
        return renderModernAttendanceReport();
      case 'tasks':
        return renderModernTasksReport();
      case 'leaves':
        return renderModernLeavesReport();
      case 'employees':
        return renderModernEmployeesReport();
      default:
        return renderModernAttendanceReport();
    }
  };

  const renderModernAttendanceReport = () => (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
            <ClockIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Attendance Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Daily attendance patterns and trends
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {reportData.attendance && reportData.attendance.length > 0 ? (
        <div className="space-y-6">
          {reportData.attendance.map((record, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30 rounded-2xl p-6 border border-white/20 dark:border-gray-700/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Date</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{record.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present</p>
                  <p className="text-lg font-bold text-emerald-600">{record.present || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Late</p>
                  <p className="text-lg font-bold text-amber-600">{record.late || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Absent</p>
                  <p className="text-lg font-bold text-red-600">{record.absent || 0}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6 opacity-50"
          >
            <ClockIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No attendance data</h3>
          <p className="text-gray-600 dark:text-gray-400">No attendance records found for the selected period.</p>
        </div>
      )}
    </div>
  );

  const renderModernTasksReport = () => (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8">
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tasks Report</h3>
        <p className="text-gray-600 dark:text-gray-400">Task analytics will be displayed here.</p>
      </div>
    </div>
  );

  const renderModernLeavesReport = () => (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8">
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CalendarDaysIcon className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Leave Report</h3>
        <p className="text-gray-600 dark:text-gray-400">Leave analytics will be displayed here.</p>
      </div>
    </div>
  );

  const renderModernEmployeesReport = () => (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8">
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <UsersIcon className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Employee Report</h3>
        <p className="text-gray-600 dark:text-gray-400">Employee analytics will be displayed here.</p>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-pink-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 mb-8 overflow-hidden"
        >
          <div className="relative p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 dark:from-violet-500/5 dark:via-purple-500/5 dark:to-pink-500/5" />
            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between">
              <div className="mb-6 lg:mb-0">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center space-x-4 mb-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <ChartBarIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Reports & Analytics
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      Generate insightful reports and track organizational metrics
                    </p>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-6 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl text-gray-700 dark:text-gray-300 rounded-2xl border border-white/20 dark:border-gray-700/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <FunnelIcon className="w-5 h-5" />
                  <span className="font-medium">Filters</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportReport}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-2xl hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  <span className="font-medium">Export Report</span>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Modern Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {renderModernStatsCards()}
        </motion.div>

        {/* Modern Report Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 mb-8 p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                📊 Report Type
              </label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200 shadow-lg"
              >
                <option value="attendance">📅 Attendance Report</option>
                <option value="tasks">✅ Tasks Report</option>
                <option value="leaves">🏖️ Leave Report</option>
                <option value="employees">👥 Employees Report</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                📅 Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200 shadow-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                📅 End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200 shadow-lg"
              />
            </div>
            
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  🏢 Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200 shadow-lg"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? '🏢 All Departments' : dept}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Modern Report Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {loading ? (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-16">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-2xl mb-6 animate-pulse">
                  <ChartBarIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Generating Report...
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Please wait while we compile your analytics data
                </p>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 rounded-full animate-spin" />
                </div>
              </div>
            </div>
          ) : (
            renderModernReport()
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
