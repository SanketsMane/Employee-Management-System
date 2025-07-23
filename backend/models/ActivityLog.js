import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'task_creation', 'task_completion', 'project_access', 'attendance_check_in', 'attendance_check_out', 'leave_application', 'profile_update', 'admin_action', 'file_upload']
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ''
  },
  ip: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  device: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['success', 'warning', 'error', 'info'],
    default: 'success'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient querying
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ type: 1, createdAt: -1 });
activityLogSchema.index({ status: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

// Helper method to create activity log
activityLogSchema.statics.createLog = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Error creating activity log:', error);
    return null;
  }
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
