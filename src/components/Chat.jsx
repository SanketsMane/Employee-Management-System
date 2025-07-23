import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api/client';
import toast from 'react-hot-toast';
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  PhotoIcon,
  DocumentIcon,
  TrashIcon,
  PencilIcon,
  EllipsisVerticalIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

export default function Chat() {
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    // Set up polling for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await apiClient.get('/chat/messages');
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (loading) {
        console.log('Chat API not available yet, using empty state');
      }
      // Set empty array instead of showing error for now
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !selectedFile) {
      return;
    }

    setSending(true);
    
    try {
      const formData = new FormData();
      formData.append('content', newMessage);
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await apiClient.post('/chat/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.success) {
        setNewMessage('');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchMessages();
        toast.success('Message sent successfully');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleEditMessage = async (messageId) => {
    if (!editText.trim()) {
      return;
    }

    try {
      const response = await apiClient.put(`/chat/messages/${messageId}`, {
        content: editText
      });

      if (response.success) {
        setEditingMessage(null);
        setEditText('');
        fetchMessages();
        toast.success('Message updated successfully');
      }
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/chat/messages/${messageId}`);
      if (response.success) {
        fetchMessages();
        toast.success('Message deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return date.toLocaleDateString();
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes < 1 ? 'Just now' : `${diffMinutes}m ago`;
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <PhotoIcon className="w-5 h-5" />;
    }
    return <DocumentIcon className="w-5 h-5" />;
  };

  const canEditOrDelete = (message) => {
    return message.sender._id === (user.userId || user.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading chat...</span>
      </div>
    );
  }

  return (
    <div className="h-[600px] flex flex-col">
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-4 rounded-t-xl">
        <h2 className="text-xl font-bold flex items-center">
          💬 Team Chat
        </h2>
        <p className="text-violet-100 text-sm mt-1">
          Connect with all registered employees
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <UserCircleIcon className="w-16 h-16 mx-auto mb-4" />
            </div>
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.sender._id === (user.userId || user.id) ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative group ${
                  message.sender._id === (user.userId || user.id)
                    ? 'bg-violet-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {/* Sender Info */}
                {message.sender._id !== (user.userId || user.id) && (
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {message.sender.fullName || message.sender.email}
                  </div>
                )}

                {/* Message Content */}
                {editingMessage === message._id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded text-gray-800"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleEditMessage(message._id);
                        }
                      }}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditMessage(message._id)}
                        className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingMessage(null);
                          setEditText('');
                        }}
                        className="text-xs bg-gray-500 text-white px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {message.content && (
                      <div className="text-sm">{message.content}</div>
                    )}
                    
                    {/* File Attachment */}
                    {message.attachment && (
                      <div className="mt-2">
                        {message.attachment.type?.startsWith('image/') ? (
                          <img
                            src={message.attachment.url}
                            alt="Attachment"
                            className="max-w-xs rounded-lg cursor-pointer"
                            onClick={() => window.open(message.attachment.url, '_blank')}
                          />
                        ) : (
                          <div className="flex items-center p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                            {getFileIcon(message.attachment.fileName)}
                            <span className="ml-2 text-sm text-gray-700 truncate">
                              {message.attachment.fileName}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Message Actions */}
                {canEditOrDelete(message) && editingMessage !== message._id && (
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="relative">
                      <button
                        onClick={() => setShowDropdown(showDropdown === message._id ? null : message._id)}
                        className="p-1 bg-gray-600 text-white rounded-full hover:bg-gray-700"
                      >
                        <EllipsisVerticalIcon className="w-3 h-3" />
                      </button>
                      
                      {showDropdown === message._id && (
                        <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => {
                              setEditingMessage(message._id);
                              setEditText(message.content);
                              setShowDropdown(null);
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <PencilIcon className="w-4 h-4 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteMessage(message._id);
                              setShowDropdown(null);
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div
                  className={`text-xs mt-1 ${
                    message.sender._id === user.id
                      ? 'text-violet-200'
                      : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.createdAt)}
                  {message.edited && (
                    <span className="ml-1 italic">(edited)</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 rounded-b-xl">
        {selectedFile && (
          <div className="mb-3 p-2 bg-gray-100 rounded-lg flex items-center">
            {getFileIcon(selectedFile.name)}
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
              {selectedFile.name}
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="text-red-500 hover:text-red-700"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                disabled={sending}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <PaperClipIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={(!newMessage.trim() && !selectedFile) || sending}
            className="p-2 bg-violet-500 text-white rounded-full hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <PaperAirplaneIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.txt"
          className="hidden"
        />
      </form>
    </div>
  );
}
