import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api/client';
import AttendanceCalendar from '../components/AttendanceCalendar';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  CalendarDaysIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export default function Attendance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setLoading(false);
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading attendance...</p>
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
                  Attendance Management
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  View your attendance history and calendar
                </p>
              </div>
            </div>
            <div className="mt-4 lg:mt-0 text-right">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatTime(currentTime)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(currentTime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Attendance Calendar */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-gray-700/20 shadow-xl">
          <AttendanceCalendar />
        </div>
      </div>
    </div>
  );
}
