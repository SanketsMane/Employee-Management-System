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
    
    if (settings.shiftStart >= settings.shiftEnd) {
      toast.error('Shift end time must be after start time');
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
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-pink-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Cog6ToothIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Loading Shift Settings</h3>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 rounded-full animate-spin" />
          </div>
        </motion.div>
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Modern Settings Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-2"
          >
            <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 space-y-8">
              {/* Shift Timings Section */}
              <div>
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shift Timings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
                      <SunIcon className="w-4 h-4" />
                      <span>Shift Start Time</span>
                    </label>
                    <input
                      type="time"
                      value={settings.shiftStart}
                      onChange={(e) => handleInputChange('shiftStart', e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200 shadow-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
                      <MoonIcon className="w-4 h-4" />
                      <span>Shift End Time</span>
                    </label>
                    <input
                      type="time"
                      value={settings.shiftEnd}
                      onChange={(e) => handleInputChange('shiftEnd', e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200 shadow-lg"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Working Days Section */}
              <div>
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <CalendarDaysIcon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Working Days</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {dayNames.map((day, index) => (
                    <motion.button
                      key={index}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleWorkingDayToggle(index)}
                      className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                        settings.workingDays.includes(index)
                          ? 'border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-8 h-8 mx-auto mb-2 rounded-xl flex items-center justify-center ${
                          settings.workingDays.includes(index)
                            ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          <span className="text-sm font-bold">{day.charAt(0)}</span>
                        </div>
                        <p className={`text-xs font-semibold ${
                          settings.workingDays.includes(index)
                            ? 'text-violet-600 dark:text-violet-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {day.slice(0, 3)}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-2xl hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>Save Settings</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* Modern Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="xl:col-span-1"
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 sticky top-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Preview</h3>
              </div>
              
              <div className="space-y-6 text-sm">
                <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl">
                  <h4 className="font-semibold text-violet-800 dark:text-violet-300 mb-3">⏰ Shift Hours</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Start Time:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{settings.shiftStart}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">End Time:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{settings.shiftEnd}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl">
                  <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-3">📅 Working Days</h4>
                  <div className="flex flex-wrap gap-2">
                    {settings.workingDays.map(dayIndex => (
                      <span key={dayIndex} className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg">
                        {dayNames[dayIndex].slice(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
