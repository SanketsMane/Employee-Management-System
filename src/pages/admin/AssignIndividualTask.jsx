import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DatabaseService from '../../services/databaseService';
import {
  PlusIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';

export default function AssignIndividualTask() {
  const { user, useFirebase } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [individualTasks, setIndividualTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    instructions: '',
    estimatedHours: '',
    skills: [],
    attachments: []
  });

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  const availableSkills = [
    'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java',
    'HTML/CSS', 'Vue.js', 'Angular', 'MongoDB', 'SQL', 'Git',
    'Docker', 'Kubernetes', 'AWS', 'Testing', 'UI/UX', 'Problem Solving'
  ];

  useEffect(() => {
    loadEmployees();
    loadIndividualTasks();
  }, [useFirebase]);

  useEffect(() => {
    filterTasks();
  }, [individualTasks, selectedEmployee, searchQuery, selectedPriority, selectedStatus]);

  const loadEmployees = async () => {
    try {
      if (useFirebase) {
        const employeesList = await DatabaseService.list(DatabaseService.COLLECTIONS.USERS, {
          where: [{ field: 'role', operator: '==', value: 'employee' }]
        });
        setEmployees(employeesList);
      } else {
        // Demo data
        const demoEmployees = [
          {
            id: 'emp1',
            name: 'John Doe',
            email: 'john@company.com',
            department: 'Development',
            position: 'Senior Developer',
            isOnline: true
          },
          {
            id: 'emp2',
            name: 'Jane Smith',
            email: 'jane@company.com',
            department: 'Design',
            position: 'UI/UX Designer',
            isOnline: true
          },
          {
            id: 'emp3',
            name: 'Mike Johnson',
            email: 'mike@company.com',
            department: 'Marketing',
            position: 'Marketing Manager',
            isOnline: false
          },
          {
            id: 'emp4',
            name: 'Sarah Wilson',
            email: 'sarah@company.com',
            department: 'HR',
            position: 'HR Specialist',
            isOnline: true
          }
        ];
        setEmployees(demoEmployees);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const loadIndividualTasks = async () => {
    setLoading(true);
    try {
      if (useFirebase) {
        const tasks = await DatabaseService.list(DatabaseService.COLLECTIONS.INDIVIDUAL_TASKS, {
          orderBy: [{ field: 'createdAt', direction: 'desc' }]
        });
        setIndividualTasks(tasks);
      } else {
        // Demo data
        const demoTasks = [
          {
            id: 1,
            title: 'Code Review for Authentication Module',
            description: 'Review the JWT authentication implementation and provide feedback',
            assignedTo: 'emp1',
            assignedToName: 'John Doe',
            assignedToDepartment: 'Development',
            priority: 'high',
            dueDate: addDays(new Date(), 3).toISOString(),
            status: 'in_progress',
            instructions: 'Focus on security best practices and error handling. Check for edge cases.',
            estimatedHours: 4,
            skills: ['JavaScript', 'Node.js', 'Security'],
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            assignedBy: 'Admin',
            lastMessage: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            hasUnreadMessages: true
          },
          {
            id: 2,
            title: 'Design System Component Documentation',
            description: 'Create comprehensive documentation for our design system components',
            assignedTo: 'emp2',
            assignedToName: 'Jane Smith',
            assignedToDepartment: 'Design',
            priority: 'medium',
            dueDate: addDays(new Date(), 7).toISOString(),
            status: 'pending',
            instructions: 'Include usage examples, props documentation, and accessibility guidelines.',
            estimatedHours: 8,
            skills: ['UI/UX', 'Documentation', 'Design Systems'],
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            assignedBy: 'Admin',
            lastMessage: null,
            hasUnreadMessages: false
          },
          {
            id: 3,
            title: 'Marketing Campaign Analysis',
            description: 'Analyze the performance of Q1 marketing campaigns and prepare report',
            assignedTo: 'emp3',
            assignedToName: 'Mike Johnson',
            assignedToDepartment: 'Marketing',
            priority: 'medium',
            dueDate: addDays(new Date(), 5).toISOString(),
            status: 'pending',
            instructions: 'Include ROI analysis, conversion rates, and recommendations for Q2.',
            estimatedHours: 6,
            skills: ['Analytics', 'Marketing', 'Data Analysis'],
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            assignedBy: 'Admin',
            lastMessage: null,
            hasUnreadMessages: false
          },
          {
            id: 4,
            title: 'Employee Onboarding Process Review',
            description: 'Review and improve the current employee onboarding process',
            assignedTo: 'emp4',
            assignedToName: 'Sarah Wilson',
            assignedToDepartment: 'HR',
            priority: 'low',
            dueDate: addDays(new Date(), 10).toISOString(),
            status: 'completed',
            instructions: 'Survey recent hires, identify pain points, and suggest improvements.',
            estimatedHours: 5,
            skills: ['HR', 'Process Improvement', 'Communication'],
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            assignedBy: 'Admin',
            lastMessage: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            hasUnreadMessages: false
          }
        ];
        setIndividualTasks(demoTasks);
      }
    } catch (error) {
      console.error('Error loading individual tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = individualTasks;

    if (selectedEmployee && selectedEmployee !== 'all') {
      filtered = filtered.filter(task => task.assignedTo === selectedEmployee);
    }

    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedToName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    setFilteredTasks(filtered);
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.description || !newTask.assignedTo || !newTask.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const selectedEmployeeData = employees.find(emp => emp.id === newTask.assignedTo);
      
      const taskData = {
        ...newTask,
        assignedToName: selectedEmployeeData?.name || '',
        assignedToDepartment: selectedEmployeeData?.department || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        assignedBy: user?.displayName || 'Admin',
        estimatedHours: parseInt(newTask.estimatedHours) || 0,
        lastMessage: null,
        hasUnreadMessages: false
      };

      if (useFirebase) {
        const taskId = await DatabaseService.create(DatabaseService.COLLECTIONS.INDIVIDUAL_TASKS, taskData);
        taskData.id = taskId;

        // Create notification for the assigned employee
        await DatabaseService.create(DatabaseService.COLLECTIONS.NOTIFICATIONS, {
          recipientId: newTask.assignedTo,
          title: 'New Individual Task Assigned',
          message: `You have been assigned a new task: ${taskData.title}`,
          type: 'task',
          read: false,
          timestamp: new Date().toISOString()
        });
      } else {
        taskData.id = Date.now();
      }

      setIndividualTasks(prev => [taskData, ...prev]);
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: '',
        instructions: '',
        estimatedHours: '',
        skills: [],
        attachments: []
      });
      setShowCreateTask(false);
      toast.success(`Task assigned to ${selectedEmployeeData?.name || 'employee'}`);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const loadChatMessages = async (taskId) => {
    try {
      if (useFirebase) {
        const messages = await DatabaseService.list(DatabaseService.COLLECTIONS.TASK_MESSAGES, {
          where: [{ field: 'taskId', operator: '==', value: taskId }],
          orderBy: [{ field: 'timestamp', direction: 'asc' }]
        });
        setChatMessages(messages);
      } else {
        // Demo messages
        const demoMessages = [
          {
            id: 1,
            taskId: taskId,
            senderId: user?.uid || 'admin',
            senderName: 'Admin',
            message: 'I\'ve assigned this task to you. Please let me know if you have any questions.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            isAdmin: true
          },
          {
            id: 2,
            taskId: taskId,
            senderId: selectedTask?.assignedTo || 'emp1',
            senderName: selectedTask?.assignedToName || 'Employee',
            message: 'Thanks for the assignment. I have a question about the requirements.',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            isAdmin: false
          },
          {
            id: 3,
            taskId: taskId,
            senderId: user?.uid || 'admin',
            senderName: 'Admin',
            message: 'Sure, what would you like to know?',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            isAdmin: true
          }
        ];
        setChatMessages(demoMessages);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTask) return;

    try {
      const messageData = {
        taskId: selectedTask.id,
        senderId: user?.uid || 'admin',
        senderName: user?.displayName || 'Admin',
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
        isAdmin: true
      };

      if (useFirebase) {
        await DatabaseService.create(DatabaseService.COLLECTIONS.TASK_MESSAGES, messageData);
        
        // Create notification for the employee
        await DatabaseService.create(DatabaseService.COLLECTIONS.NOTIFICATIONS, {
          recipientId: selectedTask.assignedTo,
          title: 'New Message',
          message: `Admin sent you a message about: ${selectedTask.title}`,
          type: 'message',
          read: false,
          timestamp: new Date().toISOString()
        });
      }

      setChatMessages(prev => [...prev, { ...messageData, id: Date.now() }]);
      setNewMessage('');
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addSkillToTask = (skill) => {
    if (!newTask.skills.includes(skill)) {
      setNewTask(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkillFromTask = (skill) => {
    setNewTask(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Individual Tasks & Chat</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Assign tasks to specific employees and communicate privately
          </p>
        </div>
        <button
          onClick={() => setShowCreateTask(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Assign Individual Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{individualTasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {individualTasks.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {individualTasks.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Chats</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {individualTasks.filter(t => t.hasUnreadMessages).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name} - {emp.department}</option>
            ))}
          </select>
          
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Priorities</option>
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>{priority.label}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            Showing {filteredTasks.length} of {individualTasks.length} tasks
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {task.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  {task.hasUnreadMessages && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      New Messages
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {task.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Assigned to: <span className="font-medium text-gray-900 dark:text-white">{task.assignedToName}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Due: <span className="font-medium text-gray-900 dark:text-white">
                        {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                      </span>
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Est: <span className="font-medium text-gray-900 dark:text-white">{task.estimatedHours}h</span>
                    </span>
                  </div>
                </div>
                
                {/* Skills */}
                {task.skills && task.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {task.skills.map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Created {format(new Date(task.createdAt), 'MMM dd, yyyy h:mm a')} by {task.assignedBy}
                  {task.lastMessage && (
                    <span className="ml-2">
                      • Last message: {format(new Date(task.lastMessage), 'MMM dd, h:mm a')}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-6">
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    loadChatMessages(task.id);
                    setShowChatModal(true);
                  }}
                  className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 relative"
                  title="Private Chat"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  {task.hasUnreadMessages && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setShowTaskDetails(true);
                  }}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  title="View Details"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button
                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  title="Edit Task"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  title="Delete Task"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Individual Task</h3>
                <button
                  onClick={() => setShowCreateTask(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Code Review for Authentication Module"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Describe what needs to be accomplished..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Assign to Employee *
                    </label>
                    <select
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} - {emp.department}
                          {emp.isOnline && ' (Online)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority *
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      value={newTask.estimatedHours}
                      onChange={(e) => setNewTask(prev => ({ ...prev, estimatedHours: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="4"
                      min="1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Detailed Instructions
                  </label>
                  <textarea
                    value={newTask.instructions}
                    onChange={(e) => setNewTask(prev => ({ ...prev, instructions: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Provide specific instructions, requirements, and expectations..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Required Skills/Technologies
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newTask.skills.map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded flex items-center">
                        {skill}
                        <button
                          onClick={() => removeSkillFromTask(skill)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {availableSkills.filter(skill => !newTask.skills.includes(skill)).map((skill) => (
                      <button
                        key={skill}
                        onClick={() => addSkillToTask(skill)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded transition-colors"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateTask(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Chat: {selectedTask.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    with {selectedTask.assignedToName}
                  </p>
                </div>
                <button
                  onClick={() => setShowChatModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isAdmin 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <p className="text-xs font-medium mb-1 opacity-75">{message.senderName}</p>
                    <p>{message.message}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {format(new Date(message.timestamp), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
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
        </div>
      )}
    </div>
  );
}
