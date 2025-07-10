import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DatabaseService from '../../services/databaseService';
import {
  PlusIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';

export default function AssignBatchTask() {
  const { user, useFirebase } = useAuth();
  const [batches, setBatches] = useState([]);
  const [batchTasks, setBatchTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    batchId: '',
    priority: 'medium',
    dueDate: '',
    instructions: '',
    attachments: [],
    estimatedHours: '',
    skills: []
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
    loadBatches();
    loadBatchTasks();
  }, [useFirebase]);

  useEffect(() => {
    filterTasks();
  }, [batchTasks, selectedBatch, searchQuery, selectedPriority, selectedStatus]);

  const loadBatches = async () => {
    try {
      if (useFirebase) {
        const batchesList = await DatabaseService.list(DatabaseService.COLLECTIONS.BATCHES, {
          where: [{ field: 'status', operator: '==', value: 'active' }]
        });
        setBatches(batchesList);
      } else {
        // Demo data
        const demoBatches = [
          {
            id: 1,
            name: 'Frontend Development Batch #3',
            currentMembers: 18,
            maxMembers: 25,
            instructor: 'John Smith'
          },
          {
            id: 2,
            name: 'Backend Development Intensive',
            currentMembers: 15,
            maxMembers: 20,
            instructor: 'Sarah Johnson'
          },
          {
            id: 3,
            name: 'DevOps Fundamentals',
            currentMembers: 12,
            maxMembers: 15,
            instructor: 'Mike Davis'
          }
        ];
        setBatches(demoBatches);
      }
    } catch (error) {
      console.error('Error loading batches:', error);
      toast.error('Failed to load batches');
    }
  };

  const loadBatchTasks = async () => {
    setLoading(true);
    try {
      if (useFirebase) {
        const tasks = await DatabaseService.list(DatabaseService.COLLECTIONS.BATCH_TASKS, {
          orderBy: [{ field: 'createdAt', direction: 'desc' }]
        });
        setBatchTasks(tasks);
      } else {
        // Demo data
        const demoTasks = [
          {
            id: 1,
            title: 'Build a React Todo Application',
            description: 'Create a fully functional todo application using React hooks and state management',
            batchId: 1,
            batchName: 'Frontend Development Batch #3',
            priority: 'high',
            dueDate: addDays(new Date(), 7).toISOString(),
            status: 'active',
            instructions: 'Use React hooks, implement CRUD operations, add local storage, and make it responsive',
            estimatedHours: 8,
            skills: ['React', 'JavaScript', 'HTML/CSS'],
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            assignedBy: 'Admin',
            completedCount: 12,
            totalAssigned: 18
          },
          {
            id: 2,
            title: 'API Development Project',
            description: 'Create a RESTful API with user authentication and CRUD operations',
            batchId: 2,
            batchName: 'Backend Development Intensive',
            priority: 'medium',
            dueDate: addDays(new Date(), 10).toISOString(),
            status: 'active',
            instructions: 'Use Node.js and Express, implement JWT authentication, connect to MongoDB',
            estimatedHours: 12,
            skills: ['Node.js', 'JavaScript', 'MongoDB'],
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            assignedBy: 'Admin',
            completedCount: 8,
            totalAssigned: 15
          },
          {
            id: 3,
            title: 'Docker Containerization Task',
            description: 'Containerize a Node.js application using Docker and create a docker-compose setup',
            batchId: 3,
            batchName: 'DevOps Fundamentals',
            priority: 'medium',
            dueDate: addDays(new Date(), 5).toISOString(),
            status: 'active',
            instructions: 'Create Dockerfile, optimize image size, setup docker-compose with database',
            estimatedHours: 6,
            skills: ['Docker', 'DevOps', 'Node.js'],
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            assignedBy: 'Admin',
            completedCount: 5,
            totalAssigned: 12
          },
          {
            id: 4,
            title: 'Component Library Creation',
            description: 'Build a reusable component library with Storybook documentation',
            batchId: 1,
            batchName: 'Frontend Development Batch #3',
            priority: 'low',
            dueDate: addDays(new Date(), 14).toISOString(),
            status: 'completed',
            instructions: 'Create at least 10 components, add Storybook stories, publish to npm',
            estimatedHours: 16,
            skills: ['React', 'TypeScript', 'Storybook'],
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            assignedBy: 'Admin',
            completedCount: 18,
            totalAssigned: 18
          }
        ];
        setBatchTasks(demoTasks);
      }
    } catch (error) {
      console.error('Error loading batch tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = batchTasks;

    if (selectedBatch && selectedBatch !== 'all') {
      filtered = filtered.filter(task => task.batchId === parseInt(selectedBatch));
    }

    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.batchName.toLowerCase().includes(searchQuery.toLowerCase())
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
    if (!newTask.title || !newTask.description || !newTask.batchId || !newTask.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const selectedBatchData = batches.find(b => b.id === parseInt(newTask.batchId));
      
      const taskData = {
        ...newTask,
        batchId: parseInt(newTask.batchId),
        batchName: selectedBatchData?.name || '',
        status: 'active',
        createdAt: new Date().toISOString(),
        assignedBy: user?.displayName || 'Admin',
        completedCount: 0,
        totalAssigned: selectedBatchData?.currentMembers || 0,
        estimatedHours: parseInt(newTask.estimatedHours) || 0
      };

      if (useFirebase) {
        const taskId = await DatabaseService.create(DatabaseService.COLLECTIONS.BATCH_TASKS, taskData);
        taskData.id = taskId;

        // Create individual task assignments for each batch member
        const batchMembers = await DatabaseService.list(DatabaseService.COLLECTIONS.BATCH_MEMBERS, {
          where: [{ field: 'batchId', operator: '==', value: parseInt(newTask.batchId) }]
        });

        for (const member of batchMembers) {
          await DatabaseService.create(DatabaseService.COLLECTIONS.TASKS, {
            title: taskData.title,
            description: taskData.description,
            assignedTo: member.employeeId,
            assignedBy: user?.uid,
            batchTaskId: taskId,
            batchId: parseInt(newTask.batchId),
            priority: taskData.priority,
            dueDate: taskData.dueDate,
            status: 'pending',
            createdAt: new Date().toISOString(),
            instructions: taskData.instructions,
            estimatedHours: taskData.estimatedHours,
            skills: taskData.skills
          });
        }

        // Send notifications to batch members
        for (const member of batchMembers) {
          await DatabaseService.create(DatabaseService.COLLECTIONS.NOTIFICATIONS, {
            recipientId: member.employeeId,
            title: 'New Batch Task Assigned',
            message: `You have been assigned a new task: ${taskData.title}`,
            type: 'task',
            read: false,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        taskData.id = Date.now();
      }

      setBatchTasks(prev => [taskData, ...prev]);
      setNewTask({
        title: '',
        description: '',
        batchId: '',
        priority: 'medium',
        dueDate: '',
        instructions: '',
        attachments: [],
        estimatedHours: '',
        skills: []
      });
      setShowCreateTask(false);
      toast.success(`Task assigned to ${selectedBatchData?.name || 'batch'} (${selectedBatchData?.currentMembers || 0} members)`);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletionPercentage = (task) => {
    if (task.totalAssigned === 0) return 0;
    return Math.round((task.completedCount / task.totalAssigned) * 100);
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Assign Batch Tasks</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create and assign tasks to entire batches
          </p>
        </div>
        <button
          onClick={() => setShowCreateTask(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Batch Task
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
              <p className="text-xl font-bold text-gray-900 dark:text-white">{batchTasks.length}</p>
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
                {batchTasks.filter(t => t.status === 'completed').length}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {batchTasks.filter(t => t.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Batches</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{batches.length}</p>
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
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Batches</option>
            {batches.map(batch => (
              <option key={batch.id} value={batch.id}>{batch.name}</option>
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
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            Showing {filteredTasks.length} of {batchTasks.length} tasks
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
                    {task.status}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {task.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Batch: <span className="font-medium text-gray-900 dark:text-white">{task.batchName}</span>
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
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {task.completedCount}/{task.totalAssigned} ({getCompletionPercentage(task)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${getCompletionPercentage(task)}%` }}
                    ></div>
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
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-6">
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Batch Task</h3>
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
                    placeholder="e.g., Build a React Todo Application"
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
                    placeholder="Describe what the students need to accomplish..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Assign to Batch *
                    </label>
                    <select
                      value={newTask.batchId}
                      onChange={(e) => setNewTask(prev => ({ ...prev, batchId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Batch</option>
                      {batches.map(batch => (
                        <option key={batch.id} value={batch.id}>
                          {batch.name} ({batch.currentMembers} members)
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
                      placeholder="8"
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
                    placeholder="Provide step-by-step instructions, requirements, and acceptance criteria..."
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
                  {saving ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal would go here */}
    </div>
  );
}
