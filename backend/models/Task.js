import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxLength: [100, 'Task title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    maxLength: [1000, 'Task description cannot exceed 1000 characters']
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  completedAt: {
    type: Date,
    default: null
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  estimatedHours: {
    type: Number,
    default: 0
  },
  actualHours: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ dueDate: 1 });

export default mongoose.model('Task', taskSchema);
