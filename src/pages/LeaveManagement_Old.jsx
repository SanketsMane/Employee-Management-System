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
  const [formData, setFormData] = useState({
    leaveType: 'vacation',
    startDate: '',
    endDate: '',
    reason: '',
    attachments: []
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
  }, [filter]);

  const fetchLeaves = async () => {
    try {
      const response = await apiClient.get(`/leaves/my-leaves?status=${filter}`);
      setLeaves(response.data.leaves);
    } catch (error) {
      console.error('Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await apiClient.post('/leaves/apply', formData);
      alert('Leave request submitted successfully!');
      setShowForm(false);
      setFormData({
        leaveType: 'vacation',
        startDate: '',
        endDate: '',
        reason: '',
        attachments: []
      });
      fetchLeaves();
    } catch (error) {
      console.error('Error submitting leave:', error);
      alert('Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (leaveId) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) {
      return;
    }

    try {
      const response = await apiClient.put(`/leaves/${leaveId}/cancel`);
      alert('Leave request cancelled successfully!');
      fetchLeaves();
    } catch (error) {
      console.error('Error cancelling leave:', error);
      alert('Failed to cancel leave request');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leave Management</h1>
          <p className="text-gray-600">Manage your leave requests and view history</p>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>📝</span>
              <span>Apply for Leave</span>
            </button>
          </div>
        </div>

        {/* Leave Application Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Apply for Leave</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Leave Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Leave Type *
                    </label>
                    <select
                      required
                      value={formData.leaveType}
                      onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {leaveTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Duration Display */}
                  {formData.startDate && formData.endDate && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-800">
                        <strong>Duration:</strong> {calculateDays()} day(s)
                      </p>
                    </div>
                  )}

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Please provide a reason for your leave request..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {submitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Leave Requests List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Leave Requests</h2>
          </div>

          {leaves.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
              <p className="text-gray-500 mb-6">You haven't submitted any leave requests yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Apply for Leave
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leaves.map((leave) => (
                <div key={leave._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {leaveTypes.find(type => type.value === leave.leaveType)?.label || leave.leaveType}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[leave.status]}`}>
                          <span className="mr-1">{statusIcons[leave.status]}</span>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
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
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Admin Comments</p>
                          <p className="text-sm text-gray-900">{leave.adminComments}</p>
                        </div>
                      )}
                    </div>

                    {leave.status === 'pending' && (
                      <div className="ml-4">
                        <button
                          onClick={() => handleCancel(leave._id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
