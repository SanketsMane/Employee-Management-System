import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api/client';
import toast from 'react-hot-toast';
import {
  BookOpenIcon,
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
  StarIcon,
  UserGroupIcon,
  TrophyIcon,
  FireIcon,
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  LightBulbIcon,
  CodeBracketIcon,
  PresentationChartLineIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const Learning = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories', icon: BookOpenIcon, color: 'text-violet-600' },
    { value: 'programming', label: 'Programming', icon: CodeBracketIcon, color: 'text-blue-600' },
    { value: 'design', label: 'Design', icon: PencilIcon, color: 'text-pink-600' },
    { value: 'business', label: 'Business', icon: PresentationChartLineIcon, color: 'text-green-600' },
    { value: 'technology', label: 'Technology', icon: CpuChipIcon, color: 'text-indigo-600' },
    { value: 'security', label: 'Security', icon: ShieldCheckIcon, color: 'text-red-600' },
    { value: 'marketing', label: 'Marketing', icon: GlobeAltIcon, color: 'text-orange-600' },
    { value: 'innovation', label: 'Innovation', icon: LightBulbIcon, color: 'text-yellow-600' }
  ];

  // Sample course data
  const sampleCourses = [
    {
      _id: '1',
      title: 'React Development Fundamentals',
      description: 'Master the fundamentals of React development including components, hooks, and state management.',
      category: 'programming',
      difficulty: 'Beginner',
      duration: '8 hours',
      rating: 4.8,
      studentsEnrolled: 1250,
      instructor: 'Sarah Johnson',
      thumbnail: '/api/placeholder/400/250',
      lessons: 24,
      isPopular: true,
      skills: ['React', 'JavaScript', 'Frontend Development'],
      price: 'Free'
    },
    {
      _id: '2',
      title: 'UI/UX Design Principles',
      description: 'Learn modern design principles and create beautiful, user-friendly interfaces.',
      category: 'design',
      difficulty: 'Intermediate',
      duration: '12 hours',
      rating: 4.9,
      studentsEnrolled: 890,
      instructor: 'Michael Chen',
      thumbnail: '/api/placeholder/400/250',
      lessons: 18,
      isPopular: false,
      skills: ['Design', 'Figma', 'Prototyping'],
      price: 'Premium'
    },
    {
      _id: '3',
      title: 'Cybersecurity Essentials',
      description: 'Essential cybersecurity concepts and practices for modern businesses.',
      category: 'security',
      difficulty: 'Beginner',
      duration: '6 hours',
      rating: 4.7,
      studentsEnrolled: 2100,
      instructor: 'Alex Rodriguez',
      thumbnail: '/api/placeholder/400/250',
      lessons: 15,
      isPopular: true,
      skills: ['Security', 'Risk Management', 'Compliance'],
      price: 'Free'
    },
    {
      _id: '4',
      title: 'Digital Marketing Strategy',
      description: 'Comprehensive guide to digital marketing strategies and implementation.',
      category: 'marketing',
      difficulty: 'Intermediate',
      duration: '10 hours',
      rating: 4.6,
      studentsEnrolled: 1580,
      instructor: 'Emma Wilson',
      thumbnail: '/api/placeholder/400/250',
      lessons: 22,
      isPopular: false,
      skills: ['Marketing', 'SEO', 'Social Media'],
      price: 'Premium'
    },
    {
      _id: '5',
      title: 'Business Analytics & Intelligence',
      description: 'Learn to analyze business data and make data-driven decisions.',
      category: 'business',
      difficulty: 'Advanced',
      duration: '15 hours',
      rating: 4.8,
      studentsEnrolled: 950,
      instructor: 'David Kim',
      thumbnail: '/api/placeholder/400/250',
      lessons: 28,
      isPopular: true,
      skills: ['Analytics', 'Data Visualization', 'BI Tools'],
      price: 'Premium'
    },
    {
      _id: '6',
      title: 'Innovation & Creative Thinking',
      description: 'Develop innovative thinking skills and creative problem-solving techniques.',
      category: 'innovation',
      difficulty: 'Beginner',
      duration: '4 hours',
      rating: 4.5,
      studentsEnrolled: 760,
      instructor: 'Lisa Thompson',
      thumbnail: '/api/placeholder/400/250',
      lessons: 12,
      isPopular: false,
      skills: ['Innovation', 'Creativity', 'Problem Solving'],
      price: 'Free'
    }
  ];

  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Simulate API call with sample data
      setTimeout(() => {
        setCourses(sampleCourses);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      // Simulate enrolled courses
      setEnrolledCourses(['1', '3']);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrolling(courseId);
      // Simulate enrollment
      setTimeout(() => {
        setEnrolledCourses(prev => [...prev, courseId]);
        toast.success('Successfully enrolled in course!');
        setEnrolling(null);
      }, 1500);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
      setEnrolling(null);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'intermediate':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'advanced':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesFilter = filter === 'all' || 
                         (filter === 'enrolled' && enrolledCourses.includes(course._id)) ||
                         (filter === 'available' && !enrolledCourses.includes(course._id)) ||
                         (filter === 'popular' && course.isPopular);
    
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const learningStats = {
    totalCourses: courses.length,
    enrolledCourses: enrolledCourses.length,
    completedCourses: Math.floor(enrolledCourses.length * 0.6),
    totalHours: enrolledCourses.reduce((total, courseId) => {
      const course = courses.find(c => c._id === courseId);
      return total + (course ? parseInt(course.duration) : 0);
    }, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading learning content...</p>
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
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Learning Center
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Expand your skills with our comprehensive learning platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Learning Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              title: 'Available Courses', 
              value: learningStats.totalCourses, 
              icon: BookOpenIcon,
              color: 'text-violet-600',
              bgColor: 'bg-gradient-to-br from-violet-500 to-purple-600'
            },
            { 
              title: 'Enrolled Courses', 
              value: learningStats.enrolledCourses,
              icon: UserGroupIcon,
              color: 'text-blue-600',
              bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-600'
            },
            { 
              title: 'Completed', 
              value: learningStats.completedCourses,
              icon: TrophyIcon,
              color: 'text-emerald-600',
              bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-600'
            },
            { 
              title: 'Learning Hours', 
              value: learningStats.totalHours,
              icon: ClockIcon,
              color: 'text-amber-600',
              bgColor: 'bg-gradient-to-br from-amber-500 to-orange-600'
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
          {/* Search */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
              </div>
              {['all', 'available', 'enrolled', 'popular'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filter === status
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    selectedCategory === category.value
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourses.includes(course._id);
            const categoryInfo = categories.find(cat => cat.value === course.category);
            const IconComponent = categoryInfo?.icon || BookOpenIcon;
            
            return (
              <div
                key={course._id}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 overflow-hidden hover:transform hover:scale-105 transition-all duration-200 group"
              >
                {/* Course Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
                  <IconComponent className="w-16 h-16 text-white" />
                  {course.isPopular && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                      <FireIcon className="w-3 h-3 mr-1" />
                      Popular
                    </div>
                  )}
                  {isEnrolled && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      Enrolled
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Course Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  {/* Course Meta */}
                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {course.duration}
                    </div>
                    <div className="flex items-center">
                      <BookOpenIcon className="w-4 h-4 mr-1" />
                      {course.lessons} lessons
                    </div>
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 mr-1 text-yellow-500" />
                      {course.rating}
                    </div>
                  </div>

                  {/* Course Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
                      <TagIcon className="w-3 h-3 mr-1" />
                      {categoryInfo?.label || course.category}
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {course.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                      {course.skills.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">
                          +{course.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Instructor and Students */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      by {course.instructor}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <UserGroupIcon className="w-4 h-4 mr-1" />
                      {course.studentsEnrolled.toLocaleString()}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {course.price === 'Free' ? (
                        <span className="text-emerald-600">Free</span>
                      ) : (
                        <span className="text-violet-600">Premium</span>
                      )}
                    </div>
                    
                    {isEnrolled ? (
                      <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg">
                        <PlayIcon className="w-4 h-4 mr-2" />
                        Continue Learning
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course._id)}
                        disabled={enrolling === course._id}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50"
                      >
                        {enrolling === course._id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Enrolling...
                          </>
                        ) : (
                          <>
                            <ArrowRightIcon className="w-4 h-4 mr-2" />
                            Enroll Now
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpenIcon className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No courses found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              No courses match your current filters. Try adjusting your search terms or filters to find relevant learning content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Learning;