import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { logActivity } from '../firebase/realtime';
import { showNotification } from '../services/notificationService';
import {
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
  UsersIcon,
  HashtagIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const channels = [
    { id: 'general', name: 'General', icon: HashtagIcon, description: 'General discussions' },
    { id: 'development', name: 'Development', icon: HashtagIcon, description: 'Development topics' },
    { id: 'design', name: 'Design', icon: HashtagIcon, description: 'Design discussions' },
    { id: 'marketing', name: 'Marketing', icon: HashtagIcon, description: 'Marketing activities' },
    { id: 'announcements', name: 'Announcements', icon: ChatBubbleLeftIcon, description: 'Important announcements' }
  ];

  // Load messages for selected channel
  useEffect(() => {
    if (!selectedChannel) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('channel', '==', selectedChannel),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      
      // Sort messages by timestamp (oldest first for display)
      messagesData.sort((a, b) => a.createdAt - b.createdAt);
      setMessages(messagesData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading messages:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [selectedChannel]);

  // Load online users
  useEffect(() => {
    const usersRef = collection(db, 'userPresence');
    const q = query(usersRef, where('isOnline', '==', true));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOnlineUsers(users);
    });

    return unsubscribe;
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      text: newMessage.trim(),
      sender: user.displayName || user.email,
      senderId: user.uid,
      senderEmail: user.email,
      channel: selectedChannel,
      createdAt: serverTimestamp(),
      type: 'text'
    };

    try {
      await addDoc(collection(db, 'messages'), messageData);
      await logActivity(user.uid, 'message-sent', `Sent message in #${selectedChannel}`);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('Error sending message. Please try again.', 'error');
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return format(date, 'HH:mm');
  };

  const formatDate = (date) => {
    if (!date) return '';
    return format(date, 'MMM dd, yyyy');
  };

  const isCurrentUser = (senderId) => {
    return senderId === user.uid;
  };

  const getMessageGroupDate = (message, prevMessage) => {
    if (!prevMessage) return formatDate(message.createdAt);
    
    const currentDate = message.createdAt;
    const prevDate = prevMessage.createdAt;
    
    if (!currentDate || !prevDate) return null;
    
    const isSameDay = currentDate.toDateString() === prevDate.toDateString();
    return isSameDay ? null : formatDate(currentDate);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Team Chat
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Stay connected with your team
          </p>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Channels
            </h3>
            <div className="space-y-1">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedChannel === channel.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <channel.icon className="h-4 w-4 mr-2" />
                  {channel.name}
                </button>
              ))}
            </div>
          </div>

          {/* Online Users */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Online ({onlineUsers.length})
            </h3>
            <div className="space-y-2">
              {onlineUsers.map((onlineUser) => (
                <div key={onlineUser.id} className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {onlineUser.displayName || onlineUser.email}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center">
            <HashtagIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {channels.find(c => c.id === selectedChannel)?.name}
            </h3>
            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
              {channels.find(c => c.id === selectedChannel)?.description}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const prevMessage = messages[index - 1];
                const groupDate = getMessageGroupDate(message, prevMessage);
                const isConsecutive = prevMessage && 
                  prevMessage.senderId === message.senderId &&
                  (message.createdAt - prevMessage.createdAt) < 300000; // 5 minutes

                return (
                  <div key={message.id}>
                    {/* Date separator */}
                    {groupDate && (
                      <div className="flex items-center justify-center py-2">
                        <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {groupDate}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Message */}
                    <div className={`flex ${isCurrentUser(message.senderId) ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                        isCurrentUser(message.senderId) ? 'order-2' : 'order-1'
                      }`}>
                        {!isConsecutive && (
                          <div className={`flex items-center mb-1 ${
                            isCurrentUser(message.senderId) ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {message.sender}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={`px-4 py-2 rounded-lg ${
                          isCurrentUser(message.senderId)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}>
                          <p className="text-sm">{message.text}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message #${selectedChannel}...`}
                className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <div className="absolute right-2 top-2 flex items-center space-x-1">
                <button
                  type="button"
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FaceSmileIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <PaperClipIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
