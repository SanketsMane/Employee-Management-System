import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderIcon,
  PlusIcon,
  UsersIcon,
  CalendarIcon,
  TagIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../../services/api/client';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Projects() {
  const { userProfile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: 'medium',
    budget: { allocated: 0 },
    tags: [],
    memberIds: []
  });
  const [announcementData, setAnnouncementData] = useState({
    title: '',
    message: '',
    type: 'info',
    pinned: false,
    sendToAll: true
  });
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    estimatedHours: 0,
    assignedTo: []
  });

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      loadProjects();
      loadEmployees();
    }
  }, [userProfile]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/projects');
      setProjects(response.data?.projects || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await apiClient.get('/admin/employees');
      setEmployees(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/projects', formData);
      if (response.success) {
        toast.success('Project created successfully');
        setShowCreateModal(false);
        resetForm();
        loadProjects();
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put(`/projects/${selectedProject._id}`, formData);
      if (response.success) {
        toast.success('Project updated successfully');
        setShowEditModal(false);
        resetForm();
        loadProjects();
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const response = await apiClient.delete(`/projects/${projectId}`);
      if (response.success) {
        toast.success('Project deleted successfully');
        loadProjects();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/project-announcements', {
        ...announcementData,
        projectId: selectedProject._id
      });
      if (response.success) {
        toast.success('Announcement created successfully');
        setShowAnnouncementModal(false);
        setAnnouncementData({
          title: '',
          message: '',
          type: 'info',
          pinned: false,
          sendToAll: true
        });
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/project-tasks', {
        ...taskData,
        projectId: selectedProject._id
      });
      if (response.success) {
        toast.success('Task created successfully');
        setShowTaskModal(false);
        setTaskData({
          title: '',
          description: '',
          priority: 'medium',
          dueDate: '',
          estimatedHours: 0,
          assignedTo: []
        });
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      priority: 'medium',
      budget: { allocated: 0 },
      tags: [],
      memberIds: []
    });
    setSelectedProject(null);
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      startDate: project.startDate?.split('T')[0],
      endDate: project.endDate?.split('T')[0],
      priority: project.priority,
      budget: project.budget,
      tags: project.tags || [],
      memberIds: project.members?.map(m => m.user._id) || []
    });
    setShowEditModal(true);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (userProfile?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <FolderIcon className="h-8 w-8 text-blue-600 mr-3" />
                Project Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Create and manage project groups, assign tasks, and make announcements
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Project
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full p-12">
              <LoadingSpinner />
            </div>
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div key={project._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {project.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(project)}
                      className="text-green-600 hover:text-green-800 p-1"
                      title="Edit Project"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(project)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete Project"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
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

                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 rounded-full h-2" 
                      style={{ width: `${project.progress || 0}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 text-right">
                    {project.progress || 0}% complete
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowTaskModal(true);
                      }}
                      className="flex-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center justify-center"
                    >
                      <ClipboardDocumentListIcon className="h-4 w-4 mr-1" />
                      Add Task
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowAnnouncementModal(true);
                      }}
                      className="flex-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-800 flex items-center justify-center"
                    >
                      <BellIcon className="h-4 w-4 mr-1" />
                      Announce
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No projects found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Get started by creating your first project.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Create/Edit Project Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <form onSubmit={showCreateModal ? handleCreateProject : handleUpdateProject}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {showCreateModal ? 'Create New Project' : 'Edit Project'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                      <input
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Budget (Allocated)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.budget.allocated}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        budget: { ...formData.budget, allocated: parseFloat(e.target.value) || 0 }
                      })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Team Members</label>
                    <div className="mt-1 max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700">
                      {employees.map((employee) => (
                        <label key={employee._id} className="flex items-center space-x-2 py-1">
                          <input
                            type="checkbox"
                            checked={formData.memberIds.includes(employee._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  memberIds: [...formData.memberIds, employee._id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  memberIds: formData.memberIds.filter(id => id !== employee._id)
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-900 dark:text-white">{employee.fullName}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {showCreateModal ? 'Create Project' : 'Update Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Project Details Modal */}
        {showDetailsModal && selectedProject && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Project Details - {selectedProject.name}
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Description</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedProject.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Status</h4>
                      {getStatusBadge(selectedProject.status)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Priority</h4>
                      {getPriorityBadge(selectedProject.priority)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Start Date</h4>
                      <p className="text-gray-600 dark:text-gray-400">{formatDate(selectedProject.startDate)}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">End Date</h4>
                      <p className="text-gray-600 dark:text-gray-400">{formatDate(selectedProject.endDate)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Progress</h4>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-2">
                      <div 
                        className="bg-blue-600 rounded-full h-4 flex items-center justify-center text-xs text-white font-medium" 
                        style={{ width: `${selectedProject.progress || 0}%` }}
                      >
                        {selectedProject.progress || 0}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Team Members ({selectedProject.members?.length || 0})</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedProject.members?.map((member) => (
                        <div key={member.user._id} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                              {member.user.fullName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{member.user.fullName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{member.user.email}</p>
                          </div>
                          <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                            {member.role}
                          </span>
                        </div>
                      )) || <p className="text-gray-500 dark:text-gray-400">No members assigned</p>}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Budget</h4>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400">Allocated</p>
                        <p className="text-lg font-bold text-green-800 dark:text-green-300">
                          ${selectedProject.budget?.allocated || 0}
                        </p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900 p-3 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">Spent</p>
                        <p className="text-lg font-bold text-red-800 dark:text-red-300">
                          ${selectedProject.budget?.spent || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Announcement Modal */}
        {showAnnouncementModal && selectedProject && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <form onSubmit={handleCreateAnnouncement}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Create Announcement - {selectedProject.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAnnouncementModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                    <input
                      type="text"
                      required
                      value={announcementData.title}
                      onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={announcementData.message}
                      onChange={(e) => setAnnouncementData({ ...announcementData, message: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                      <select
                        value={announcementData.type}
                        onChange={(e) => setAnnouncementData({ ...announcementData, type: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="success">Success</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="flex items-center mt-6">
                      <input
                        type="checkbox"
                        id="pinned"
                        checked={announcementData.pinned}
                        onChange={(e) => setAnnouncementData({ ...announcementData, pinned: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="pinned" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Pin Announcement
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAnnouncementModal(false)}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Announcement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Task Modal */}
        {showTaskModal && selectedProject && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <form onSubmit={handleCreateTask}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Create Task - {selectedProject.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Task Title</label>
                    <input
                      type="text"
                      required
                      value={taskData.title}
                      onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={taskData.description}
                      onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                      <select
                        value={taskData.priority}
                        onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                      <input
                        type="date"
                        required
                        value={taskData.dueDate}
                        onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Hours</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={taskData.estimatedHours}
                      onChange={(e) => setTaskData({ ...taskData, estimatedHours: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign To</label>
                    <div className="mt-1 max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700">
                      {selectedProject.members?.map((member) => (
                        <label key={member.user._id} className="flex items-center space-x-2 py-1">
                          <input
                            type="checkbox"
                            checked={taskData.assignedTo.includes(member.user._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTaskData({
                                  ...taskData,
                                  assignedTo: [...taskData.assignedTo, member.user._id]
                                });
                              } else {
                                setTaskData({
                                  ...taskData,
                                  assignedTo: taskData.assignedTo.filter(id => id !== member.user._id)
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-900 dark:text-white">{member.user.fullName}</span>
                        </label>
                      )) || <p className="text-gray-500 dark:text-gray-400">No members in this project</p>}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3 text-center">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Project</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? 
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
                    onClick={() => handleDeleteProject(deleteConfirm._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
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
