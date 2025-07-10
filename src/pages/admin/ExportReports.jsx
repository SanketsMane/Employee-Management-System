import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DatabaseService from '../../services/databaseService';
import * as XLSX from 'xlsx';
import {
  DocumentArrowDownIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays, subMonths } from 'date-fns';

export default function ExportReports() {
  const { user, useFirebase } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [batches, setBatches] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [dateRange, setDateRange] = useState('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [reportData, setReportData] = useState([]);

  const reportTypes = [
    {
      id: 'attendance',
      name: 'Attendance Report',
      description: 'Employee attendance logs with check-in/check-out times',
      icon: ClockIcon,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'task_performance',
      name: 'Task Performance Report',
      description: 'Individual and batch task completion statistics',
      icon: CheckCircleIcon,
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'employee_summary',
      name: 'Employee Summary Report',
      description: 'Comprehensive employee performance and activity summary',
      icon: UserGroupIcon,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'batch_analytics',
      name: 'Batch Analytics Report',
      description: 'Batch progress, task completion, and member performance',
      icon: ChartBarIcon,
      color: 'bg-orange-100 text-orange-800'
    },
    {
      id: 'learning_progress',
      name: 'Learning Progress Report',
      description: 'Learning material usage and skill development tracking',
      icon: DocumentArrowDownIcon,
      color: 'bg-indigo-100 text-indigo-800'
    }
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_3_months', label: 'Last 3 Months' },
    { value: 'custom', label: 'Custom Range' }
  ];

  useEffect(() => {
    loadData();
  }, [useFirebase]);

  useEffect(() => {
    generateReportData();
  }, [selectedReport, dateRange, customStartDate, customEndDate, selectedEmployees, selectedBatches]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (useFirebase) {
        const [employeesList, batchesList, tasksList, attendanceList] = await Promise.all([
          DatabaseService.list(DatabaseService.COLLECTIONS.USERS, {
            where: [{ field: 'role', operator: '==', value: 'employee' }]
          }),
          DatabaseService.list(DatabaseService.COLLECTIONS.BATCHES),
          DatabaseService.list(DatabaseService.COLLECTIONS.TASKS),
          DatabaseService.list(DatabaseService.COLLECTIONS.ATTENDANCE)
        ]);
        
        setEmployees(employeesList);
        setBatches(batchesList);
        setTasks(tasksList);
        setAttendanceData(attendanceList);
      } else {
        // Demo data
        const demoEmployees = [
          {
            id: 'emp1',
            name: 'John Doe',
            email: 'john@company.com',
            department: 'Development',
            position: 'Senior Developer',
            joinDate: '2023-01-15',
            totalTasks: 24,
            completedTasks: 20,
            averageRating: 4.7
          },
          {
            id: 'emp2',
            name: 'Jane Smith',
            email: 'jane@company.com',
            department: 'Design',
            position: 'UI/UX Designer',
            joinDate: '2023-03-10',
            totalTasks: 18,
            completedTasks: 16,
            averageRating: 4.9
          },
          {
            id: 'emp3',
            name: 'Mike Johnson',
            email: 'mike@company.com',
            department: 'Marketing',
            position: 'Marketing Manager',
            joinDate: '2022-11-20',
            totalTasks: 15,
            completedTasks: 13,
            averageRating: 4.5
          },
          {
            id: 'emp4',
            name: 'Sarah Wilson',
            email: 'sarah@company.com',
            department: 'HR',
            position: 'HR Specialist',
            joinDate: '2023-05-08',
            totalTasks: 12,
            completedTasks: 11,
            averageRating: 4.8
          }
        ];

        const demoBatches = [
          {
            id: 'batch1',
            name: 'React Development Batch 2024',
            department: 'Development',
            members: ['emp1', 'emp2'],
            totalTasks: 8,
            completedTasks: 6,
            averageProgress: 75
          },
          {
            id: 'batch2',
            name: 'Digital Marketing Campaign',
            department: 'Marketing',
            members: ['emp3'],
            totalTasks: 5,
            completedTasks: 4,
            averageProgress: 80
          }
        ];

        const demoTasks = [
          {
            id: 'task1',
            title: 'Authentication Module Review',
            assignedTo: 'emp1',
            type: 'individual',
            status: 'completed',
            priority: 'high',
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            estimatedHours: 4,
            actualHours: 3.5
          },
          {
            id: 'task2',
            title: 'Design System Documentation',
            assignedTo: 'emp2',
            type: 'individual',
            status: 'in_progress',
            priority: 'medium',
            estimatedHours: 8,
            actualHours: 5
          },
          {
            id: 'task3',
            title: 'Batch React Component Library',
            batchId: 'batch1',
            type: 'batch',
            status: 'completed',
            priority: 'high',
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            estimatedHours: 16,
            actualHours: 18
          }
        ];

        const demoAttendance = Array.from({ length: 30 }, (_, i) => ({
          id: `att_${i}`,
          employeeId: ['emp1', 'emp2', 'emp3', 'emp4'][i % 4],
          employeeName: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'][i % 4],
          date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
          checkIn: format(subDays(new Date(), i).setHours(9, Math.floor(Math.random() * 30)), 'HH:mm'),
          checkOut: format(subDays(new Date(), i).setHours(17, Math.floor(Math.random() * 60)), 'HH:mm'),
          workHours: 8 + Math.random() * 2 - 1,
          status: Math.random() > 0.1 ? 'present' : 'absent'
        }));

        setEmployees(demoEmployees);
        setBatches(demoBatches);
        setTasks(demoTasks);
        setAttendanceData(demoAttendance);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    let start, end;

    switch (dateRange) {
      case 'today':
        start = end = format(now, 'yyyy-MM-dd');
        break;
      case 'yesterday':
        const yesterday = subDays(now, 1);
        start = end = format(yesterday, 'yyyy-MM-dd');
        break;
      case 'this_week':
        start = format(startOfWeek(now), 'yyyy-MM-dd');
        end = format(endOfWeek(now), 'yyyy-MM-dd');
        break;
      case 'last_week':
        const lastWeekStart = startOfWeek(subDays(now, 7));
        const lastWeekEnd = endOfWeek(subDays(now, 7));
        start = format(lastWeekStart, 'yyyy-MM-dd');
        end = format(lastWeekEnd, 'yyyy-MM-dd');
        break;
      case 'this_month':
        start = format(startOfMonth(now), 'yyyy-MM-dd');
        end = format(endOfMonth(now), 'yyyy-MM-dd');
        break;
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        start = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
        end = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
        break;
      case 'last_3_months':
        start = format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd');
        end = format(endOfMonth(now), 'yyyy-MM-dd');
        break;
      case 'custom':
        start = customStartDate;
        end = customEndDate;
        break;
      default:
        start = format(startOfMonth(now), 'yyyy-MM-dd');
        end = format(endOfMonth(now), 'yyyy-MM-dd');
    }

    return { start, end };
  };

  const generateReportData = () => {
    const { start, end } = getDateRange();
    let data = [];

    switch (selectedReport) {
      case 'attendance':
        data = generateAttendanceReport(start, end);
        break;
      case 'task_performance':
        data = generateTaskPerformanceReport(start, end);
        break;
      case 'employee_summary':
        data = generateEmployeeSummaryReport(start, end);
        break;
      case 'batch_analytics':
        data = generateBatchAnalyticsReport(start, end);
        break;
      case 'learning_progress':
        data = generateLearningProgressReport(start, end);
        break;
      default:
        data = [];
    }

    setReportData(data);
  };

  const generateAttendanceReport = (startDate, endDate) => {
    let filteredData = attendanceData.filter(record => {
      const recordDate = record.date;
      return recordDate >= startDate && recordDate <= endDate;
    });

    if (selectedEmployees.length > 0) {
      filteredData = filteredData.filter(record => 
        selectedEmployees.includes(record.employeeId)
      );
    }

    return filteredData.map(record => ({
      'Employee Name': record.employeeName,
      'Date': format(new Date(record.date), 'MMM dd, yyyy'),
      'Check In': record.checkIn,
      'Check Out': record.checkOut,
      'Work Hours': record.workHours.toFixed(1),
      'Status': record.status.charAt(0).toUpperCase() + record.status.slice(1),
      'Department': employees.find(emp => emp.id === record.employeeId)?.department || 'N/A'
    }));
  };

  const generateTaskPerformanceReport = (startDate, endDate) => {
    let filteredTasks = tasks.filter(task => {
      if (task.completedAt) {
        const completedDate = format(new Date(task.completedAt), 'yyyy-MM-dd');
        return completedDate >= startDate && completedDate <= endDate;
      }
      return false;
    });

    if (selectedEmployees.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        selectedEmployees.includes(task.assignedTo)
      );
    }

    return filteredTasks.map(task => {
      const employee = employees.find(emp => emp.id === task.assignedTo);
      return {
        'Task Title': task.title,
        'Employee': employee?.name || 'N/A',
        'Department': employee?.department || 'N/A',
        'Type': task.type.charAt(0).toUpperCase() + task.type.slice(1),
        'Priority': task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
        'Status': task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1),
        'Estimated Hours': task.estimatedHours,
        'Actual Hours': task.actualHours || 'N/A',
        'Completion Date': task.completedAt ? format(new Date(task.completedAt), 'MMM dd, yyyy') : 'N/A',
        'Efficiency': task.actualHours ? ((task.estimatedHours / task.actualHours) * 100).toFixed(1) + '%' : 'N/A'
      };
    });
  };

  const generateEmployeeSummaryReport = (startDate, endDate) => {
    let filteredEmployees = employees;

    if (selectedEmployees.length > 0) {
      filteredEmployees = filteredEmployees.filter(emp => 
        selectedEmployees.includes(emp.id)
      );
    }

    return filteredEmployees.map(employee => {
      const employeeAttendance = attendanceData.filter(record => 
        record.employeeId === employee.id &&
        record.date >= startDate &&
        record.date <= endDate
      );

      const employeeTasks = tasks.filter(task => task.assignedTo === employee.id);
      const completedTasks = employeeTasks.filter(task => task.status === 'completed');

      const presentDays = employeeAttendance.filter(record => record.status === 'present').length;
      const totalDays = employeeAttendance.length;
      const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

      const avgWorkHours = employeeAttendance.length > 0 
        ? (employeeAttendance.reduce((sum, record) => sum + record.workHours, 0) / employeeAttendance.length).toFixed(1)
        : 0;

      return {
        'Employee Name': employee.name,
        'Email': employee.email,
        'Department': employee.department,
        'Position': employee.position,
        'Join Date': format(new Date(employee.joinDate), 'MMM dd, yyyy'),
        'Attendance Rate': attendanceRate + '%',
        'Avg Work Hours': avgWorkHours,
        'Total Tasks': employeeTasks.length,
        'Completed Tasks': completedTasks.length,
        'Task Completion Rate': employeeTasks.length > 0 ? ((completedTasks.length / employeeTasks.length) * 100).toFixed(1) + '%' : '0%',
        'Average Rating': employee.averageRating || 'N/A'
      };
    });
  };

  const generateBatchAnalyticsReport = (startDate, endDate) => {
    let filteredBatches = batches;

    if (selectedBatches.length > 0) {
      filteredBatches = filteredBatches.filter(batch => 
        selectedBatches.includes(batch.id)
      );
    }

    return filteredBatches.map(batch => {
      const batchTasks = tasks.filter(task => task.batchId === batch.id);
      const completedBatchTasks = batchTasks.filter(task => task.status === 'completed');
      
      const memberNames = batch.members.map(memberId => {
        const member = employees.find(emp => emp.id === memberId);
        return member?.name || 'Unknown';
      }).join(', ');

      return {
        'Batch Name': batch.name,
        'Department': batch.department,
        'Members': memberNames,
        'Member Count': batch.members.length,
        'Total Tasks': batchTasks.length,
        'Completed Tasks': completedBatchTasks.length,
        'Task Completion Rate': batchTasks.length > 0 ? ((completedBatchTasks.length / batchTasks.length) * 100).toFixed(1) + '%' : '0%',
        'Average Progress': batch.averageProgress + '%'
      };
    });
  };

  const generateLearningProgressReport = (startDate, endDate) => {
    // This would typically come from learning materials usage tracking
    return employees.map(employee => ({
      'Employee Name': employee.name,
      'Department': employee.department,
      'Materials Accessed': Math.floor(Math.random() * 20) + 5,
      'Videos Watched': Math.floor(Math.random() * 15) + 2,
      'Documents Downloaded': Math.floor(Math.random() * 10) + 1,
      'Courses Completed': Math.floor(Math.random() * 5),
      'Learning Hours': (Math.random() * 40 + 10).toFixed(1),
      'Skill Assessments': Math.floor(Math.random() * 8) + 2,
      'Average Score': (Math.random() * 30 + 70).toFixed(1) + '%'
    }));
  };

  const exportToExcel = () => {
    if (reportData.length === 0) {
      toast.error('No data to export');
      return;
    }

    setGenerating(true);
    try {
      const worksheet = XLSX.utils.json_to_sheet(reportData);
      const workbook = XLSX.utils.book_new();
      
      // Set column widths
      const maxWidth = 20;
      const colWidths = Object.keys(reportData[0]).map(key => ({
        wch: Math.min(maxWidth, Math.max(key.length, ...reportData.map(row => String(row[key]).length)))
      }));
      worksheet['!cols'] = colWidths;

      // Add the worksheet to workbook
      const reportTypeObj = reportTypes.find(type => type.id === selectedReport);
      const sheetName = reportTypeObj?.name || 'Report';
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Generate filename
      const { start, end } = getDateRange();
      const filename = `${selectedReport}_report_${start}_to_${end}.xlsx`;

      // Save the file
      XLSX.writeFile(workbook, filename);
      toast.success(`Report exported successfully as ${filename}`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    } finally {
      setGenerating(false);
    }
  };

  const exportToCSV = () => {
    if (reportData.length === 0) {
      toast.error('No data to export');
      return;
    }

    setGenerating(true);
    try {
      const headers = Object.keys(reportData[0]);
      const csvContent = [
        headers.join(','),
        ...reportData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const { start, end } = getDateRange();
      const filename = `${selectedReport}_report_${start}_to_${end}.csv`;
      
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      
      toast.success(`Report exported successfully as ${filename}`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    } finally {
      setGenerating(false);
    }
  };

  const toggleEmployeeSelection = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const toggleBatchSelection = (batchId) => {
    setSelectedBatches(prev => 
      prev.includes(batchId)
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Export Reports</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Generate and export comprehensive reports in Excel and CSV formats
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportToCSV}
            disabled={generating || reportData.length === 0}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {generating ? (
              <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <TableCellsIcon className="h-5 w-5 mr-2" />
            )}
            Export CSV
          </button>
          <button
            onClick={exportToExcel}
            disabled={generating || reportData.length === 0}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {generating ? (
              <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            )}
            Export Excel
          </button>
        </div>
      </div>

      {/* Report Types */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Report Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => setSelectedReport(type.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedReport === type.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${type.color}`}>
                  <type.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{type.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{type.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            
            {dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Employee Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Employees (Optional)
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
              {employees.map(employee => (
                <label key={employee.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee.id)}
                    onChange={() => toggleEmployeeSelection(employee.id)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {employee.name} - {employee.department}
                  </span>
                </label>
              ))}
            </div>
            {selectedEmployees.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {selectedEmployees.length} employee(s) selected
              </p>
            )}
          </div>
        </div>

        {/* Batch Filter (for relevant reports) */}
        {(selectedReport === 'batch_analytics' || selectedReport === 'task_performance') && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Batches (Optional)
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
              {batches.map(batch => (
                <label key={batch.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                  <input
                    type="checkbox"
                    checked={selectedBatches.includes(batch.id)}
                    onChange={() => toggleBatchSelection(batch.id)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {batch.name} - {batch.department}
                  </span>
                </label>
              ))}
            </div>
            {selectedBatches.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {selectedBatches.length} batch(es) selected
              </p>
            )}
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Report Preview</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {reportData.length} record(s) found
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {reportData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    {Object.keys(reportData[0]).map((header) => (
                      <th key={header} className="text-left py-2 px-3 font-medium text-gray-900 dark:text-white">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.slice(0, 10).map((row, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} className="py-2 px-3 text-gray-700 dark:text-gray-300">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportData.length > 10 && (
                <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Showing first 10 records. Export to see all data.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No data available for the selected filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
