import { rtdb } from './config';
import { ref, set, onValue, onDisconnect, push, serverTimestamp } from 'firebase/database';

// Online status management
export const setUserOnline = (userId, userInfo) => {
  const userStatusRef = ref(rtdb, `status/${userId}`);
  const userPresenceRef = ref(rtdb, `presence/${userId}`);
  
  // Set user as online
  set(userStatusRef, {
    state: 'online',
    lastSeen: serverTimestamp(),
    ...userInfo
  });

  // Set user as offline when disconnected
  onDisconnect(userStatusRef).set({
    state: 'offline',
    lastSeen: serverTimestamp(),
    ...userInfo
  });

  // Track presence for real-time updates
  set(userPresenceRef, {
    online: true,
    lastSeen: serverTimestamp()
  });

  onDisconnect(userPresenceRef).remove();
};

export const setUserOffline = (userId) => {
  const userStatusRef = ref(rtdb, `status/${userId}`);
  set(userStatusRef, {
    state: 'offline',
    lastSeen: serverTimestamp()
  });
};

export const getUserStatus = (userId, callback) => {
  const userStatusRef = ref(rtdb, `status/${userId}`);
  return onValue(userStatusRef, callback);
};

export const getAllUsersStatus = (callback) => {
  const statusRef = ref(rtdb, 'status');
  return onValue(statusRef, callback);
};

// Chat functionality
export const sendMessage = (chatId, message) => {
  const messagesRef = ref(rtdb, `chats/${chatId}/messages`);
  return push(messagesRef, {
    ...message,
    timestamp: serverTimestamp()
  });
};

export const listenToMessages = (chatId, callback) => {
  const messagesRef = ref(rtdb, `chats/${chatId}/messages`);
  return onValue(messagesRef, callback);
};

// Activity logging
export const logActivity = (userId, activity) => {
  const activityRef = ref(rtdb, `activities/${userId}`);
  return push(activityRef, {
    ...activity,
    timestamp: serverTimestamp()
  });
};

export const getActivityLogs = (userId, callback) => {
  const activityRef = ref(rtdb, `activities/${userId}`);
  return onValue(activityRef, callback);
};

export const getAllActivityLogs = (callback) => {
  const activitiesRef = ref(rtdb, 'activities');
  return onValue(activitiesRef, callback);
};
