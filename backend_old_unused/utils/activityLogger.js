import ActivityLog from '../models/ActivityLog.js';

// Helper function to log user activities
export const logActivity = async (userId, type, action, details = '', metadata = {}, req = null) => {
  try {
    const activityData = {
      user: userId,
      type,
      action,
      details,
      metadata
    };

    // Extract IP and user agent from request if available
    if (req) {
      activityData.ip = req.ip || req.connection?.remoteAddress || '';
      activityData.userAgent = req.get('User-Agent') || '';
    }

    const activity = new ActivityLog(activityData);
    await activity.save();
    
    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error to avoid breaking main functionality
    return null;
  }
};

// Get recent activities for a user
export const getUserRecentActivities = async (userId, limit = 10) => {
  try {
    const activities = await ActivityLog.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('user', 'fullName email')
      .lean();
    
    return activities;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return [];
  }
};

// Get all recent activities for admin
export const getAllRecentActivities = async (limit = 50) => {
  try {
    const activities = await ActivityLog.find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('user', 'fullName email department position')
      .lean();
    
    return activities;
  } catch (error) {
    console.error('Error fetching all activities:', error);
    return [];
  }
};

// Activity type mappings for consistent logging
export const ACTIVITY_TYPES = {
  AUTH: {
    LOGIN: { type: 'login', action: 'User logged in' },
    LOGOUT: { type: 'logout', action: 'User logged out' },
    PASSWORD_CHANGE: { type: 'profile_update', action: 'Password changed' }
  },
  ATTENDANCE: {
    CHECK_IN: { type: 'attendance_check_in', action: 'Checked in to work' },
    CHECK_OUT: { type: 'attendance_check_out', action: 'Checked out from work' },
    BREAK_START: { type: 'attendance_check_in', action: 'Started break' },
    BREAK_END: { type: 'attendance_check_out', action: 'Ended break' }
  },
  TASKS: {
    CREATE: { type: 'task_creation', action: 'Created new task' },
    UPDATE: { type: 'task_creation', action: 'Updated task' },
    COMPLETE: { type: 'task_completion', action: 'Completed task' }
  },
  LEAVE: {
    APPLY: { type: 'leave_application', action: 'Applied for leave' },
    APPROVE: { type: 'admin_action', action: 'Approved leave request' },
    REJECT: { type: 'admin_action', action: 'Rejected leave request' }
  },
  PROFILE: {
    UPDATE: { type: 'profile_update', action: 'Updated profile information' }
  },
  PROJECT: {
    ACCESS: { type: 'project_access', action: 'Accessed project' },
    CREATE: { type: 'admin_action', action: 'Created new project' }
  }
};
