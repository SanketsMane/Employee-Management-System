import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api/client';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  ChartBarIcon,
  DocumentTextIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const STATUS_OPTIONS = [
  { value: 'Completed', label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
  { value: 'In Progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: PlayIcon },
  { value: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon }
];

const BREAK_REASONS = [
  'Lunch',
  'Tea Break', 
  'Personal',
  'Meeting',
  'Other'
];

export default function Worksheet() {
  const { user } = useAuth();
  const [worksheet, setWorksheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [needsCheckIn, setNeedsCheckIn] = useState(false);
  const [entries, setEntries] = useState([]);
  const [breaks, setBreaks] = useState([]);
  const [activeTab, setActiveTab] = useState('worksheet');

  useEffect(() => {
    checkAttendanceAndFetchWorksheet();
  }, []);

  const checkAttendanceAndFetchWorksheet = async () => {
    try {
      setLoading(true);
      // First check if user has checked in today
      const attendanceResponse = await apiClient.get('/attendance/today');
      
      if (attendanceResponse.success && attendanceResponse.data?.hasCheckedIn) {
        // If checked in, fetch worksheet
        await fetchTodayWorksheet();
      } else {
        setNeedsCheckIn(true);
      }
    } catch (error) {
      console.error('Error checking attendance:', error);
      // If attendance check fails, try to fetch worksheet anyway
      await fetchTodayWorksheet();
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayWorksheet = async () => {
    try {
      const response = await apiClient.get('/worksheet/today');
      if (response.success) {
        setWorksheet(response.data);
        setEntries(response.data.entries || []);
        setBreaks(response.data.breaks || []);
        setNeedsCheckIn(false);
      }
    } catch (error) {
      console.error('Error fetching worksheet:', error);
      if (error.message?.includes('check in first')) {
        setNeedsCheckIn(true);
        toast.error('Please check in first to access your worksheet');
      } else {
        toast.error('Failed to load worksheet');
      }
    }
  };

  const updateEntry = (index, field, value) => {
    const updatedEntries = [...entries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setEntries(updatedEntries);
  };

  const addBreak = () => {
    const newBreak = {
      start: '',
      end: '',
      reason: 'Lunch',
      duration: 0
    };
    setBreaks([...breaks, newBreak]);
  };

  const updateBreak = (index, field, value) => {
    const updatedBreaks = [...breaks];
    updatedBreaks[index] = { ...updatedBreaks[index], [field]: value };
    
    // Auto-calculate duration when both start and end times are set
    if (field === 'start' || field === 'end') {
      const breakEntry = updatedBreaks[index];
      if (breakEntry.start && breakEntry.end) {
        const startMinutes = parseTimeToMinutes(breakEntry.start);
        const endMinutes = parseTimeToMinutes(breakEntry.end);
        if (endMinutes > startMinutes) {
          updatedBreaks[index].duration = endMinutes - startMinutes;
        }
      }
    }
    
    setBreaks(updatedBreaks);
  };

  const removeBreak = (index) => {
    const updatedBreaks = breaks.filter((_, i) => i !== index);
    setBreaks(updatedBreaks);
  };

  const parseTimeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const validateWorksheet = () => {
    // Check if all entries have required fields
    for (const entry of entries) {
      if (!entry.task.trim() || !entry.project.trim()) {
        toast.error('Please fill in all task descriptions and project names');
        return false;
      }
    }

    // Validate break times
    for (const breakEntry of breaks) {
      if (breakEntry.start && breakEntry.end) {
        const startMinutes = parseTimeToMinutes(breakEntry.start);
        const endMinutes = parseTimeToMinutes(breakEntry.end);
        if (startMinutes >= endMinutes) {
          toast.error('Break end time must be after start time');
          return false;
        }
      } else if (breakEntry.start || breakEntry.end) {
        toast.error('Please complete both start and end times for all breaks');
        return false;
      }
    }

    return true;
  };

  const saveWorksheet = async () => {
    if (!validateWorksheet()) return;

    try {
      setSaving(true);
      const today = new Date().toISOString().split('T')[0];
      
      const response = await apiClient.post('/worksheet/submit', {
        date: today,
        entries,
        breaks: breaks.filter(b => b.start && b.end) // Only include completed breaks
      });

      if (response.success) {
        toast.success('Worksheet saved successfully!');
        setWorksheet(response.data);
      }
    } catch (error) {
      console.error('Error saving worksheet:', error);
      toast.error(error.message || 'Failed to save worksheet');
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status) => {
    const statusOption = STATUS_OPTIONS.find(option => option.value === status);
    return statusOption ? statusOption.icon : ExclamationTriangleIcon;
  };

  const getStatusColor = (status) => {
    const statusOption = STATUS_OPTIONS.find(option => option.value === status);
    return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800';
  };

  const calculateProductivityPreview = () => {
    if (entries.length === 0) return 0;
    
    const completed = entries.filter(e => e.status === 'Completed').length;
    const inProgress = entries.filter(e => e.status === 'In Progress').length;
    const pending = entries.filter(e => e.status === 'Pending').length;
    
    const completedWeight = 1.0;
    const inProgressWeight = 0.7;
    const pendingWeight = 0.3;
    
    const weightedScore = (
      completed * completedWeight +
      inProgress * inProgressWeight +
      pending * pendingWeight
    ) / entries.length;
    
    return Math.round(weightedScore * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Loading your worksheet...</p>
        </div>
      </div>
    );
  }

  if (needsCheckIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <ClockIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check In Required</h2>
            <p className="text-gray-600 mb-6">
              You need to check in for attendance before you can access your daily worksheet.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/attendance'}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Attendance
              </button>
              <button
                onClick={() => {
                  setNeedsCheckIn(false);
                  checkAttendanceAndFetchWorksheet();
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Worksheet</h1>
          <p className="text-gray-600">
            Track your hourly activities for {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('worksheet')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'worksheet'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <DocumentTextIcon className="w-5 h-5 inline mr-2" />
              Hourly Tasks
            </button>
            <button
              onClick={() => setActiveTab('breaks')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'breaks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ClockIcon className="w-5 h-5 inline mr-2" />
              Breaks
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'summary'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ChartBarIcon className="w-5 h-5 inline mr-2" />
              Summary
            </button>
          </div>
        </div>

        {/* Worksheet Tab */}
        {activeTab === 'worksheet' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Hourly Task Entries</h2>
              <div className="text-sm text-gray-500">
                {worksheet?.checkInTime && `Started at ${worksheet.checkInTime}`}
              </div>
            </div>
            
            <div className="space-y-4">
              {entries.map((entry, index) => {
                const StatusIcon = getStatusIcon(entry.status);
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                      {/* Time Slot */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center text-sm font-medium text-gray-700">
                          <ClockIcon className="w-4 h-4 mr-2 text-blue-500" />
                          {entry.from} - {entry.to}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDuration(entry.duration || 60)}
                        </div>
                      </div>

                      {/* Task Description */}
                      <div className="lg:col-span-4">
                        <textarea
                          value={entry.task}
                          onChange={(e) => updateEntry(index, 'task', e.target.value)}
                          placeholder="What did you work on during this hour?"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows="2"
                        />
                      </div>

                      {/* Project */}
                      <div className="lg:col-span-3">
                        <input
                          type="text"
                          value={entry.project}
                          onChange={(e) => updateEntry(index, 'project', e.target.value)}
                          placeholder="Project name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Status */}
                      <div className="lg:col-span-3">
                        <select
                          value={entry.status}
                          onChange={(e) => updateEntry(index, 'status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {STATUS_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {entry.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Breaks Tab */}
        {activeTab === 'breaks' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Break Entries</h2>
              <button
                onClick={addBreak}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Break
              </button>
            </div>

            <div className="space-y-4">
              {breaks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ClockIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No breaks recorded yet</p>
                  <p className="text-sm">Click "Add Break" to log your break times</p>
                </div>
              ) : (
                breaks.map((breakEntry, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      {/* Start Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={breakEntry.start}
                          onChange={(e) => updateBreak(index, 'start', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* End Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                          type="time"
                          value={breakEntry.end}
                          onChange={(e) => updateBreak(index, 'end', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Reason */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                        <select
                          value={breakEntry.reason}
                          onChange={(e) => updateBreak(index, 'reason', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {BREAK_REASONS.map(reason => (
                            <option key={reason} value={reason}>{reason}</option>
                          ))}
                        </select>
                      </div>

                      {/* Duration */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600">
                          {breakEntry.duration ? formatDuration(breakEntry.duration) : '-'}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => removeBreak(index)}
                          className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Daily Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Productivity Score Preview */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                <div className="flex items-center">
                  <ChartBarIcon className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Productivity Score</p>
                    <p className="text-2xl font-bold text-blue-900">{calculateProductivityPreview()}%</p>
                  </div>
                </div>
              </div>

              {/* Tasks Summary */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Completed Tasks</p>
                    <p className="text-2xl font-bold text-green-900">
                      {entries.filter(e => e.status === 'Completed').length}/{entries.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Work Hours */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg">
                <div className="flex items-center">
                  <ClockIcon className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Total Work Hours</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {formatDuration(entries.reduce((total, entry) => total + (entry.duration || 60), 0))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Break Time */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg">
                <div className="flex items-center">
                  <ClockIcon className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-600">Break Time</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {formatDuration(breaks.reduce((total, breakEntry) => total + (breakEntry.duration || 0), 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {STATUS_OPTIONS.map(statusOption => {
                const count = entries.filter(e => e.status === statusOption.value).length;
                const percentage = entries.length > 0 ? Math.round((count / entries.length) * 100) : 0;
                const StatusIcon = statusOption.icon;
                
                return (
                  <div key={statusOption.value} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <StatusIcon className="w-5 h-5 mr-2 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">{statusOption.label}</span>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusOption.color}`}>
                        {count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${statusOption.color.includes('green') ? 'bg-green-500' : statusOption.color.includes('blue') ? 'bg-blue-500' : 'bg-yellow-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{percentage}% of total tasks</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {worksheet?.isSubmitted ? (
                <span className="flex items-center text-green-600">
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Worksheet submitted at {new Date(worksheet.submittedAt).toLocaleTimeString()}
                </span>
              ) : (
                'Your worksheet will be automatically saved'
              )}
            </div>
            <button
              onClick={saveWorksheet}
              disabled={saving}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Save Worksheet
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
