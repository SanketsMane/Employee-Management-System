import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api/client';
import toast from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  ClockIcon,
  ShieldCheckIcon,
  StarIcon,
  AcademicCapIcon,
  TrophyIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
  const { userProfile, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    location: '',
    bio: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        fullName: userProfile.fullName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        department: userProfile.department || '',
        position: userProfile.position || '',
        location: userProfile.location || '',
        bio: userProfile.bio || '',
        dateOfBirth: userProfile.dateOfBirth ? userProfile.dateOfBirth.split('T')[0] : '',
        address: userProfile.address || '',
        emergencyContact: {
          name: userProfile.emergencyContact?.name || '',
          phone: userProfile.emergencyContact?.phone || '',
          relationship: userProfile.emergencyContact?.relationship || ''
        }
      });
    }
  }, [userProfile]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await apiClient.put('/users/profile', profileData);
      
      if (response.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        // Update the context with new profile data
        if (updateUserProfile) {
          updateUserProfile(response.data);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    if (userProfile) {
      setProfileData({
        fullName: userProfile.fullName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        department: userProfile.department || '',
        position: userProfile.position || '',
        location: userProfile.location || '',
        bio: userProfile.bio || '',
        dateOfBirth: userProfile.dateOfBirth ? userProfile.dateOfBirth.split('T')[0] : '',
        address: userProfile.address || '',
        emergencyContact: {
          name: userProfile.emergencyContact?.name || '',
          phone: userProfile.emergencyContact?.phone || '',
          relationship: userProfile.emergencyContact?.relationship || ''
        }
      });
    }
    setIsEditing(false);
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
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
            
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg disabled:opacity-50"
                  >
                    {loading ? (
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Hero Section */}
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 rounded-2xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-4 border-white/30">
                <UserIcon className="w-16 h-16 text-white" />
              </div>
              <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-violet-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200">
                <CameraIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">{userProfile.fullName || 'User Name'}</h2>
              <p className="text-xl opacity-90 mb-2">{userProfile.position || 'Employee'}</p>
              <p className="opacity-80 mb-4">{userProfile.department || 'Department'}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span className="text-sm">{userProfile.email}</span>
                </div>
                {userProfile.phone && (
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                    <PhoneIcon className="w-4 h-4" />
                    <span className="text-sm">{userProfile.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span className="text-sm capitalize">{userProfile.role || 'Employee'}</span>
                </div>
              </div>
            </div>
            
            {/* Profile Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <StarIcon className="w-6 h-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">4.8</div>
                <div className="text-sm opacity-80">Rating</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <TrophyIcon className="w-6 h-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm opacity-80">Awards</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <FireIcon className="w-6 h-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">85</div>
                <div className="text-sm opacity-80">Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <IdentificationIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white font-medium">{userProfile.fullName}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-medium">{userProfile.email}</span>
                    <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-lg">Verified</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="+1 (555) 123-4567"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white font-medium">{userProfile.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white font-medium">
                        {userProfile.dateOfBirth ? new Date(userProfile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <BriefcaseIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Work Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Department
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="Engineering"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white font-medium">{userProfile.department || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Position
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="Software Engineer"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white font-medium">{userProfile.position || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="San Francisco, CA"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <MapPinIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white font-medium">{userProfile.location || 'Not specified'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">About Me</h3>
              </div>
              
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us about yourself, your interests, and what drives you..."
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {userProfile.bio || 'No bio provided yet. Click edit to add information about yourself.'}
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                  <ClockIcon className="w-5 h-5 text-violet-600" />
                  <span className="text-gray-900 dark:text-white">View Attendance</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900 dark:text-white">Download Reports</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
                  <span className="text-gray-900 dark:text-white">Security Settings</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">Profile updated</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">Task completed</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">Checked in</p>
                    <p className="text-xs text-gray-500">Today</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Badge */}
            <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="text-center">
                <SparklesIcon className="w-12 h-12 mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-2">Top Performer</h3>
                <p className="text-sm opacity-90">You're in the top 10% this month!</p>
                <div className="mt-4 flex justify-center space-x-2">
                  <TrophyIcon className="w-5 h-5" />
                  <StarIcon className="w-5 h-5" />
                  <FireIcon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userProfile.fullName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {userProfile.position} - {userProfile.department}
                </p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  userProfile.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {userProfile.role.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center disabled:opacity-50"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                    {userProfile.fullName}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="flex items-center text-gray-900 dark:text-white">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  {userProfile.email}
                  <span className="ml-2 text-xs text-gray-500">(Cannot be changed)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                    {userProfile.phone || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <div className="text-gray-900 dark:text-white">
                    {userProfile.dateOfBirth 
                      ? new Date(userProfile.dateOfBirth).toLocaleDateString()
                      : 'Not provided'
                    }
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Work Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <div className="flex items-center text-gray-900 dark:text-white">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  {userProfile.department}
                  <span className="ml-2 text-xs text-gray-500">(Contact admin to change)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Position
                </label>
                <div className="flex items-center text-gray-900 dark:text-white">
                  <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-2" />
                  {userProfile.position}
                  <span className="ml-2 text-xs text-gray-500">(Contact admin to change)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., New York Office, Remote, etc."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                    {userProfile.location || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <div className="text-gray-900 dark:text-white">
                    {userProfile.bio || 'No bio provided'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={2}
                    placeholder="Your address..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <div className="text-gray-900 dark:text-white">
                    {userProfile.address || 'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Emergency Contact
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.emergencyContact.name}
                    onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <div className="text-gray-900 dark:text-white">
                    {userProfile.emergencyContact?.name || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.emergencyContact.phone}
                    onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <div className="text-gray-900 dark:text-white">
                    {userProfile.emergencyContact?.phone || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Relationship
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.emergencyContact.relationship}
                    onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                    placeholder="e.g., Spouse, Parent, Sibling"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <div className="text-gray-900 dark:text-white">
                    {userProfile.emergencyContact?.relationship || 'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
