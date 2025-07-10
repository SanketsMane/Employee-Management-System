import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DatabaseService from '../../services/databaseService';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  AcademicCapIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ManageBatches() {
  const { user, useFirebase } = useAuth();
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [batchRequests, setBatchRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [showEditBatch, setShowEditBatch] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('batches');

  const [newBatch, setNewBatch] = useState({
    name: '',
    description: '',
    instructor: '',
    maxMembers: '',
    startDate: '',
    endDate: '',
    status: 'active',
    skills: [],
    requirements: ''
  });

  const [availableSkills] = useState([
    'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java',
    'HTML/CSS', 'Vue.js', 'Angular', 'MongoDB', 'SQL', 'Git',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'DevOps', 'Testing'
  ]);

  useEffect(() => {
    loadBatches();
    loadBatchRequests();
  }, [useFirebase]);

  useEffect(() => {
    filterBatches();
  }, [batches, searchQuery, selectedStatus]);

  const loadBatches = async () => {
    setLoading(true);
    try {
      if (useFirebase) {
        const batchesList = await DatabaseService.list(DatabaseService.COLLECTIONS.BATCHES);
        setBatches(batchesList);
      } else {
        // Demo data
        const demoBatches = [
          {
            id: 1,
            name: 'Frontend Development Batch #3',
            description: 'Complete frontend development course covering React, JavaScript, and modern web technologies',
            instructor: 'John Smith',
            maxMembers: 25,
            currentMembers: 18,
            startDate: '2024-01-15',
            endDate: '2024-04-15',
            status: 'active',
            skills: ['React', 'JavaScript', 'HTML/CSS', 'Git'],
            requirements: 'Basic programming knowledge',
            createdAt: '2024-01-01',
            chatActive: true
          },
          {
            id: 2,
            name: 'Backend Development Intensive',
            description: 'Advanced backend development with Node.js, Express, and database management',
            instructor: 'Sarah Johnson',
            maxMembers: 20,
            currentMembers: 15,
            startDate: '2024-02-01',
            endDate: '2024-05-01',
            status: 'active',
            skills: ['Node.js', 'JavaScript', 'MongoDB', 'SQL'],
            requirements: 'Frontend development experience',
            createdAt: '2024-01-15',
            chatActive: true
          },
          {
            id: 3,
            name: 'DevOps Fundamentals',
            description: 'Introduction to DevOps practices, CI/CD, and cloud technologies',
            instructor: 'Mike Davis',
            maxMembers: 15,
            currentMembers: 12,
            startDate: '2024-03-01',
            endDate: '2024-06-01',
            status: 'upcoming',
            skills: ['Docker', 'Kubernetes', 'AWS', 'DevOps'],
            requirements: 'Basic system administration knowledge',
            createdAt: '2024-02-15',
            chatActive: false
          },
          {
            id: 4,
            name: 'Full Stack Development #2',
            description: 'Comprehensive full-stack development course completed',
            instructor: 'Lisa Wilson',
            maxMembers: 30,
            currentMembers: 28,
            startDate: '2023-09-01',
            endDate: '2023-12-31',
            status: 'completed',
            skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
            requirements: 'Programming fundamentals',
            createdAt: '2023-08-15',
            chatActive: false
          }
        ];
        setBatches(demoBatches);
      }
    } catch (error) {
      console.error('Error loading batches:', error);
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const loadBatchRequests = async () => {
    try {
      if (useFirebase) {
        const requests = await DatabaseService.list(DatabaseService.COLLECTIONS.BATCH_REQUESTS, {
          where: [{ field: 'status', operator: '==', value: 'pending' }],
          orderBy: [{ field: 'requestDate', direction: 'desc' }]
        });
        setBatchRequests(requests);
      } else {
        // Demo data
        const demoRequests = [
          {
            id: 1,
            employeeId: 'emp1',
            employeeName: 'Alex Thompson',
            employeeEmail: 'alex@company.com',
            batchId: 1,
            batchName: 'Frontend Development Batch #3',
            status: 'pending',
            requestDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
            reason: 'I want to improve my React skills and work on modern frontend projects'
          },
          {
            id: 2,
            employeeId: 'emp2',
            employeeName: 'Emma Brown',
            employeeEmail: 'emma@company.com',
            batchId: 2,
            batchName: 'Backend Development Intensive',
            status: 'pending',
            requestDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
            reason: 'Looking to transition from frontend to full-stack development'
          },
          {
            id: 3,
            employeeId: 'emp3',
            employeeName: 'David Garcia',
            employeeEmail: 'david@company.com',
            batchId: 3,
            batchName: 'DevOps Fundamentals',
            status: 'pending',
            requestDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
            reason: 'Want to learn about deployment automation and cloud infrastructure'
          }
        ];
        setBatchRequests(demoRequests);
      }
    } catch (error) {
      console.error('Error loading batch requests:', error);
    }
  };

  const filterBatches = () => {
    let filtered = batches;

    if (searchQuery) {
      filtered = filtered.filter(batch =>
        batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(batch => batch.status === selectedStatus);
    }

    setFilteredBatches(filtered);
  };

  const handleCreateBatch = async () => {
    if (!newBatch.name || !newBatch.instructor || !newBatch.maxMembers) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const batchData = {
        ...newBatch,
        maxMembers: parseInt(newBatch.maxMembers),
        currentMembers: 0,
        createdAt: new Date().toISOString(),
        chatActive: newBatch.status === 'active'
      };

      if (useFirebase) {
        const batchId = await DatabaseService.create(DatabaseService.COLLECTIONS.BATCHES, batchData);
        batchData.id = batchId;
      } else {
        batchData.id = Date.now();
      }

      setBatches(prev => [...prev, batchData]);
      setNewBatch({
        name: '',
        description: '',
        instructor: '',
        maxMembers: '',
        startDate: '',
        endDate: '',
        status: 'active',
        skills: [],
        requirements: ''
      });
      setShowCreateBatch(false);
      toast.success('Batch created successfully!');
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error('Failed to create batch');
    } finally {
      setSaving(false);
    }
  };

  const handleEditBatch = async () => {
    if (!selectedBatch.name || !selectedBatch.instructor || !selectedBatch.maxMembers) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const updatedBatch = {
        ...selectedBatch,
        maxMembers: parseInt(selectedBatch.maxMembers)
      };

      if (useFirebase) {
        await DatabaseService.update(DatabaseService.COLLECTIONS.BATCHES, selectedBatch.id, updatedBatch);
      }

      setBatches(prev => prev.map(batch => 
        batch.id === selectedBatch.id ? updatedBatch : batch
      ));
      setShowEditBatch(false);
      setSelectedBatch(null);
      toast.success('Batch updated successfully!');
    } catch (error) {
      console.error('Error updating batch:', error);
      toast.error('Failed to update batch');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBatch = async () => {
    setSaving(true);
    try {
      if (useFirebase) {
        await DatabaseService.delete(DatabaseService.COLLECTIONS.BATCHES, selectedBatch.id);
      }

      setBatches(prev => prev.filter(batch => batch.id !== selectedBatch.id));
      setShowDeleteConfirm(false);
      setSelectedBatch(null);
      toast.success('Batch deleted successfully!');
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error('Failed to delete batch');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveRequest = async (request) => {
    try {
      // Update request status
      const updatedRequest = { ...request, status: 'approved' };
      
      if (useFirebase) {
        await DatabaseService.update(DatabaseService.COLLECTIONS.BATCH_REQUESTS, request.id, updatedRequest);
        
        // Add user to batch members
        await DatabaseService.create(DatabaseService.COLLECTIONS.BATCH_MEMBERS, {
          batchId: request.batchId,
          employeeId: request.employeeId,
          employeeName: request.employeeName,
          joinedAt: new Date().toISOString(),
          status: 'active'
        });
      }

      // Update batch current members count
      setBatches(prev => prev.map(batch => 
        batch.id === request.batchId 
          ? { ...batch, currentMembers: batch.currentMembers + 1 }
          : batch
      ));

      setBatchRequests(prev => prev.filter(req => req.id !== request.id));
      toast.success(`Approved ${request.employeeName}'s request to join ${request.batchName}`);
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleRejectRequest = async (request) => {
    try {
      const updatedRequest = { ...request, status: 'rejected' };
      
      if (useFirebase) {
        await DatabaseService.update(DatabaseService.COLLECTIONS.BATCH_REQUESTS, request.id, updatedRequest);
      }

      setBatchRequests(prev => prev.filter(req => req.id !== request.id));
      toast.success(`Rejected ${request.employeeName}'s request`);
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addSkillToNewBatch = (skill) => {
    if (!newBatch.skills.includes(skill)) {
      setNewBatch(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkillFromNewBatch = (skill) => {
    setNewBatch(prev => ({
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Batches</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create batches and manage join requests
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowRequestsModal(true)}
            className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors relative"
          >
            <ClockIcon className="h-5 w-5 mr-2" />
            Pending Requests
            {batchRequests.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {batchRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowCreateBatch(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Batch
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            Showing {filteredBatches.length} of {batches.length} batches
          </div>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBatches.map((batch) => (
          <div key={batch.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {batch.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {batch.description}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(batch.status)}`}>
                  {batch.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AcademicCapIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Instructor</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {batch.instructor}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Members</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {batch.currentMembers}/{batch.maxMembers}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(batch.currentMembers / batch.maxMembers) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {format(new Date(batch.startDate), 'MMM dd')} - {format(new Date(batch.endDate), 'MMM dd')}
                  </span>
                </div>
                
                {batch.skills && batch.skills.length > 0 && (
                  <div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {batch.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                      {batch.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{batch.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedBatch(batch);
                      setShowBatchDetails(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    title="View Details"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBatch(batch);
                      setShowEditBatch(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    title="Edit Batch"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBatch(batch);
                      setShowDeleteConfirm(true);
                    }}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    title="Delete Batch"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {batch.chatActive && (
                  <div className="flex items-center">
                    <ChatBubbleLeftRightIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-xs text-green-600 dark:text-green-400">Chat Active</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredBatches.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No batches found</p>
        </div>
      )}

      {/* Create Batch Modal */}
      {showCreateBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Batch</h3>
                <button
                  onClick={() => setShowCreateBatch(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Batch Name *
                  </label>
                  <input
                    type="text"
                    value={newBatch.name}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Frontend Development Batch #4"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newBatch.description}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Describe what this batch will cover..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Instructor *
                  </label>
                  <input
                    type="text"
                    value={newBatch.instructor}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, instructor: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Instructor name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Members *
                  </label>
                  <input
                    type="number"
                    value={newBatch.maxMembers}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, maxMembers: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="25"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newBatch.startDate}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newBatch.endDate}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={newBatch.status}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Skills/Technologies
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newBatch.skills.map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded flex items-center">
                        {skill}
                        <button
                          onClick={() => removeSkillFromNewBatch(skill)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {availableSkills.filter(skill => !newBatch.skills.includes(skill)).map((skill) => (
                      <button
                        key={skill}
                        onClick={() => addSkillToNewBatch(skill)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded transition-colors"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Requirements
                  </label>
                  <textarea
                    value={newBatch.requirements}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, requirements: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Prerequisites or requirements for joining this batch..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateBatch(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBatch}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Batch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Requests Modal */}
      {showRequestsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pending Batch Requests ({batchRequests.length})
                </h3>
                <button
                  onClick={() => setShowRequestsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {batchRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <UserGroupIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{request.employeeName}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{request.employeeEmail}</p>
                          </div>
                        </div>
                        
                        <div className="ml-13">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Wants to join: <span className="font-medium text-gray-900 dark:text-white">{request.batchName}</span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Requested: {format(new Date(request.requestDate), 'MMM dd, yyyy h:mm a')}
                          </p>
                          {request.reason && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                              "{request.reason}"
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleApproveRequest(request)}
                          className="inline-flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                        >
                          <CheckIcon className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request)}
                          className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {batchRequests.length === 0 && (
                  <div className="text-center py-8">
                    <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No pending requests</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Delete/Details Modals would be similar to the Create modal */}
      {/* Add them here if needed */}
    </div>
  );
}
