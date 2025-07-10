import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../../components/Footer';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ClockIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function AdminBatches() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [showEditBatch, setShowEditBatch] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newBatch, setNewBatch] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    instructor: '',
    capacity: '',
    department: '',
    status: 'upcoming'
  });

  const departments = ['Development', 'Design', 'Marketing', 'HR', 'Business'];
  const statuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    setLoading(true);
    try {
      // Enhanced mock data with more realistic batch information
      const mockBatches = [
        {
          id: 1,
          name: 'React Development Bootcamp',
          description: 'Comprehensive React training program for beginners to advanced developers',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-04-30'),
          instructor: 'John Smith',
          capacity: 25,
          enrolled: 18,
          department: 'Development',
          status: 'ongoing',
          createdAt: new Date('2024-01-15'),
          progress: 65
        },
        {
          id: 2,
          name: 'UI/UX Design Masterclass',
          description: 'Advanced design principles and modern UI/UX practices',
          startDate: new Date('2024-03-15'),
          endDate: new Date('2024-06-15'),
          instructor: 'Sarah Johnson',
          capacity: 20,
          enrolled: 15,
          department: 'Design',
          status: 'upcoming',
          createdAt: new Date('2024-01-20'),
          progress: 0
        },
        {
          id: 3,
          name: 'Digital Marketing Fundamentals',
          description: 'Essential digital marketing strategies and techniques',
          startDate: new Date('2023-11-01'),
          endDate: new Date('2024-01-31'),
          instructor: 'Mike Wilson',
          capacity: 30,
          enrolled: 28,
          department: 'Marketing',
          status: 'completed',
          createdAt: new Date('2023-10-15'),
          progress: 100
        },
        {
          id: 4,
          name: 'Project Management Certification',
          description: 'Professional project management certification program',
          startDate: new Date('2024-04-01'),
          endDate: new Date('2024-07-31'),
          instructor: 'Emily Davis',
          capacity: 15,
          enrolled: 8,
          department: 'Business',
          status: 'upcoming',
          createdAt: new Date('2024-02-01'),
          progress: 0
        },
        {
          id: 5,
          name: 'Data Science Essentials',
          description: 'Introduction to data science and machine learning',
          startDate: new Date('2024-02-15'),
          endDate: new Date('2024-05-15'),
          instructor: 'Dr. Alex Chen',
          capacity: 18,
          enrolled: 12,
          department: 'Development',
          status: 'ongoing',
          createdAt: new Date('2024-01-28'),
          progress: 45
        }
      ];

      setBatches(mockBatches);
    } catch (error) {
      console.error('Error loading batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ongoing': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getEnrollmentPercentage = (enrolled, capacity) => {
    return Math.round((enrolled / capacity) * 100);
  };

  const getFilteredBatches = () => {
    return batches.filter(batch => {
      const matchesSearch = batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           batch.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           batch.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const handleEditBatch = (batch) => {
    setSelectedBatch(batch);
    setNewBatch({
      name: batch.name,
      description: batch.description,
      startDate: format(batch.startDate, 'yyyy-MM-dd'),
      endDate: format(batch.endDate, 'yyyy-MM-dd'),
      instructor: batch.instructor,
      capacity: batch.capacity.toString(),
      department: batch.department,
      status: batch.status
    });
    setShowEditBatch(true);
  };

  const handleDeleteBatch = (batch) => {
    setSelectedBatch(batch);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setBatches(batches.filter(b => b.id !== selectedBatch.id));
    setShowDeleteConfirm(false);
    setSelectedBatch(null);
  };

  const resetForm = () => {
    setNewBatch({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      instructor: '',
      capacity: '',
      department: '',
      status: 'upcoming'
    });
    setShowAddBatch(false);
    setShowEditBatch(false);
    setSelectedBatch(null);
  };

  const handleAddBatch = async (e) => {
    e.preventDefault();
    if (!newBatch.name || !newBatch.startDate || !newBatch.endDate || !newBatch.instructor || !newBatch.capacity) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const newBatchData = {
        id: Date.now(),
        name: newBatch.name,
        description: newBatch.description,
        startDate: new Date(newBatch.startDate),
        endDate: new Date(newBatch.endDate),
        instructor: newBatch.instructor,
        capacity: parseInt(newBatch.capacity),
        enrolled: 0,
        department: newBatch.department,
        status: newBatch.status,
        createdAt: new Date(),
        progress: 0
      };

      setBatches([...batches, newBatchData]);
      resetForm();
    } catch (error) {
      console.error('Error adding batch:', error);
    }
  };

  const handleUpdateBatch = async (e) => {
    e.preventDefault();
    if (!newBatch.name || !newBatch.startDate || !newBatch.endDate || !newBatch.instructor || !newBatch.capacity) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const updatedBatch = {
        ...selectedBatch,
        name: newBatch.name,
        description: newBatch.description,
        startDate: new Date(newBatch.startDate),
        endDate: new Date(newBatch.endDate),
        instructor: newBatch.instructor,
        capacity: parseInt(newBatch.capacity),
        department: newBatch.department,
        status: newBatch.status
      };

      setBatches(batches.map(b => b.id === selectedBatch.id ? updatedBatch : b));
      resetForm();
    } catch (error) {
      console.error('Error updating batch:', error);
    }
  };

  const updateBatchStatus = (id, newStatus) => {
    setBatches(batches.map(batch => 
      batch.id === id ? { ...batch, status: newStatus } : batch
    ));
  };

  const BatchModal = ({ isEdit = false }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl border border-white/20">
        <div className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Batch' : 'Add New Batch'}
            </h2>
            <button
              onClick={resetForm}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={isEdit ? handleUpdateBatch : handleAddBatch} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Batch Name *
              </label>
              <input
                type="text"
                value={newBatch.name}
                onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter batch name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department *
              </label>
              <select
                value={newBatch.department}
                onChange={(e) => setNewBatch({ ...newBatch, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instructor *
              </label>
              <input
                type="text"
                value={newBatch.instructor}
                onChange={(e) => setNewBatch({ ...newBatch, instructor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter instructor name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Capacity *
              </label>
              <input
                type="number"
                value={newBatch.capacity}
                onChange={(e) => setNewBatch({ ...newBatch, capacity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter capacity"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={newBatch.startDate}
                onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={newBatch.endDate}
                onChange={(e) => setNewBatch({ ...newBatch, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={newBatch.description}
              onChange={(e) => setNewBatch({ ...newBatch, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter batch description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={newBatch.status}
              onChange={(e) => setNewBatch({ ...newBatch, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
            >
              {isEdit ? 'Update Batch' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const DeleteConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="glass-card max-w-md w-full rounded-xl border border-white/20">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center mb-2">
            Delete Batch
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            Are you sure you want to delete "{selectedBatch?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="glass-card p-6 rounded-xl border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Training Batches
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Manage and organize training batches for your organization
              </p>
            </div>
            <button
              onClick={() => setShowAddBatch(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New Batch
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-6 rounded-xl border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search batches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Batches Grid */}
        {loading ? (
          <div className="glass-card p-6 rounded-xl border border-white/20">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredBatches().map((batch) => (
              <div key={batch.id} className="glass-card p-6 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {batch.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {batch.description}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                    {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {format(batch.startDate, 'MMM dd')} - {format(batch.endDate, 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {batch.enrolled}/{batch.capacity} enrolled ({getEnrollmentPercentage(batch.enrolled, batch.capacity)}%)
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                    Instructor: {batch.instructor}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Enrollment Progress</span>
                    <span className="font-medium">{getEnrollmentPercentage(batch.enrolled, batch.capacity)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getEnrollmentPercentage(batch.enrolled, batch.capacity)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <select
                    value={batch.status}
                    onChange={(e) => updateBatchStatus(batch.id, e.target.value)}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditBatch(batch)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBatch(batch)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && getFilteredBatches().length === 0 && (
          <div className="glass-card p-12 rounded-xl border border-white/20 text-center">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No batches found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first training batch.'}
            </p>
            {(!searchQuery && statusFilter === 'all') && (
              <button
                onClick={() => setShowAddBatch(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add New Batch
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddBatch && <BatchModal />}
      {showEditBatch && <BatchModal isEdit={true} />}
      {showDeleteConfirm && <DeleteConfirmModal />}

      <Footer />
    </div>
  );
}
