// Ultra Modern Sidebar Component with Glassmorphism
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  ClockIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  UserIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentChartBarIcon,
  EyeIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  SunIcon,
  MoonIcon,
  CommandLineIcon,
  BuildingOfficeIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { userProfile, isAdmin, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  const employeeNavItems = [
    { 
      path: '/dashboard', 
      name: 'Dashboard', 
      icon: HomeIcon,
      description: 'Overview & Stats',
      color: 'text-violet-600',
      bgColor: 'bg-gradient-to-r from-violet-500/10 to-purple-500/10',
      activeColor: 'from-violet-600 to-purple-600'
    },
    { 
      path: '/attendance', 
      name: 'Attendance', 
      icon: ClockIcon,
      description: 'Track Time',
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10',
      activeColor: 'from-emerald-600 to-teal-600'
    },
    { 
      path: '/worksheet', 
      name: 'Worksheet', 
      icon: DocumentTextIcon,
      description: 'Daily Work',
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10',
      activeColor: 'from-blue-600 to-cyan-600'
    },
    { 
      path: '/tasks', 
      name: 'Tasks', 
      icon: ClipboardDocumentListIcon,
      description: 'Assignments',
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-r from-orange-500/10 to-amber-500/10',
      activeColor: 'from-orange-600 to-amber-600'
    },
    { 
      path: '/projects', 
      name: 'Projects', 
      icon: FolderIcon,
      description: 'Active Work',
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-r from-purple-500/10 to-pink-500/10',
      activeColor: 'from-purple-600 to-pink-600'
    },
    { 
      path: '/chat', 
      name: 'Team Chat', 
      icon: ChatBubbleLeftRightIcon,
      description: 'Collaborate',
      color: 'text-pink-600',
      bgColor: 'bg-gradient-to-r from-pink-500/10 to-rose-500/10',
      activeColor: 'from-pink-600 to-rose-600'
    },
    { 
      path: '/leave', 
      name: 'Leave Management', 
      icon: CalendarDaysIcon,
      description: 'Time Off',
      color: 'text-cyan-600',
      bgColor: 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10',
      activeColor: 'from-cyan-600 to-blue-600'
    },
    { 
      path: '/profile', 
      name: 'Profile', 
      icon: UserIcon,
      description: 'Your Info',
      color: 'text-gray-600',
      bgColor: 'bg-gradient-to-r from-gray-500/10 to-slate-500/10',
      activeColor: 'from-gray-600 to-slate-600'
    },
  ];

  const adminNavItems = [
    { 
      path: '/admin/dashboard', 
      name: 'Admin Dashboard', 
      icon: ChartBarIcon,
      description: 'Control Center',
      color: 'text-violet-600',
      bgColor: 'bg-gradient-to-r from-violet-500/10 to-purple-500/10',
      activeColor: 'from-violet-600 to-purple-600'
    },
    { 
      path: '/admin/employees', 
      name: 'Employees', 
      icon: UsersIcon,
      description: 'Team Management',
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10',
      activeColor: 'from-blue-600 to-cyan-600'
    },
    { 
      path: '/admin/worksheets', 
      name: 'Worksheets', 
      icon: DocumentTextIcon,
      description: 'Work Tracking',
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10',
      activeColor: 'from-emerald-600 to-teal-600'
    },
    { 
      path: '/admin/projects', 
      name: 'Projects', 
      icon: FolderIcon,
      description: 'Project Oversight',
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-r from-purple-500/10 to-pink-500/10',
      activeColor: 'from-purple-600 to-pink-600'
    },
    { 
      path: '/admin/leave', 
      name: 'Leave Management', 
      icon: CalendarDaysIcon,
      description: 'Approve Leaves',
      color: 'text-cyan-600',
      bgColor: 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10',
      activeColor: 'from-cyan-600 to-blue-600'
    },
    { 
      path: '/admin/shift-settings', 
      name: 'Shift Settings', 
      icon: Cog6ToothIcon,
      description: 'Work Schedule',
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-r from-orange-500/10 to-amber-500/10',
      activeColor: 'from-orange-600 to-amber-600'
    },
    { 
      path: '/admin/reports', 
      name: 'Reports', 
      icon: DocumentChartBarIcon,
      description: 'Analytics',
      color: 'text-indigo-600',
      bgColor: 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10',
      activeColor: 'from-indigo-600 to-purple-600'
    },
    { 
      path: '/admin/activity', 
      name: 'Activity Monitor', 
      icon: EyeIcon,
      description: 'Live Monitoring',
      color: 'text-red-600',
      bgColor: 'bg-gradient-to-r from-red-500/10 to-pink-500/10',
      activeColor: 'from-red-600 to-pink-600'
    },
    { 
      path: '/chat', 
      name: 'Team Chat', 
      icon: ChatBubbleLeftRightIcon,
      description: 'Communicate',
      color: 'text-pink-600',
      bgColor: 'bg-gradient-to-r from-pink-500/10 to-rose-500/10',
      activeColor: 'from-pink-600 to-rose-600'
    },
    { 
      path: '/profile', 
      name: 'Profile', 
      icon: UserIcon,
      description: 'Your Settings',
      color: 'text-gray-600',
      bgColor: 'bg-gradient-to-r from-gray-500/10 to-slate-500/10',
      activeColor: 'from-gray-600 to-slate-600'
    },
  ];

  // Defensive: Only show adminNavItems if userProfile.role is 'admin' or 'super_admin'
  const navItems = (userProfile?.role === 'admin' || userProfile?.role === 'super_admin') ? adminNavItems : employeeNavItems;

  return (
    <motion.div 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl w-80 h-screen border-r border-white/20 dark:border-gray-700/20 relative overflow-hidden flex flex-col"
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-pink-500/5 dark:from-violet-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />
      
      {/* Header Section - Fixed */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative p-6 border-b border-white/10 dark:border-gray-700/20 flex-shrink-0"
      >
        <div className="flex items-center space-x-4">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/25">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full border-2 border-white dark:border-gray-900 shadow-lg"
            />
          </motion.div>
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              EMS Formonex
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center space-x-1"
            >
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                {userProfile?.role === 'admin' ? '🛡️' : '👨‍💼'}
              </motion.span>
              <span>{userProfile?.role === 'admin' ? 'Admin Panel' : 'Employee Portal'}</span>
            </motion.p>
          </div>
        </div>
      </motion.div>
      
      {/* Navigation Section - Scrollable */}
      <nav className="flex-1 relative overflow-hidden">
        <div className="h-full overflow-y-auto overflow-x-hidden p-6 scrollbar-violet">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-3"
          >
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-4 mb-6 flex items-center space-x-2">
              <CommandLineIcon className="w-4 h-4" />
              <span>Navigation</span>
            </p>
            <AnimatePresence>
              {navItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `group flex items-center px-4 py-4 text-sm font-medium rounded-2xl transition-all duration-300 relative overflow-hidden ${
                          isActive
                            ? `text-white shadow-xl shadow-${item.color.split('-')[1]}-500/25`
                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:shadow-lg'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active Background */}
                          {isActive && (
                            <motion.div
                              layoutId="activeTab"
                              className={`absolute inset-0 bg-gradient-to-r ${item.activeColor} rounded-2xl`}
                              initial={false}
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          
                          {/* Hover Background */}
                          {!isActive && (
                            <motion.div
                              className={`absolute inset-0 ${item.bgColor} rounded-2xl opacity-0 group-hover:opacity-100`}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                          
                          <motion.div 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl transition-colors relative z-10 ${
                              isActive 
                                ? 'bg-white/20 backdrop-blur-sm' 
                                : `${item.color} bg-opacity-10`
                            }`}
                          >
                            <IconComponent className={`w-6 h-6 ${isActive ? 'text-white' : item.color}`} />
                          </motion.div>
                          <div className="ml-4 flex-1 relative z-10">
                            <p className={`font-bold ${isActive ? 'text-white' : ''}`}>{item.name}</p>
                            <p className={`text-xs opacity-75 ${isActive ? 'text-white/80' : ''}`}>{item.description}</p>
                          </div>
                          
                          {/* Subtle Arrow for Active */}
                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="relative z-10"
                            >
                              <div className="w-2 h-2 bg-white rounded-full opacity-60" />
                            </motion.div>
                          )}
                        </>
                      )}
                    </NavLink>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </nav>

      {/* Footer Section - Fixed */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="relative p-6 border-t border-white/10 dark:border-gray-700/20 flex-shrink-0"
      >
        <div className="grid grid-cols-3 gap-3 mb-4">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {/* Add notification handler */}}
            className="flex items-center justify-center p-3 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl hover:bg-white/70 dark:hover:bg-gray-700/70 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <BellIcon className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95, rotate: 180 }}
            onClick={toggleDarkMode}
            className="flex items-center justify-center p-3 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl hover:bg-white/70 dark:hover:bg-gray-700/70 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <motion.div
              animate={{ rotate: darkMode ? 180 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </motion.div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="flex items-center justify-center p-3 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50/70 dark:bg-red-900/30 backdrop-blur-sm rounded-xl hover:bg-red-100/70 dark:hover:bg-red-800/40 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </motion.button>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center space-x-2">
            <CpuChipIcon className="w-3 h-3" />
            <span>v2.1.0 • Powered by AI</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              ❤️
            </motion.span>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;
