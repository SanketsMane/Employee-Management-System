import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api/client';
import toast from 'react-hot-toast';
import {
  CalendarDaysIcon,
  PlusIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PaperClipIcon,
  UserIcon,
  BuildingOfficeIcon,
  HeartIcon,
  SunIcon,
  MoonIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const LeaveManagement = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    leaveType: 'vacation',
    startDate: '',
    endDate: '',
    reason: '',
    attachments: []
  });

  const leaveTypes = [
    { value: 'vacation', label: 'Vacation', icon: SunIcon, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { value: 'sick', label: 'Sick Leave', icon: HeartIcon, color: 'text-red-600', bgColor: 'bg-red-50' },
    { value: 'personal', label: 'Personal Leave', icon: UserIcon, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { value: 'maternity', label: 'Maternity Leave', icon: HeartIcon, color: 'text-pink-600', bgColor: 'bg-pink-50' },
    { value: 'paternity', label: 'Paternity Leave', icon: UserIcon, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { value: 'emergency', label: 'Emergency Leave', icon: ExclamationTriangleIcon, color: 'text-red-600', bgColor: 'bg-red-50' },
    { value: 'bereavement', label: 'Bereavement Leave', icon: MoonIcon, color: 'text-gray-600', bgColor: 'bg-gray-50' },
    { value: 'other', label: 'Other', icon: DocumentTextIcon, color: 'text-gray-600', bgColor: 'bg-gray-50' }
  ];

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/leaves/my-leaves');
      if (response.success) {
        setLeaves(response.data.leaves || []);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await apiClient.post('/leaves/apply', formData);
      if (response.success) {
        toast.success('Leave request submitted successfully!');
        setShowForm(false);
        setFormData({
          leaveType: 'vacation',
          startDate: '',
          endDate: '',
          reason: '',
          attachments: []
        });
        fetchLeaves();
      }
    } catch (error) {
      console.error('Error submitting leave:', error);
      toast.error('Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'rejected':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    const matchesFilter = filter === 'all' || leave.status === filter;
    const matchesSearch = leave.leaveType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         leave.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const leaveStats = {
    total: leaves.length,
    approved: leaves.filter(l => l.status === 'approved').length,
    pending: leaves.filter(l => l.status === 'pending').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
    totalDays: leaves.filter(l => l.status === 'approved').reduce((sum, leave) => 
      sum + calculateDays(leave.startDate, leave.endDate), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading leave requests...</p>
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
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <CalendarDaysIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Leave Management
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Request time off and manage your leave applications
                </p>
              </div>
            </div>
            
            <div className="mt-4 lg:mt-0">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Request Leave
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Leave Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[
            { 
              title: 'Total Requests', 
              value: leaveStats.total, 
              icon: DocumentTextIcon,
              color: 'text-violet-600',
              bgColor: 'bg-gradient-to-br from-violet-500 to-purple-600'
            },
            { 
              title: 'Approved', 
              value: leaveStats.approved,
              icon: CheckCircleIcon,
              color: 'text-emerald-600',
              bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-600'
            },
            { 
              title: 'Pending', 
              value: leaveStats.pending,
              icon: ClockIcon,
              color: 'text-amber-600',
              bgColor: 'bg-gradient-to-br from-amber-500 to-orange-600'
            },
            { 
              title: 'Rejected', 
              value: leaveStats.rejected,
              icon: XCircleIcon,
              color: 'text-red-600',
              bgColor: 'bg-gradient-to-br from-red-500 to-pink-600'
            },
            { 
              title: 'Days Taken', 
              value: leaveStats.totalDays,
              icon: CalendarDaysIcon,
              color: 'text-blue-600',
              bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-600'
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
                placeholder="Search leaves..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
              </div>
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filter === status
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leave Requests List */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
          {filteredLeaves.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CalendarDaysIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No leave requests found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                {filter === 'all' ? 'You haven\'t submitted any leave requests yet. Click "Request Leave" to get started.' : `No ${filter} leave requests found. Try adjusting your filters.`}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Request Your First Leave
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {filteredLeaves.map((leave) => {
                const leaveType = leaveTypes.find(type => type.value === leave.leaveType);
                const IconComponent = leaveType?.icon || DocumentTextIcon;
                const days = calculateDays(leave.startDate, leave.endDate);
                
                return (
                  <div key={leave._id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-10 h-10 ${leaveType?.bgColor || 'bg-gray-50'} rounded-xl flex items-center justify-center`}>
                            <IconComponent className={`w-5 h-5 ${leaveType?.color || 'text-gray-600'}`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {leaveType?.label || leave.leaveType}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {days} day{days !== 1 ? 's' : ''} • {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                          {leave.reason}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(leave.status)}`}>
                            {getStatusIcon(leave.status)}
                            <span className="ml-2 capitalize">{leave.status}</span>
                          </span>
                          
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <UserIcon className="h-4 w-4 mr-1" />
                            Applied: {new Date(leave.createdAt).toLocaleDateString()}
                          </div>
                          
                          {leave.attachments && leave.attachments.length > 0 && (
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <PaperClipIcon className="h-4 w-4 mr-1" />
                              {leave.attachments.length} attachment{leave.attachments.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {/* Add view leave details handler */}}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        
                        {leave.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {/* Add edit leave handler */}}
                              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Edit Request"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {/* Add cancel leave handler */}}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Cancel Request"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Leave Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Request Leave
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Fill out the form below to submit your leave request
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Leave Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {leaveTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleInputChange('leaveType', type.value)}
                        className={`p-3 rounded-xl border transition-all duration-200 ${
                          formData.leaveType === type.value
                            ? `${type.bgColor} ${type.color} border-current`
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <IconComponent className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-xs font-medium">{type.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    required
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {formData.startDate && formData.endDate && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="w-5 h-5 text-emerald-600 mr-2" />
                    <span className="text-emerald-800 dark:text-emerald-200 font-medium">
                      Total: {calculateDays(formData.startDate, formData.endDate)} day{calculateDays(formData.startDate, formData.endDate) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Leave
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Please provide details about your leave request..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
