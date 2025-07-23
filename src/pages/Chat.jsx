import { useAuth } from '../contexts/AuthContext';
import ChatComponent from '../components/Chat';
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function Chat() {
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Team Chat
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Collaborate and communicate with your team in real-time
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <UserGroupIcon className="w-4 h-4" />
                <span>Team Channel</span>
              </div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-xl overflow-hidden">
          {/* Chat Features Info */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 px-6 py-4 border-b border-pink-100 dark:border-pink-800/30">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              <div className="text-sm">
                <span className="font-medium text-pink-800 dark:text-pink-200">Enhanced Team Chat:</span>
                <span className="text-pink-600 dark:text-pink-400 ml-1">
                  Send messages, share files, edit & delete messages, and collaborate in real-time
                </span>
              </div>
            </div>
          </div>
          
          {/* Chat Component */}
          <div className="h-[calc(100vh-16rem)]">
            <ChatComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
