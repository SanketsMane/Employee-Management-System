import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'on-hold', 'cancelled'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'lead', 'coordinator'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  budget: {
    allocated: {
      type: Number,
      default: 0
    },
    spent: {
      type: Number,
      default: 0
    }
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better search performance
projectSchema.index({ name: 'text', description: 'text' });
projectSchema.index({ status: 1 });
projectSchema.index({ manager: 1 });
projectSchema.index({ 'members.user': 1 });

export default mongoose.model('Project', projectSchema);
