import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import {
  BookOpenIcon,
  PlayIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  AcademicCapIcon,
  ClockIcon,
  StarIcon,
  CloudArrowUpIcon,
  FolderPlusIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

export default function Learning() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'development',
    level: 'Beginner',
    type: 'document',
    file: null
  });

  const categories = [
    { id: 'all', name: 'All Courses' },
    { id: 'development', name: 'Development' },
    { id: 'design', name: 'Design' },
    { id: 'business', name: 'Business' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'hr', name: 'HR & Training' },
    { id: 'technical', name: 'Technical Skills' }
  ];

  useEffect(() => {
    loadCourses();
  }, [selectedCategory]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const coursesQuery = selectedCategory === 'all' 
        ? query(collection(db, 'courses'), orderBy('createdAt', 'desc'))
        : query(
            collection(db, 'courses'), 
            where('category', '==', selectedCategory), 
            orderBy('createdAt', 'desc')
          );

      const unsubscribe = onSnapshot(coursesQuery, (snapshot) => {
        const coursesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        }));
        
        setCourses(coursesList);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading courses:', error);
      // Fallback to mock data for demo
      const mockCourses = [
        {
          id: 1,
          title: 'React Fundamentals',
          description: 'Learn the basics of React including components, state, and props.',
          category: 'development',
          instructor: 'John Smith',
          duration: '4 hours',
          level: 'Beginner',
          rating: 4.8,
          students: 1250,
          thumbnail: '/api/placeholder/300/200',
          type: 'video',
          progress: 65,
          isEnrolled: true,
          downloadUrl: null
        },
        {
          id: 2,
          title: 'UI/UX Design Principles',
          description: 'Master the fundamental principles of user interface and user experience design.',
          category: 'design',
          instructor: 'Sarah Johnson',
          duration: '6 hours',
          level: 'Intermediate',
          rating: 4.9,
          students: 890,
          thumbnail: '/api/placeholder/300/200',
          type: 'video',
          progress: 0,
          isEnrolled: false,
          downloadUrl: null
        },
        {
          id: 3,
          title: 'Project Management Basics',
          description: 'Essential project management skills for modern teams.',
          category: 'business',
          instructor: 'Mike Wilson',
          duration: '3 hours',
          level: 'Beginner',
          rating: 4.7,
          students: 2100,
          thumbnail: '/api/placeholder/300/200',
          type: 'document',
          progress: 100,
          isEnrolled: true,
          downloadUrl: null
        },
        {
          id: 4,
          title: 'Digital Marketing Strategy',
          description: 'Comprehensive guide to digital marketing in the modern era.',
          category: 'marketing',
          instructor: 'Emily Davis',
          duration: '5 hours',
          level: 'Advanced',
          rating: 4.6,
          students: 1560,
          thumbnail: '/api/placeholder/300/200',
          type: 'video',
          progress: 25,
          isEnrolled: true,
          downloadUrl: null
        }
      ];

      const filteredCourses = selectedCategory === 'all' 
        ? mockCourses 
        : mockCourses.filter(course => course.category === selectedCategory);

      setCourses(filteredCourses);
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!newCourse.file || !newCourse.title) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload file to Firebase Storage
      const fileRef = ref(storage, `courses/${Date.now()}_${newCourse.file.name}`);
      const uploadTask = uploadBytes(fileRef, newCourse.file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      await uploadTask;
      const downloadUrl = await getDownloadURL(fileRef);
      setUploadProgress(100);

      // Add course to Firestore
      const courseData = {
        title: newCourse.title,
        description: newCourse.description,
        category: newCourse.category,
        level: newCourse.level,
        type: newCourse.type,
        instructor: user.displayName || user.email,
        downloadUrl: downloadUrl,
        fileName: newCourse.file.name,
        fileSize: newCourse.file.size,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.uid,
        students: 0,
        rating: 0,
        reviews: []
      };

      await addDoc(collection(db, 'courses'), courseData);

      // Reset form
      setNewCourse({
        title: '',
        description: '',
        category: 'development',
        level: 'Beginner',
        type: 'document',
        file: null
      });
      setShowUploadModal(false);
      setUploadProgress(0);

    } catch (error) {
      console.error('Error uploading course:', error);
      alert('Error uploading course. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const enrollInCourse = async (courseId) => {
    try {
      // Update enrollment in Firestore
      const enrollmentData = {
        userId: user.uid,
        courseId: courseId,
        enrolledAt: new Date(),
        progress: 0,
        completedAt: null
      };

      await addDoc(collection(db, 'enrollments'), enrollmentData);

      // Update local state
      setCourses(prev => 
        prev.map(course => 
          course.id === courseId 
            ? { ...course, isEnrolled: true, progress: 0 }
            : course
        )
      );
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Error enrolling in course. Please try again.');
    }
  };

  const downloadCourse = async (course) => {
    try {
      if (course.downloadUrl) {
        const link = document.createElement('a');
        link.href = course.downloadUrl;
        link.download = course.fileName || `${course.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading course:', error);
      alert('Error downloading course. Please try again.');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return VideoCameraIcon;
      case 'document':
        return DocumentTextIcon;
      default:
        return BookOpenIcon;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'Intermediate':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Advanced':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Learning Library
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Enhance your skills with our comprehensive learning resources
            </p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <CloudArrowUpIcon className="h-4 w-4 mr-2" />
              Upload Content
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* My Learning Progress */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          My Learning Progress
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {courses.filter(c => c.isEnrolled).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Enrolled Courses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {courses.filter(c => c.progress === 100).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {courses.filter(c => c.progress > 0 && c.progress < 100).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">In Progress</div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : (
          courses.map((course) => {
            const TypeIcon = getTypeIcon(course.type);
            return (
              <div
                key={course.id}
                className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TypeIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </div>
                  {course.downloadUrl && (
                    <div className="absolute top-2 left-2">
                      <button
                        onClick={() => downloadCourse(course)}
                        className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
                      {course.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      {course.rating || 'N/A'}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center">
                      <AcademicCapIcon className="h-4 w-4 mr-1" />
                      {course.instructor}
                    </span>
                    <span className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {course.duration || 'Self-paced'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {course.students || 0} students
                  </div>
                  
                  {course.isEnrolled ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-medium">{course.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress || 0}%` }}
                        ></div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          <PlayIcon className="h-4 w-4 mr-2" />
                          {course.progress === 100 ? 'Review' : 'Continue'}
                        </button>
                        {course.downloadUrl && (
                          <button
                            onClick={() => downloadCourse(course)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => enrollInCourse(course.id)}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
                      >
                        Enroll Now
                      </button>
                      {course.downloadUrl && (
                        <button
                          onClick={() => downloadCourse(course)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Upload Learning Content
              </h3>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={newCourse.category}
                      onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {categories.slice(1).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Level
                    </label>
                    <select
                      value={newCourse.level}
                      onChange={(e) => setNewCourse({...newCourse, level: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content Type
                  </label>
                  <select
                    value={newCourse.type}
                    onChange={(e) => setNewCourse({...newCourse, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="document">Document</option>
                    <option value="video">Video</option>
                    <option value="presentation">Presentation</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setNewCourse({...newCourse, file: e.target.files[0]})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.avi"
                    required
                  />
                </div>
                
                {uploading && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
