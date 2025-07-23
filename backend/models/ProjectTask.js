import mongoose from 'mongoose';

const projectTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'review', 'rejected'],
      default: 'pending'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['draft', 'assigned', 'in-progress', 'completed', 'overdue'],
    default: 'draft'
  },
  dueDate: {
    type: Date,
    required: true
  },
  estimatedHours: {
    type: Number,
    default: 0
  },
  actualHours: {
    type: Number,
    default: 0
  },
  attachments: [{
    name: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
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

// Index for better performance
projectTaskSchema.index({ project: 1 });
projectTaskSchema.index({ 'assignedTo.user': 1 });
projectTaskSchema.index({ status: 1 });
projectTaskSchema.index({ dueDate: 1 });

export default mongoose.model('ProjectTask', projectTaskSchema);
