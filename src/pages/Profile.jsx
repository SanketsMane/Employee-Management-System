import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api/client';
import toast from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CogIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  TrophyIcon,
  ClockIcon,
  ChartBarIcon,
  FireIcon,
  StarIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Simulate API call with user data
      const profileData = {
        ...user,
        fullName: user?.name || 'John Doe',
        email: user?.email || 'john.doe@formonex.com',
        phone: '+1 (555) 123-4567',
        address: '123 Business St, Tech City, TC 12345',
        department: 'Software Development',
        position: 'Senior Developer',
        employeeId: 'EMP001',
        joinDate: '2023-01-15',
        manager: 'Sarah Johnson',
        workLocation: 'Remote',
        skills: ['React', 'Node.js', 'Python', 'AWS', 'MongoDB'],
        achievements: [
          { title: 'Employee of the Month', date: '2024-06', icon: TrophyIcon },
          { title: 'Project Excellence Award', date: '2024-03', icon: StarIcon },
          { title: 'Innovation Award', date: '2023-12', icon: FireIcon }
        ],
        stats: {
          projectsCompleted: 24,
          tasksCompleted: 156,
          attendanceRate: 96,
          performanceScore: 4.8
        }
      };
      setProfile(profileData);
      setFormData(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Simulate API call
      setTimeout(() => {
        setProfile(formData);
        setEditing(false);
        toast.success('Profile updated successfully!');
        setSaving(false);
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
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
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  My Profile
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Manage your personal information and preferences
                </p>
              </div>
            </div>
            
            <div className="mt-4 lg:mt-0 flex space-x-3">
              {editing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8 text-center">
              {/* Profile Photo */}
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <UserIcon className="w-16 h-16 text-white" />
                </div>
                <button className="absolute bottom-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <CameraIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {profile?.fullName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-1">{profile?.position}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">{profile?.department}</p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-4 text-white">
                  <p className="text-2xl font-bold">{profile?.stats?.projectsCompleted}</p>
                  <p className="text-sm opacity-90">Projects</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
                  <p className="text-2xl font-bold">{profile?.stats?.performanceScore}</p>
                  <p className="text-sm opacity-90">Rating</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{profile?.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <IdentificationIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{profile?.employeeId}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Joined {new Date(profile?.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrophyIcon className="w-5 h-5 mr-2 text-yellow-500" />
                Recent Achievements
              </h3>
              <div className="space-y-3">
                {profile?.achievements?.map((achievement, index) => {
                  const IconComponent = achievement.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{achievement.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(achievement.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { 
                  title: 'Tasks Completed', 
                  value: profile?.stats?.tasksCompleted,
                  icon: CheckIcon,
                  color: 'text-emerald-600',
                  bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-600'
                },
                { 
                  title: 'Attendance Rate', 
                  value: `${profile?.stats?.attendanceRate}%`,
                  icon: ClockIcon,
                  color: 'text-blue-600',
                  bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-600'
                },
                { 
                  title: 'Performance', 
                  value: `${profile?.stats?.performanceScore}/5.0`,
                  icon: ChartBarIcon,
                  color: 'text-violet-600',
                  bgColor: 'bg-gradient-to-br from-violet-500 to-purple-600'
                }
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6"
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

            {/* Personal Information */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.fullName || ''}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white">
                      {profile?.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <p className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white">
                    {profile?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white">
                      {profile?.phone}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department
                  </label>
                  <p className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white">
                    {profile?.department}
                  </p>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Position
                  </label>
                  <p className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white">
                    {profile?.position}
                  </p>
                </div>

                {/* Work Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Work Location
                  </label>
                  <p className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white">
                    {profile?.workLocation}
                  </p>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  {editing ? (
                    <textarea
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white">
                      {profile?.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8 mt-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <AcademicCapIcon className="w-6 h-6 mr-2 text-violet-600" />
                Skills & Expertise
              </h3>
              <div className="flex flex-wrap gap-3">
                {profile?.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium rounded-xl shadow-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
