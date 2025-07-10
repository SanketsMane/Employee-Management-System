import { toast } from 'react-hot-toast';
import { collection, addDoc, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Notification types
export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMPLETED: 'task_completed',
  TASK_OVERDUE: 'task_overdue',
  ATTENDANCE_REMINDER: 'attendance_reminder',
  BATCH_ASSIGNED: 'batch_assigned',
  LEARNING_DEADLINE: 'learning_deadline',
  ADMIN_ANNOUNCEMENT: 'admin_announcement',
  CHAT_MESSAGE: 'chat_message',
  SYSTEM_ALERT: 'system_alert'
};

// Create notification
export const createNotification = async (notification) => {
  try {
    const notificationData = {
      ...notification,
      createdAt: new Date(),
      read: false,
      id: Date.now().toString()
    };

    await addDoc(collection(db, 'notifications'), notificationData);
    
    // Show toast notification if it's for the current user
    if (notification.showToast) {
      showToastNotification(notification);
    }

    return { success: true, data: notificationData };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }
};

// Get notifications for user
export const getUserNotifications = async (userId, limit = 50) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const notifications = [];
    
    snapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, data: notifications };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return { success: false, error: error.message };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
      readAt: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
};

// Show toast notification
const showToastNotification = (notification) => {
  const { type, title, message } = notification;
  
  switch (type) {
    case NOTIFICATION_TYPES.TASK_ASSIGNED:
      toast.success(`New Task: ${title}`, {
        duration: 5000,
        position: 'top-right',
        icon: '📋'
      });
      break;
    case NOTIFICATION_TYPES.TASK_COMPLETED:
      toast.success(`Task Completed: ${title}`, {
        duration: 4000,
        position: 'top-right',
        icon: '✅'
      });
      break;
    case NOTIFICATION_TYPES.TASK_OVERDUE:
      toast.error(`Task Overdue: ${title}`, {
        duration: 6000,
        position: 'top-right',
        icon: '⚠️'
      });
      break;
    case NOTIFICATION_TYPES.ATTENDANCE_REMINDER:
      toast('Attendance Reminder', {
        duration: 5000,
        position: 'top-right',
        icon: '⏰'
      });
      break;
    case NOTIFICATION_TYPES.BATCH_ASSIGNED:
      toast.success(`Added to Batch: ${title}`, {
        duration: 5000,
        position: 'top-right',
        icon: '👥'
      });
      break;
    case NOTIFICATION_TYPES.LEARNING_DEADLINE:
      toast('Learning Deadline Approaching', {
        duration: 6000,
        position: 'top-right',
        icon: '📚'
      });
      break;
    case NOTIFICATION_TYPES.ADMIN_ANNOUNCEMENT:
      toast(title, {
        duration: 8000,
        position: 'top-right',
        icon: '📢'
      });
      break;
    case NOTIFICATION_TYPES.CHAT_MESSAGE:
      toast(`New Message: ${message}`, {
        duration: 3000,
        position: 'top-right',
        icon: '💬'
      });
      break;
    case NOTIFICATION_TYPES.SYSTEM_ALERT:
      toast.error(`System Alert: ${title}`, {
        duration: 8000,
        position: 'top-right',
        icon: '🚨'
      });
      break;
    default:
      toast(title || message, {
        duration: 4000,
        position: 'top-right'
      });
  }
};

// Bulk notification for admins
export const sendBulkNotification = async (userIds, notification) => {
  try {
    const promises = userIds.map(userId => 
      createNotification({
        ...notification,
        userId,
        showToast: false // Don't show toast for bulk notifications
      })
    );
    
    await Promise.all(promises);
    return { success: true };
  } catch (error) {
    console.error('Error sending bulk notification:', error);
    return { success: false, error: error.message };
  }
};

// Schedule notification (for future features)
export const scheduleNotification = async (notification, scheduledTime) => {
  try {
    const notificationData = {
      ...notification,
      scheduledTime,
      status: 'scheduled',
      createdAt: new Date()
    };

    await addDoc(collection(db, 'scheduledNotifications'), notificationData);
    return { success: true };
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return { success: false, error: error.message };
  }
};

// Push notification helpers (for future PWA implementation)
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const showBrowserNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });
  }
};

// Service worker notification (for PWA)
export const showServiceWorkerNotification = (title, options = {}) => {
  if ('serviceWorker' in navigator && 'Notification' in window) {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        ...options
      });
    });
  }
};

// Simple notification function for showing toast messages
export const showNotification = (message, type = 'info') => {
  const options = {
    duration: 4000,
    position: 'top-right'
  };

  switch (type) {
    case 'success':
      toast.success(message, options);
      break;
    case 'error':
      toast.error(message, options);
      break;
    case 'warning':
      toast(message, { ...options, icon: '⚠️' });
      break;
    case 'info':
    default:
      toast(message, options);
      break;
  }
};
