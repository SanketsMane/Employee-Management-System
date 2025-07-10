import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DatabaseService from '../../services/databaseService';
import { exportEmployeesToExcel } from '../../services/excelService';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  UserCircleIcon,
  ShieldExclamationIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ManageEmployees() {
  const { user, useFirebase } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [onlineStatus, setOnlineStatus] = useState({});

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    joiningDate: '',
    salary: '',
    status: 'active',
    emergencyContact: '',
    address: ''
  });

  const departments = [
    'Development',
    'Design',
    'Marketing',
    'Sales',
    'HR',
    'Finance',
    'Operations',
    'Customer Support'
  ];

  useEffect(() => {
    loadEmployees();
    initializeRealTimeTracking();
  }, [useFirebase]);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchQuery, selectedDepartment, selectedStatus]);

  const initializeRealTimeTracking = () => {
    // Simulate real-time employee status updates
    setInterval(() => {
      updateEmployeeOnlineStatus();
    }, 30000); // Update every 30 seconds
  };

  const updateEmployeeOnlineStatus = () => {
    // Simulate random online status changes
    const newStatus = {};
    employees.forEach(emp => {
      if (Math.random() > 0.8) { // 20% chance of status change
        newStatus[emp.id] = Math.random() > 0.5 ? 'online' : 'offline';
      }
    });
    
    if (Object.keys(newStatus).length > 0) {
      setOnlineStatus(prev => ({ ...prev, ...newStatus }));
    }
  };

  const loadEmployees = async () => {
    setLoading(true);
    try {
      if (useFirebase) {
        const employeesList = await DatabaseService.list(DatabaseService.COLLECTIONS.USERS, {
          where: [{ field: 'role', operator: '==', value: 'employee' }]
        });
        setEmployees(employeesList);
        
        // Initialize online status
        const initialStatus = {};
        employeesList.forEach(emp => {
          initialStatus[emp.id] = emp.isOnline ? 'online' : 'offline';
        });
        setOnlineStatus(initialStatus);
      } else {
        // Demo data
        const demoEmployees = [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@company.com',
            phone: '+1234567890',
            department: 'Development',
            position: 'Senior Developer',
            joiningDate: '2023-01-15',
            salary: '75000',
            status: 'active',
            emergencyContact: '+1234567891',
            address: '123 Main St, City, State',
            lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
            isOnline: true
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@company.com',
            phone: '+1234567892',
            department: 'Design',
            position: 'UI/UX Designer',
            joiningDate: '2023-02-20',
            salary: '65000',
            status: 'active',
            emergencyContact: '+1234567893',
            address: '456 Oak Ave, City, State',
            lastLogin: new Date(Date.now() - 30 * 60 * 1000),
            isOnline: true
          },
          {
            id: 3,
            name: 'Mike Johnson',
            email: 'mike@company.com',
            phone: '+1234567894',
            department: 'Marketing',
            position: 'Marketing Manager',
            joiningDate: '2022-11-10',
            salary: '70000',
            status: 'active',
            emergencyContact: '+1234567895',
            address: '789 Pine St, City, State',
            lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
            isOnline: false
          },
          {
            id: 4,
            name: 'Sarah Wilson',
            email: 'sarah@company.com',
            phone: '+1234567896',
            department: 'HR',
            position: 'HR Specialist',
            joiningDate: '2023-03-05',
            salary: '60000',
            status: 'inactive',
            emergencyContact: '+1234567897',
            address: '321 Elm St, City, State',
            lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            isOnline: false
          }
        ];
        setEmployees(demoEmployees);
        
        // Initialize online status for demo
        const initialStatus = {};
        demoEmployees.forEach(emp => {
          initialStatus[emp.id] = emp.isOnline ? 'online' : 'offline';
        });
        setOnlineStatus(initialStatus);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    if (searchQuery) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(emp => emp.department === selectedDepartment);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(emp => emp.status === selectedStatus);
    }

    setFilteredEmployees(filtered);
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const employeeData = {
        ...newEmployee,
        role: 'employee',
        createdAt: new Date().toISOString(),
        isOnline: false,
        lastLogin: null
      };

      if (useFirebase) {
        const employeeId = await DatabaseService.create(DatabaseService.COLLECTIONS.USERS, employeeData);
        employeeData.id = employeeId;
      } else {
        employeeData.id = Date.now();
      }

      setEmployees(prev => [...prev, employeeData]);
      setNewEmployee({
        name: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        joiningDate: '',
        salary: '',
        status: 'active',
        emergencyContact: '',
        address: ''
      });
      setShowAddEmployee(false);
      toast.success('Employee added successfully!');
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee');
    } finally {
      setSaving(false);
    }
  };

  const handleEditEmployee = async () => {
    if (!selectedEmployee.name || !selectedEmployee.email || !selectedEmployee.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      if (useFirebase) {
        await DatabaseService.update(DatabaseService.COLLECTIONS.USERS, selectedEmployee.id, selectedEmployee);
      }

      setEmployees(prev => prev.map(emp => 
        emp.id === selectedEmployee.id ? selectedEmployee : emp
      ));
      setShowEditEmployee(false);
      setSelectedEmployee(null);
      toast.success('Employee updated successfully!');
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEmployee = async () => {
    setSaving(true);
    try {
      if (useFirebase) {
        await DatabaseService.delete(DatabaseService.COLLECTIONS.USERS, selectedEmployee.id);
      }

      setEmployees(prev => prev.filter(emp => emp.id !== selectedEmployee.id));
      setShowDeleteConfirm(false);
      setSelectedEmployee(null);
      toast.success('Employee removed successfully! (Login access blocked)');
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to remove employee');
    } finally {
      setSaving(false);
    }
  };

  const handleBlockEmployee = async (employee) => {
    try {
      const updatedEmployee = { ...employee, status: 'blocked' };
      
      if (useFirebase) {
        await DatabaseService.update(DatabaseService.COLLECTIONS.USERS, employee.id, updatedEmployee);
      }

      setEmployees(prev => prev.map(emp => 
        emp.id === employee.id ? updatedEmployee : emp
      ));
      toast.success('Employee access blocked');
    } catch (error) {
      console.error('Error blocking employee:', error);
      toast.error('Failed to block employee');
    }
  };

  const handleUnblockEmployee = async (employee) => {
    try {
      const updatedEmployee = { ...employee, status: 'active' };
      
      if (useFirebase) {
        await DatabaseService.update(DatabaseService.COLLECTIONS.USERS, employee.id, updatedEmployee);
      }

      setEmployees(prev => prev.map(emp => 
        emp.id === employee.id ? updatedEmployee : emp
      ));
      toast.success('Employee access restored');
    } catch (error) {
      console.error('Error unblocking employee:', error);
      toast.error('Failed to unblock employee');
    }
  };

  const handleExportEmployees = async () => {
    try {
      toast.loading('Exporting employees data...');
      await exportEmployeesToExcel(filteredEmployees);
      toast.dismiss();
      toast.success('Employees data exported successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export employees data');
      console.error('Export error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOnlineStatusColor = (isOnline) => {
    return isOnline ? 'bg-green-500' : 'bg-gray-400';
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Employees</h2>
          <p className="text-gray-600 dark:text-gray-400">
            View, add, edit, and manage employee access
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportEmployees}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Export Excel
          </button>
          <button
            onClick={() => setShowAddEmployee(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            Showing {filteredEmployees.length} of {employees.length} employees
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Online Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {employee.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{employee.department}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{employee.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${getOnlineStatusColor(onlineStatus[employee.id] === 'online')}`}></div>
                      <span className={`text-sm font-medium ${onlineStatus[employee.id] === 'online' ? 'text-green-600' : 'text-gray-500'}`}>
                        {onlineStatus[employee.id] === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {employee.lastLogin ? format(new Date(employee.lastLogin), 'MMM dd, yyyy h:mm a') : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowEmployeeDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowEditEmployee(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      {employee.status === 'active' ? (
                        <button
                          onClick={() => handleBlockEmployee(employee)}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                          title="Block Access"
                        >
                          <ShieldExclamationIcon className="h-5 w-5" />
                        </button>
                      ) : employee.status === 'blocked' ? (
                        <button
                          onClick={() => handleUnblockEmployee(employee)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Restore Access"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                      ) : null}
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Remove Employee"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No employees found</p>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Employee</h3>
                <button
                  onClick={() => setShowAddEmployee(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department *
                  </label>
                  <select
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={newEmployee.joiningDate}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, joiningDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Salary
                  </label>
                  <input
                    type="number"
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, salary: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    value={newEmployee.emergencyContact}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <textarea
                    value={newEmployee.address}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddEmployee(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEmployee}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditEmployee && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Employee</h3>
                <button
                  onClick={() => setShowEditEmployee(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={selectedEmployee.name}
                    onChange={(e) => setSelectedEmployee(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={selectedEmployee.email}
                    onChange={(e) => setSelectedEmployee(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={selectedEmployee.phone || ''}
                    onChange={(e) => setSelectedEmployee(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department *
                  </label>
                  <select
                    value={selectedEmployee.department}
                    onChange={(e) => setSelectedEmployee(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    value={selectedEmployee.position || ''}
                    onChange={(e) => setSelectedEmployee(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedEmployee.status}
                    onChange={(e) => setSelectedEmployee(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditEmployee(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditEmployee}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Employee'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full mr-4">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Remove Employee</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to remove <strong>{selectedEmployee.name}</strong>? 
                This will block their login access and remove them from the system.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEmployee}
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Removing...' : 'Remove Employee'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Details Modal */}
      {showEmployeeDetails && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Employee Details</h3>
                <button
                  onClick={() => setShowEmployeeDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <UserCircleIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedEmployee.name}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedEmployee.position}</p>
                    <div className="flex items-center mt-2">
                      <div className={`w-3 h-3 rounded-full mr-2 ${getOnlineStatusColor(onlineStatus[selectedEmployee.id] === 'online')}`}></div>
                      <span className={`text-sm font-medium ${onlineStatus[selectedEmployee.id] === 'online' ? 'text-green-600' : 'text-gray-500'}`}>
                        {onlineStatus[selectedEmployee.id] === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Information</h5>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.email}</span>
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.phone || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employment Details</h5>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Department:</span>
                        <span className="text-sm text-gray-900 dark:text-white ml-2">{selectedEmployee.department}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Joining Date:</span>
                        <span className="text-sm text-gray-900 dark:text-white ml-2">
                          {selectedEmployee.joiningDate ? format(new Date(selectedEmployee.joiningDate), 'MMM dd, yyyy') : 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedEmployee.status)}`}>
                          {selectedEmployee.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Activity</h5>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedEmployee.lastLogin ? format(new Date(selectedEmployee.lastLogin), 'MMM dd, yyyy h:mm a') : 'Never logged in'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Emergency Contact</h5>
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedEmployee.emergencyContact || 'Not provided'}
                      </span>
                    </div>
                  </div>
                  
                  {selectedEmployee.address && (
                    <div className="md:col-span-2">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.address}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowEmployeeDetails(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
