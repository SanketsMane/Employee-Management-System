import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../services/api/client';
import {
  CalendarDaysIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  UsersIcon,
  BanknotesIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  HeartIcon,
  BeakerIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';

const LeaveManagement = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    adminComments: ''
  });

  const leaveTypes = [
    { value: 'vacation', label: 'Vacation' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'personal', label: 'Personal Leave' },
    { value: 'maternity', label: 'Maternity Leave' },
    { value: 'paternity', label: 'Paternity Leave' },
    { value: 'emergency', label: 'Emergency Leave' },
    { value: 'bereavement', label: 'Bereavement Leave' },
    { value: 'other', label: 'Other' }
  ];

  const statusColors = {
    pending: 'text-yellow-600 bg-yellow-100',
    approved: 'text-green-600 bg-green-100',
    rejected: 'text-red-600 bg-red-100'
  };

  const statusIcons = {
    pending: '🕐',
    approved: '✅',
    rejected: '❌'
  };

  useEffect(() => {
    fetchLeaves();
    fetchStats();
  }, [filter, departmentFilter, leaveTypeFilter]);

  const fetchLeaves = async () => {
    try {
      const params = new URLSearchParams({
        status: filter,
        department: departmentFilter,
        leaveType: leaveTypeFilter,
        limit: '50'
      });

      const response = await apiClient.get(`/leaves/admin/all?${params}`);
      setLeaves(response.data.leaves);
    } catch (error) {
      console.error('Failed to fetch leaves:', error.message);
      // Don't retry if it's a rate limit error
      if (error.message.includes('Too many requests')) {
        alert('Server is busy. Please wait a moment and refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/leaves/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error.message);
      // Don't retry if it's a rate limit error
      if (error.message.includes('Too many requests')) {
        console.warn('Skipping stats fetch due to rate limiting');
      }
    }
  };

  const handleReview = async (leaveId) => {
    try {
      const response = await apiClient.put(`/leaves/${leaveId}/review`, reviewData);
      alert(`Leave request ${reviewData.status} successfully!`);
      setSelectedLeave(null);
      setReviewData({ status: 'approved', adminComments: '' });
      fetchLeaves();
      fetchStats();
    } catch (error) {
      console.error('Error reviewing leave:', error);
      alert('Failed to review leave request');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDepartments = () => {
    const departments = [...new Set(leaves.map(leave => leave.employee?.department).filter(Boolean))];
    return departments;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-pink-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CalendarDaysIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Loading Leave Management</h3>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 rounded-full animate-spin" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leave Management</h1>
          <p className="text-gray-600">Review and manage employee leave requests</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-3xl text-yellow-500 mr-4">🕐</div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingCount}</p>
                  <p className="text-sm text-gray-500">Pending Requests</p>
                </div>
              </div>
            </div>

            {stats.statusStats?.map(stat => (
              <div key={stat._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">{statusIcons[stat._id]}</div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                    <p className="text-sm text-gray-500">
                      {stat._id.charAt(0).toUpperCase() + stat._id.slice(1)} ({stat.totalDays} days)
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {getDepartments().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
              <select
                value={leaveTypeFilter}
                onChange={(e) => setLeaveTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {leaveTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilter('all');
                  setDepartmentFilter('all');
                  setLeaveTypeFilter('all');
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Leave Requests List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Leave Requests ({leaves.length})</h2>
          </div>

          {leaves.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
              <p className="text-gray-500">No leave requests match the current filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leaves.map((leave) => (
                <div key={leave._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {leave.employee?.fullName || 'Unknown Employee'}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({leave.employee?.department}) - {leave.employee?.position}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[leave.status]}`}>
                          <span className="mr-1">{statusIcons[leave.status]}</span>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">Leave Type</p>
                          <p className="text-sm font-medium text-gray-900">
                            {leaveTypes.find(type => type.value === leave.leaveType)?.label || leave.leaveType}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                          </p>
                          <p className="text-xs text-gray-500">{leave.totalDays} day(s)</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Applied On</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(leave.appliedAt)}
                          </p>
                        </div>
                        {leave.reviewedAt && (
                          <div>
                            <p className="text-sm text-gray-500">Reviewed On</p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(leave.reviewedAt)}
                            </p>
                            {leave.reviewedBy && (
                              <p className="text-xs text-gray-500">
                                by {leave.reviewedBy.fullName}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-500">Reason</p>
                        <p className="text-sm text-gray-900">{leave.reason}</p>
                      </div>

                      {leave.adminComments && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <p className="text-sm text-gray-500 mb-1">Admin Comments</p>
                          <p className="text-sm text-gray-900">{leave.adminComments}</p>
                        </div>
                      )}
                    </div>

                    {leave.status === 'pending' && (
                      <div className="ml-4 flex space-x-2">
                        <button
                          onClick={() => setSelectedLeave(leave)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                        >
                          Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Modal */}
        {selectedLeave && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Review Leave Request</h2>
                  <button
                    onClick={() => {
                      setSelectedLeave(null);
                      setReviewData({ status: 'approved', adminComments: '' });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>

                {/* Leave Details */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Leave Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Employee:</span>
                      <span className="ml-2 font-medium">{selectedLeave.employee?.fullName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Department:</span>
                      <span className="ml-2 font-medium">{selectedLeave.employee?.department}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Leave Type:</span>
                      <span className="ml-2 font-medium">
                        {leaveTypes.find(type => type.value === selectedLeave.leaveType)?.label}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-2 font-medium">{selectedLeave.totalDays} day(s)</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Date Range:</span>
                      <span className="ml-2 font-medium">
                        {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Reason:</span>
                      <p className="mt-1 text-gray-900">{selectedLeave.reason}</p>
                    </div>
                  </div>
                </div>

                {/* Review Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Decision *
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="approved"
                          checked={reviewData.status === 'approved'}
                          onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                          className="mr-2"
                        />
                        <span className="text-green-600">✅ Approve</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="rejected"
                          checked={reviewData.status === 'rejected'}
                          onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                          className="mr-2"
                        />
                        <span className="text-red-600">❌ Reject</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comments (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={reviewData.adminComments}
                      onChange={(e) => setReviewData({ ...reviewData, adminComments: e.target.value })}
                      placeholder="Add any comments or feedback..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLeave(null);
                        setReviewData({ status: 'approved', adminComments: '' });
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReview(selectedLeave._id)}
                      className={`flex-1 px-6 py-3 text-white rounded-lg transition-colors duration-200 ${
                        reviewData.status === 'approved'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {reviewData.status === 'approved' ? 'Approve Request' : 'Reject Request'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;
