import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { logActivity } from '../firebase/realtime';
import { exportLearningProgressToExcel } from '../services/excelService';
import { showNotification } from '../services/notificationService';
import {
  BookOpenIcon,
  PlusIcon,
  DocumentIcon,
  VideoCameraIcon,
  LinkIcon,
  DownloadIcon,
  TrashIcon,
  EyeIcon,
  StarIcon,
  DocumentArrowDownIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function Learning() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddResource, setShowAddResource] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userProgress, setUserProgress] = useState({});
  
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'document',
    category: 'training',
    url: '',
    file: null,
    isRecommended: false
  });

  const resourceTypes = [
    { id: 'document', name: 'Document', icon: DocumentIcon },
    { id: 'video', name: 'Video', icon: VideoCameraIcon },
    { id: 'link', name: 'Link', icon: LinkIcon },
    { id: 'course', name: 'Course', icon: BookOpenIcon }
  ];

  const categories = [
    'training',
    'development',
    'compliance',
    'skills',
    'certification',
    'general'
  ];

  // Load learning resources
  useEffect(() => {
    const resourcesRef = collection(db, 'learning_resources');
    const q = query(resourcesRef, orderBy('createdAt', 'desc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const resourcesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));

      setResources(resourcesList);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Load user progress
  useEffect(() => {
    if (user.role === 'employee') {
      const progressRef = collection(db, 'learning_progress');
      const q = query(progressRef, where('userId', '==', user.uid));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const progressData = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          progressData[data.resourceId] = data;
        });
        setUserProgress(progressData);
      });

      return unsubscribe;
    }
  }, [user]);

  const handleAddResource = async (e) => {
    e.preventDefault();
    
    if (!newResource.title.trim()) {
      showNotification('Please enter a resource title', 'error');
      return;
    }

    if (!newResource.file && !newResource.url) {
      showNotification('Please provide either a file or URL', 'error');
      return;
    }

    try {
      setUploadingFile(true);
      let fileUrl = newResource.url;
      let fileName = null;

      // Upload file if provided
      if (newResource.file) {
        const fileRef = ref(storage, `learning_resources/${Date.now()}_${newResource.file.name}`);
        await uploadBytes(fileRef, newResource.file);
        fileUrl = await getDownloadURL(fileRef);
        fileName = newResource.file.name;
      }

      const resourceData = {
        title: newResource.title,
        description: newResource.description,
        type: newResource.type,
        category: newResource.category,
        url: fileUrl,
        fileName: fileName,
        isRecommended: newResource.isRecommended,
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        viewCount: 0,
        downloadCount: 0
      };

      await addDoc(collection(db, 'learning_resources'), resourceData);
      await logActivity(user.uid, 'resource-created', `Created learning resource: ${newResource.title}`);

      setNewResource({
        title: '',
        description: '',
        type: 'document',
        category: 'training',
        url: '',
        file: null,
        isRecommended: false
      });
      setShowAddResource(false);
      showNotification('Resource added successfully!', 'success');
    } catch (error) {
      console.error('Error adding resource:', error);
      showNotification('Error adding resource', 'error');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteResource = async (resourceId, fileName) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'learning_resources', resourceId));

      // Delete file from Storage if it exists
      if (fileName) {
        const fileRef = ref(storage, `learning_resources/${fileName}`);
        await deleteObject(fileRef);
      }

      await logActivity(user.uid, 'resource-deleted', 'Deleted a learning resource');
      showNotification('Resource deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting resource:', error);
      showNotification('Error deleting resource', 'error');
    }
  };

  const handleViewResource = async (resource) => {
    try {
      // Update view count
      await updateDoc(doc(db, 'learning_resources', resource.id), {
        viewCount: (resource.viewCount || 0) + 1
      });

      // Track user progress
      if (user.role === 'employee') {
        const progressData = {
          userId: user.uid,
          resourceId: resource.id,
          resourceTitle: resource.title,
          action: 'viewed',
          timestamp: serverTimestamp()
        };

        await addDoc(collection(db, 'learning_progress'), progressData);
      }

      await logActivity(user.uid, 'resource-viewed', `Viewed resource: ${resource.title}`);

      // Open resource
      window.open(resource.url, '_blank');
    } catch (error) {
      console.error('Error viewing resource:', error);
      showNotification('Error opening resource', 'error');
    }
  };

  const handleDownloadResource = async (resource) => {
    try {
      // Update download count
      await updateDoc(doc(db, 'learning_resources', resource.id), {
        downloadCount: (resource.downloadCount || 0) + 1
      });

      // Track user progress
      if (user.role === 'employee') {
        const progressData = {
          userId: user.uid,
          resourceId: resource.id,
          resourceTitle: resource.title,
          action: 'downloaded',
          timestamp: serverTimestamp()
        };

        await addDoc(collection(db, 'learning_progress'), progressData);
      }

      await logActivity(user.uid, 'resource-downloaded', `Downloaded resource: ${resource.title}`);

      // Download file
      const link = document.createElement('a');
      link.href = resource.url;
      link.download = resource.fileName || resource.title;
      link.click();
    } catch (error) {
      console.error('Error downloading resource:', error);
      showNotification('Error downloading resource', 'error');
    }
  };

  const handleExportProgress = async () => {
    try {
      const progressData = Object.values(userProgress);
      await exportLearningProgressToExcel(progressData);
      showNotification('Progress exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting progress:', error);
      showNotification('Error exporting progress', 'error');
    }
  };

  const getTypeIcon = (type) => {
    const typeData = resourceTypes.find(t => t.id === type);
    return typeData ? typeData.icon : DocumentIcon;
  };

  const filteredResources = resources.filter(resource => {
    const matchesType = filterType === 'all' || resource.type === filterType;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const recommendedResources = filteredResources.filter(r => r.isRecommended);
  const regularResources = filteredResources.filter(r => !r.isRecommended);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Learning Library
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Access training materials and resources
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {user.role === 'employee' && (
            <button
              onClick={handleExportProgress}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Export Progress</span>
            </button>
          )}
          {user.role === 'admin' && (
            <button
              onClick={() => setShowAddResource(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Resource</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Types</option>
            {resourceTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Recommended Resources */}
      {recommendedResources.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
            Recommended Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedResources.map((resource) => {
              const TypeIcon = getTypeIcon(resource.type);
              return (
                <div key={resource.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <TypeIcon className="h-5 w-5 text-blue-600" />
                      <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {resource.type}
                      </span>
                    </div>
                    <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {resource.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {resource.viewCount || 0}
                      </span>
                      <span className="flex items-center">
                        <DownloadIcon className="h-4 w-4 mr-1" />
                        {resource.downloadCount || 0}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewResource(resource)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {resource.fileName && (
                        <button
                          onClick={() => handleDownloadResource(resource)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </button>
                      )}
                      {user.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteResource(resource.id, resource.fileName)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Resources */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          All Resources ({regularResources.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regularResources.map((resource) => {
            const TypeIcon = getTypeIcon(resource.type);
            return (
              <div key={resource.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <TypeIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {resource.type}
                    </span>
                  </div>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                    {resource.category}
                  </span>
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {resource.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {resource.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {resource.viewCount || 0}
                    </span>
                    <span className="flex items-center">
                      <DownloadIcon className="h-4 w-4 mr-1" />
                      {resource.downloadCount || 0}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewResource(resource)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    {resource.fileName && (
                      <button
                        onClick={() => handleDownloadResource(resource)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </button>
                    )}
                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleDeleteResource(resource.id, resource.fileName)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Resource Modal */}
      {showAddResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Learning Resource
            </h3>
            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={newResource.type}
                  onChange={(e) => setNewResource({...newResource, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {resourceTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={newResource.category}
                  onChange={(e) => setNewResource({...newResource, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  File Upload
                </label>
                <input
                  type="file"
                  onChange={(e) => setNewResource({...newResource, file: e.target.files[0]})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL (if no file)
                </label>
                <input
                  type="url"
                  value={newResource.url}
                  onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRecommended"
                  checked={newResource.isRecommended}
                  onChange={(e) => setNewResource({...newResource, isRecommended: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isRecommended" className="text-sm text-gray-700 dark:text-gray-300">
                  Mark as recommended
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddResource(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingFile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploadingFile ? 'Uploading...' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
