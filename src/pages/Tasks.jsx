import { useState, useEffect } from 'react';import { useAuth } from '../contexts/AuthContext';import { dashboardAPI } from '../services/api/dashboard';import toast from 'react-hot-toast';import {  ClipboardDocumentListIcon,  CalendarDaysIcon,  CheckCircleIcon,  ClockIcon,  ExclamationTriangleIcon,  PlusIcon,  FunnelIcon,  MagnifyingGlassIcon,  ChartBarIcon,  PlayIcon,  PauseIcon,  FlagIcon,  UserIcon,  TagIcon,  EyeIcon,  PencilIcon} from '@heroicons/react/24/outline';

export default function Tasks() {
  const { userProfile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const result = await dashboardAPI.getUserTasks();
      setTasks(result.data || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await dashboardAPI.updateTaskStatus(taskId, newStatus);
      toast.success('Task status updated');
      fetchTasks(); // Refresh tasks
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task status');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    
    return matchesFilter && matchesSearch && matchesPriority;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-emerald-600" />;
      case 'in-progress':
        return <PlayIcon className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <PauseIcon className="h-5 w-5 text-amber-600" />;
      case 'cancelled':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClipboardDocumentListIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityIcon = (priority) => {
    const colors = {
      urgent: 'text-red-600',
      high: 'text-orange-600', 
      medium: 'text-amber-600',
      low: 'text-emerald-600'
    };
    return <FlagIcon className={`h-4 w-4 ${colors[priority] || 'text-gray-600'}`} />;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    urgent: tasks.filter(t => t.priority === 'urgent').length
  };

  const completionRate = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Task Management
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Manage and track your assigned tasks efficiently
                </p>
              </div>
            </div>
            
            <div className="mt-4 lg:mt-0 flex items-center space-x-3">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 text-sm">
                  <ChartBarIcon className="w-4 h-4 text-emerald-600" />
                  <span className="text-gray-600 dark:text-gray-400">Completion:</span>
                  <span className="font-bold text-emerald-600">{completionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Task Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[
            { 
              title: 'Total Tasks', 
              value: taskStats.total, 
              icon: ClipboardDocumentListIcon,
              color: 'text-violet-600',
              bgColor: 'bg-gradient-to-br from-violet-500 to-purple-600'
            },
            { 
              title: 'Completed', 
              value: taskStats.completed,
              icon: CheckCircleIcon,
              color: 'text-emerald-600',
              bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-600'
            },
            { 
              title: 'In Progress', 
              value: taskStats.inProgress,
              icon: PlayIcon,
              color: 'text-blue-600',
              bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-600'
            },
            { 
              title: 'Pending', 
              value: taskStats.pending,
              icon: PauseIcon,
              color: 'text-amber-600',
              bgColor: 'bg-gradient-to-br from-amber-500 to-orange-600'
            },
            { 
              title: 'Urgent', 
              value: taskStats.urgent,
              icon: FlagIcon,
              color: 'text-red-600',
              bgColor: 'bg-gradient-to-br from-red-500 to-pink-600'
            }
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 hover:transform hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center shadow-lg`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
              </div>
              {['all', 'pending', 'in-progress', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filter === status
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>

            {/* Priority Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Priority:</span>
              {['all', 'urgent', 'high', 'medium', 'low'].map((priority) => (
                <button
                  key={priority}
                  onClick={() => setSelectedPriority(priority)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedPriority === priority
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ClipboardDocumentListIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No tasks found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {filter === 'all' ? 'You have no assigned tasks yet. New tasks will appear here when assigned.' : `No ${filter.replace('-', ' ')} tasks found. Try adjusting your filters.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {filteredTasks.map((task) => (
                <div key={task._id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex-shrink-0">
                          {getStatusIcon(task.status)}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {getPriorityIcon(task.priority)}
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                        {task.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                          {task.status.replace('-', ' ')}
                        </span>
                        
                        {task.assignedBy && (
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <UserIcon className="h-4 w-4 mr-1" />
                            Assigned by: {task.assignedBy}
                          </div>
                        )}
                        
                        {task.dueDate && (
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <CalendarDaysIcon className="h-4 w-4 mr-1" />
                            Due: {new Date(task.dueDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        )}
                        
                        {task.category && (
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <TagIcon className="h-4 w-4 mr-1" />
                            {task.category}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {/* Add view task details handler */}}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      
                      {task.status !== 'completed' && (
                        <div className="flex space-x-1">
                          {task.status === 'pending' && (
                            <button
                              onClick={() => updateTaskStatus(task._id, 'in-progress')}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Start
                            </button>
                          )}
                          
                          {task.status === 'in-progress' && (
                            <button
                              onClick={() => updateTaskStatus(task._id, 'completed')}
                              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}