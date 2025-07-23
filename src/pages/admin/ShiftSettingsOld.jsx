import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '../../services/api/client';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  Cog6ToothIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  SunIcon,
  MoonIcon,
  BoltIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

export default function ShiftSettings() {
  const [settings, setSettings] = useState({
    shiftStart: '09:00',
    shiftEnd: '18:00',
    lateThreshold: 30,
    halfDayThreshold: 4,
    breakDuration: 60,
    workingDays: [1, 2, 3, 4, 5],
    timezone: 'Asia/Kolkata'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/shift/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching shift settings:', error);
      toast.error('Failed to load shift settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (settings.shiftStart >= settings.shiftEnd) {
      toast.error('Shift end time must be after start time');
      return;
    }
    
    if (settings.lateThreshold < 0 || settings.lateThreshold > 120) {
      toast.error('Late threshold must be between 0 and 120 minutes');
      return;
    }
    
    if (settings.halfDayThreshold < 1 || settings.halfDayThreshold > 8) {
      toast.error('Half day threshold must be between 1 and 8 hours');
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.put('/shift/settings', settings);
      
      if (response.success) {
        toast.success('Shift settings updated successfully!');
      }
    } catch (error) {
      console.error('Error updating shift settings:', error);
      toast.error('Failed to update shift settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWorkingDayToggle = (dayIndex) => {
    setSettings(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(dayIndex)
        ? prev.workingDays.filter(day => day !== dayIndex)
        : [...prev.workingDays, dayIndex].sort((a, b) => a - b)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-pink-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 mb-8 overflow-hidden"
        >
          <div className="relative p-8">
            <div className="relative flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Cog6ToothIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Shift Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Configure working hours, breaks, and attendance policies
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Main Content */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <SparklesIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Modern Shift Settings</h2>
            <p className="text-gray-600 dark:text-gray-400">Enhanced configuration interface has been applied.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Shift Timings
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shift Start Time
                  </label>
                  <input
                    type="time"
                    value={settings.shiftStart}
                    onChange={(e) => handleInputChange('shiftStart', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shift End Time
                  </label>
                  <input
                    type="time"
                    value={settings.shiftEnd}
                    onChange={(e) => handleInputChange('shiftEnd', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900">Attendance Policies</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Late Threshold (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={settings.lateThreshold}
                    onChange={(e) => handleInputChange('lateThreshold', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How many minutes after shift start is considered late
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Half Day Threshold (hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={settings.halfDayThreshold}
                    onChange={(e) => handleInputChange('halfDayThreshold', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Hours before shift end when checkout becomes half day
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Break Duration (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="240"
                  value={settings.breakDuration}
                  onChange={(e) => handleInputChange('breakDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total allowed break time per day
                </p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CalendarDaysIcon className="h-5 w-5 mr-2" />
                  Working Days
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {dayNames.map((day, index) => (
                  <label key={index} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.workingDays.includes(index)}
                      onChange={() => handleWorkingDayToggle(index)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{day}</span>
                  </label>
                ))}
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {saving ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Save Settings
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Preview Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Settings Preview</h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Shift Hours:</span>
                  <span className="font-medium">{settings.shiftStart} - {settings.shiftEnd}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Late After:</span>
                  <span className="font-medium">{settings.lateThreshold} minutes</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Half Day If Exit Before:</span>
                  <span className="font-medium">
                    {(() => {
                      const [hours, minutes] = settings.shiftEnd.split(':').map(Number);
                      const cutoffTime = new Date();
                      cutoffTime.setHours(hours - settings.halfDayThreshold, minutes, 0, 0);
                      return cutoffTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    })()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Break Allowance:</span>
                  <span className="font-medium">{settings.breakDuration} minutes</span>
                </div>
                
                <div className="border-t pt-4">
                  <span className="text-gray-600 block mb-2">Working Days:</span>
                  <div className="flex flex-wrap gap-1">
                    {settings.workingDays.map(dayIndex => (
                      <span key={dayIndex} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {dayNames[dayIndex].slice(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
}

export default ShiftSettings;