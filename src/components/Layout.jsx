// Ultra Modern Layout Component
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 overflow-x-hidden overflow-y-auto relative"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 via-transparent to-blue-50/30 dark:from-gray-900/30 dark:via-transparent dark:to-gray-800/30 pointer-events-none" />
          
          <div className="relative z-10 p-6">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;
