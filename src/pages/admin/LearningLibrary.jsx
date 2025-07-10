import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DatabaseService from '../../services/databaseService';
import {
  PlusIcon,
  BookOpenIcon,
  DocumentIcon,
  VideoCameraIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  TagIcon,
  DownloadIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
  FolderOpenIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function LearningLibrary() {
  const { user, useFirebase } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    type: 'document',
    category: '',
    tags: [],
    url: '',
    file: null,
    difficulty: 'beginner',
    estimatedDuration: '',
    prerequisites: [],
    isPublic: true
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  const materialTypes = [
    { value: 'document', label: 'Document (PDF)', icon: DocumentIcon, color: 'bg-red-100 text-red-800' },
    { value: 'video', label: 'Video', icon: VideoCameraIcon, color: 'bg-blue-100 text-blue-800' },
    { value: 'link', label: 'External Link', icon: LinkIcon, color: 'bg-green-100 text-green-800' },
    { value: 'course', label: 'Course', icon: BookOpenIcon, color: 'bg-purple-100 text-purple-800' }
  ];

  const difficultyLevels = [
    { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
    { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-800' },
    { value: 'expert', label: 'Expert', color: 'bg-purple-100 text-purple-800' }
  ];

  const availableTags = [
    'Frontend', 'Backend', 'React', 'JavaScript', 'TypeScript', 'Node.js',
    'Python', 'Java', 'HTML/CSS', 'Database', 'DevOps', 'Testing',
    'Security', 'Mobile', 'AI/ML', 'Design', 'Leadership', 'Communication'
  ];

  const categoryColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'
  ];

  useEffect(() => {
    loadMaterials();
    loadCategories();
  }, [useFirebase]);

  useEffect(() => {
    filterMaterials();
  }, [materials, searchQuery, selectedCategory, selectedType]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      if (useFirebase) {
        const materialsList = await DatabaseService.list(DatabaseService.COLLECTIONS.LEARNING_MATERIALS, {
          orderBy: [{ field: 'createdAt', direction: 'desc' }]
        });
        setMaterials(materialsList);
      } else {
        // Demo data
        const demoMaterials = [
          {
            id: 1,
            title: 'React Complete Guide 2024',
            description: 'Comprehensive guide covering React fundamentals, hooks, context, and best practices.',
            type: 'document',
            category: 'frontend',
            categoryName: 'Frontend Development',
            tags: ['React', 'JavaScript', 'Frontend'],
            url: null,
            fileName: 'react-guide-2024.pdf',
            fileSize: '15.2 MB',
            difficulty: 'intermediate',
            estimatedDuration: '8 hours',
            prerequisites: ['JavaScript', 'HTML/CSS'],
            isPublic: true,
            downloads: 142,
            views: 285,
            rating: 4.8,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            uploadedBy: 'Admin'
          },
          {
            id: 2,
            title: 'Node.js Masterclass',
            description: 'Learn server-side development with Node.js, Express, and MongoDB.',
            type: 'video',
            category: 'backend',
            categoryName: 'Backend Development',
            tags: ['Node.js', 'JavaScript', 'Backend', 'MongoDB'],
            url: 'https://youtube.com/watch?v=example',
            fileName: null,
            fileSize: null,
            difficulty: 'advanced',
            estimatedDuration: '12 hours',
            prerequisites: ['JavaScript', 'Database Basics'],
            isPublic: true,
            downloads: 0,
            views: 167,
            rating: 4.9,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            uploadedBy: 'Admin'
          },
          {
            id: 3,
            title: 'TypeScript Documentation',
            description: 'Official TypeScript documentation and examples for type-safe development.',
            type: 'link',
            category: 'programming',
            categoryName: 'Programming Languages',
            tags: ['TypeScript', 'JavaScript', 'Types'],
            url: 'https://typescriptlang.org/docs',
            fileName: null,
            fileSize: null,
            difficulty: 'intermediate',
            estimatedDuration: '6 hours',
            prerequisites: ['JavaScript'],
            isPublic: true,
            downloads: 0,
            views: 203,
            rating: 4.7,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            uploadedBy: 'Admin'
          },
          {
            id: 4,
            title: 'UI/UX Design Principles',
            description: 'Essential design principles for creating user-friendly interfaces.',
            type: 'course',
            category: 'design',
            categoryName: 'Design',
            tags: ['UI/UX', 'Design', 'Principles'],
            url: null,
            fileName: 'ux-design-principles.pdf',
            fileSize: '8.7 MB',
            difficulty: 'beginner',
            estimatedDuration: '4 hours',
            prerequisites: [],
            isPublic: true,
            downloads: 89,
            views: 156,
            rating: 4.6,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            uploadedBy: 'Admin'
          },
          {
            id: 5,
            title: 'DevOps Best Practices',
            description: 'Learn deployment strategies, CI/CD, and containerization with Docker.',
            type: 'document',
            category: 'devops',
            categoryName: 'DevOps',
            tags: ['DevOps', 'Docker', 'CI/CD'],
            url: null,
            fileName: 'devops-best-practices.pdf',
            fileSize: '12.4 MB',
            difficulty: 'advanced',
            estimatedDuration: '10 hours',
            prerequisites: ['Linux', 'Networking'],
            isPublic: false,
            downloads: 34,
            views: 67,
            rating: 4.5,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            uploadedBy: 'Admin'
          }
        ];
        setMaterials(demoMaterials);
      }
    } catch (error) {
      console.error('Error loading materials:', error);
      toast.error('Failed to load learning materials');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      if (useFirebase) {
        const categoriesList = await DatabaseService.list(DatabaseService.COLLECTIONS.LEARNING_CATEGORIES);
        setCategories(categoriesList);
      } else {
        // Demo categories
        const demoCategories = [
          { id: 'frontend', name: 'Frontend Development', description: 'Client-side technologies', color: '#3B82F6', materialCount: 1 },
          { id: 'backend', name: 'Backend Development', description: 'Server-side technologies', color: '#EF4444', materialCount: 1 },
          { id: 'programming', name: 'Programming Languages', description: 'Language-specific resources', color: '#10B981', materialCount: 1 },
          { id: 'design', name: 'Design', description: 'UI/UX and visual design', color: '#F59E0B', materialCount: 1 },
          { id: 'devops', name: 'DevOps', description: 'Deployment and infrastructure', color: '#8B5CF6', materialCount: 1 }
        ];
        setCategories(demoCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filterMaterials = () => {
    let filtered = materials;

    if (searchQuery) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(material => material.category === selectedCategory);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(material => material.type === selectedType);
    }

    setFilteredMaterials(filtered);
  };

  const handleFileUpload = async () => {
    if (!newMaterial.title || !newMaterial.description || !newMaterial.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newMaterial.type !== 'link' && !newMaterial.file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (newMaterial.type === 'link' && !newMaterial.url) {
      toast.error('Please provide a URL');
      return;
    }

    setUploading(true);
    try {
      const categoryData = categories.find(cat => cat.id === newMaterial.category);
      
      const materialData = {
        ...newMaterial,
        categoryName: categoryData?.name || '',
        fileName: newMaterial.file?.name || null,
        fileSize: newMaterial.file ? `${(newMaterial.file.size / (1024 * 1024)).toFixed(1)} MB` : null,
        downloads: 0,
        views: 0,
        rating: 0,
        createdAt: new Date().toISOString(),
        uploadedBy: user?.displayName || 'Admin',
        estimatedDuration: newMaterial.estimatedDuration || '1 hour'
      };

      if (useFirebase) {
        // In real implementation, upload file to Firebase Storage
        const materialId = await DatabaseService.create(DatabaseService.COLLECTIONS.LEARNING_MATERIALS, materialData);
        materialData.id = materialId;
      } else {
        materialData.id = Date.now();
      }

      setMaterials(prev => [materialData, ...prev]);
      setNewMaterial({
        title: '',
        description: '',
        type: 'document',
        category: '',
        tags: [],
        url: '',
        file: null,
        difficulty: 'beginner',
        estimatedDuration: '',
        prerequisites: [],
        isPublic: true
      });
      setShowAddMaterial(false);
      toast.success('Learning material added successfully!');
    } catch (error) {
      console.error('Error uploading material:', error);
      toast.error('Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      const categoryData = {
        ...newCategory,
        id: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
        materialCount: 0,
        createdAt: new Date().toISOString()
      };

      if (useFirebase) {
        await DatabaseService.create(DatabaseService.COLLECTIONS.LEARNING_CATEGORIES, categoryData);
      }

      setCategories(prev => [...prev, categoryData]);
      setNewCategory({ name: '', description: '', color: '#3B82F6' });
      toast.success('Category created successfully!');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const addTagToMaterial = (tag) => {
    if (!newMaterial.tags.includes(tag)) {
      setNewMaterial(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTagFromMaterial = (tag) => {
    setNewMaterial(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addPrerequisite = (prereq) => {
    if (!newMaterial.prerequisites.includes(prereq)) {
      setNewMaterial(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, prereq]
      }));
    }
  };

  const removePrerequisite = (prereq) => {
    setNewMaterial(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter(p => p !== prereq)
    }));
  };

  const getMaterialTypeIcon = (type) => {
    const typeObj = materialTypes.find(t => t.value === type);
    const IconComponent = typeObj?.icon || DocumentIcon;
    return <IconComponent className="h-5 w-5" />;
  };

  const getMaterialTypeColor = (type) => {
    const typeObj = materialTypes.find(t => t.value === type);
    return typeObj?.color || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty) => {
    const difficultyObj = difficultyLevels.find(d => d.value === difficulty);
    return difficultyObj?.color || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Library</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage educational content, courses, and resources
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCategoryManager(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <FolderIcon className="h-5 w-5 mr-2" />
            Manage Categories
          </button>
          <button
            onClick={() => setShowAddMaterial(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Material
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Materials</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{materials.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DocumentIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Documents</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {materials.filter(m => m.type === 'document' || m.type === 'course').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <VideoCameraIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Videos</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {materials.filter(m => m.type === 'video').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <FolderIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-center justify-between mb-2">
                <FolderOpenIcon className="h-5 w-5" style={{ color: category.color }} />
                <span className="text-sm text-gray-600 dark:text-gray-400">{category.materialCount} items</span>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Types</option>
            {materialTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            Showing {filteredMaterials.length} of {materials.length} materials
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <div key={material.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getMaterialTypeColor(material.type)}`}>
                    {getMaterialTypeIcon(material.type)}
                    <span className="ml-1">{materialTypes.find(t => t.value === material.type)?.label}</span>
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(material.difficulty)}`}>
                    {material.difficulty}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {material.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {material.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {material.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                    {tag}
                  </span>
                ))}
                {material.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                    +{material.tags.length - 3}
                  </span>
                )}
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span>Category:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{material.categoryName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Duration:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{material.estimatedDuration}</span>
                </div>
                {material.fileSize && (
                  <div className="flex items-center justify-between">
                    <span>Size:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{material.fileSize}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Views:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{material.views}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Added {format(new Date(material.createdAt), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center space-x-2">
                    {material.type === 'link' ? (
                      <button className="inline-flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                        <LinkIcon className="h-4 w-4 mr-1" />
                        Open Link
                      </button>
                    ) : (
                      <button className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                        <DownloadIcon className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredMaterials.length === 0 && (
          <div className="col-span-full text-center py-12">
            <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No learning materials found</p>
          </div>
        )}
      </div>

      {/* Add Material Modal */}
      {showAddMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Learning Material</h3>
                <button
                  onClick={() => setShowAddMaterial(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., React Complete Guide 2024"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Describe the content and learning objectives..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type *
                    </label>
                    <select
                      value={newMaterial.type}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {materialTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={newMaterial.category}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={newMaterial.difficulty}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {difficultyLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estimated Duration
                    </label>
                    <input
                      type="text"
                      value={newMaterial.estimatedDuration}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., 4 hours"
                    />
                  </div>
                </div>
                
                {newMaterial.type === 'link' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL *
                    </label>
                    <input
                      type="url"
                      value={newMaterial.url}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="https://example.com"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      File *
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, file: e.target.files[0] }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      accept={newMaterial.type === 'document' || newMaterial.type === 'course' ? '.pdf,.doc,.docx' : 'video/*'}
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newMaterial.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded flex items-center">
                        {tag}
                        <button
                          onClick={() => removeTagFromMaterial(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {availableTags.filter(tag => !newMaterial.tags.includes(tag)).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTagToMaterial(tag)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prerequisites
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newMaterial.prerequisites.map((prereq) => (
                      <span key={prereq} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded flex items-center">
                        {prereq}
                        <button
                          onClick={() => removePrerequisite(prereq)}
                          className="ml-1 text-yellow-600 hover:text-yellow-800"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {availableTags.filter(tag => !newMaterial.prerequisites.includes(tag)).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addPrerequisite(tag)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newMaterial.isPublic}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
                    Make this material publicly accessible to all employees
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddMaterial(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Add Material'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Categories</h3>
                <button
                  onClick={() => setShowCategoryManager(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Frontend Development"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Brief description of the category"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categoryColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newCategory.color === color ? 'border-gray-900 dark:border-white' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCategoryManager(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCategory}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  Create Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
