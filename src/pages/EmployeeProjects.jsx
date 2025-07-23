import React, { useState, useEffect } from 'react';
import {
  FolderIcon,
  UsersIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../services/api/client';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EmployeeProjects() {
  const { userProfile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    loadEmployeeProjects();
    loadEmployeeTasks();
    loadEmployeeAnnouncements();
  }, []);

  const loadEmployeeProjects = async () => {
    try {
      const response = await apiClient.get('/projects/my-projects');
      if (response.success) {
        setProjects(response.data || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const loadEmployeeTasks = async () => {
    try {
      const response = await apiClient.get('/project-tasks/my-tasks');
      if (response.success) {
        setTasks(response.data || []);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeAnnouncements = async () => {
    try {
      const response = await apiClient.get('/project-announcements/my-announcements');
      if (response.success) {
        setAnnouncements(response.data || []);
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
      toast.error('Failed to load announcements');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const response = await apiClient.put(`/project-tasks/${taskId}/status`, { status });
      if (response.success) {
        toast.success('Task status updated');
        loadEmployeeTasks();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const markAnnouncementRead = async (announcementId) => {
    try {
      await apiClient.put(`/project-announcements/${announcementId}/read`);
      loadEmployeeAnnouncements();
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getTaskStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      'on-hold': 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>
        {status.replace('-', ' ').toUpperCase()}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const getAnnouncementIcon = (type) => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'urgent':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center">
            <FolderIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Projects</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View your assigned projects, tasks, and announcements
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'projects'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Projects ({projects.length})
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tasks'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Tasks ({tasks.length})
              </button>
              <button
                onClick={() => setActiveTab('announcements')}
                className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
                  activeTab === 'announcements'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Announcements ({announcements.length})
                {announcements.some(a => !a.readBy?.some(r => r.user.toString() === userProfile._id)) && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                )}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                {projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <div key={project._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {project.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                              {project.description}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            {getStatusBadge(project.status)}
                            {getPriorityBadge(project.priority)}
                          </div>

                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <UsersIcon className="h-4 w-4 mr-2" />
                            {project.members?.length || 0} members
                          </div>

                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {formatDate(project.startDate)} - {formatDate(project.endDate)}
                          </div>

                          <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-blue-600 rounded-full h-2" 
                              style={{ width: `${project.progress || 0}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 text-right">
                            {project.progress || 0}% complete
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No projects assigned</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      You haven't been assigned to any projects yet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div key={task._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {task.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                            {task.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>Project: {task.project?.name}</span>
                            <span>Due: {formatDate(task.dueDate)}</span>
                            {task.estimatedHours && <span>Est: {task.estimatedHours}h</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getTaskStatusBadge(task.status)}
                          {getPriorityBadge(task.priority)}
                        </div>
                        <div className="flex space-x-2">
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="on-hold">On Hold</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tasks assigned</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      You don't have any tasks assigned yet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Announcements Tab */}
            {activeTab === 'announcements' && (
              <div className="space-y-4">
                {announcements.length > 0 ? (
                  announcements.map((announcement) => {
                    const isRead = announcement.readBy?.some(r => r.user.toString() === userProfile._id);
                    return (
                      <div
                        key={announcement._id}
                        className={`rounded-lg p-6 border ${
                          isRead
                            ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                        }`}
                        onClick={() => !isRead && markAnnouncementRead(announcement._id)}
                      >
                        <div className="flex items-start space-x-3">
                          {getAnnouncementIcon(announcement.type)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {announcement.title}
                              </h3>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(announcement.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                              {announcement.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Project: {announcement.project?.name}
                              </span>
                              {!isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAnnouncementRead(announcement._id);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No announcements</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      You don't have any announcements yet.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
