// Sidebar Component
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { userProfile, isAdmin } = useAuth();

  const employeeNavItems = [
    { path: '/dashboard', name: 'Dashboard', icon: '📊' },
    { path: '/attendance', name: 'Attendance', icon: '🕒' },
    { path: '/tasks', name: 'Tasks', icon: '📋' },
    { path: '/chat', name: 'Chat', icon: '💬' },
    { path: '/learning', name: 'Learning', icon: '📚' },
    { path: '/profile', name: 'Profile', icon: '👤' },
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', name: 'Admin Dashboard', icon: '📊' },
    { path: '/admin/employees', name: 'Employees', icon: '👥' },
    { path: '/admin/batches', name: 'Batches', icon: '📦' },
    { path: '/admin/reports', name: 'Reports', icon: '📈' },
    { path: '/admin/activity', name: 'Activity Monitor', icon: '🎯' },
    { path: '/tasks', name: 'Tasks', icon: '📋' },
    { path: '/attendance', name: 'Attendance', icon: '🕒' },
    { path: '/learning', name: 'Learning', icon: '📚' },
    { path: '/chat', name: 'Chat', icon: '💬' },
    { path: '/profile', name: 'Profile', icon: '👤' },
  ];

  const navItems = isAdmin ? adminNavItems : employeeNavItems;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg w-64 min-h-screen">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">EMS</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {userProfile?.role === 'admin' ? 'Admin Panel' : 'Employee Portal'}
            </p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 mt-1 text-base font-medium rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }`
              }
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
