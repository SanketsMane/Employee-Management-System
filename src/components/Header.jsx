// Ultra Modern Header Component
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Header = () => {
  const { user, userProfile, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-b border-white/20 dark:border-gray-700/20 sticky top-0 z-50 shadow-lg shadow-violet-500/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left side - Welcome message */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Welcome back, {userProfile?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}!
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </motion.div>
          
          {/* Right side - Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-3 rounded-2xl text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 bg-white/50 dark:bg-gray-800/50 hover:bg-violet-50 dark:hover:bg-violet-900/20 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 transition-all duration-200 shadow-lg hover:shadow-xl"
              title="Notifications"
            >
              <BellIcon className="w-6 h-6" />
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-full"
              />
            </motion.button>

            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95, rotate: 180 }}
              onClick={toggleDarkMode}
              className="p-3 rounded-2xl text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 bg-white/50 dark:bg-gray-800/50 hover:bg-violet-50 dark:hover:bg-violet-900/20 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 transition-all duration-200 shadow-lg hover:shadow-xl"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SunIcon className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MoonIcon className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-3 rounded-2xl text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 bg-white/50 dark:bg-gray-800/50 hover:bg-violet-50 dark:hover:bg-violet-900/20 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {userProfile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="font-semibold text-sm">
                    {userProfile?.fullName || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs opacity-75">
                    {userProfile?.role === 'admin' ? '🛡️ Admin' : '👨‍💼 Employee'}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: showProfileMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold">
                            {userProfile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {userProfile?.fullName || 'User Name'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user?.email || 'user@example.com'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <motion.button
                        whileHover={{ x: 5 }}
                        onClick={() => {
                          navigate('/profile');
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 p-3 rounded-xl text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all duration-200"
                      >
                        <Cog6ToothIcon className="w-5 h-5" />
                        <span className="font-medium">Settings & Profile</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ x: 5 }}
                        onClick={() => {
                          handleLogout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 p-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
