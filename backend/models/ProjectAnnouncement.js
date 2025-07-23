import mongoose from 'mongoose';

const projectAnnouncementSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'urgent'],
    default: 'info'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readAt: {
      type: Date
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  attachments: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  pinned: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better performance
projectAnnouncementSchema.index({ project: 1 });
projectAnnouncementSchema.index({ 'recipients.user': 1 });
projectAnnouncementSchema.index({ createdAt: -1 });

export default mongoose.model('ProjectAnnouncement', projectAnnouncementSchema);
