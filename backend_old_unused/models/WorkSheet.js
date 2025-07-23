import mongoose from 'mongoose';

const workSheetEntrySchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    trim: true
  },
  to: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    trim: true
  },
  task: {
    type: String,
    required: false,
    trim: true,
    maxLength: 500,
    default: ''
  },
  project: {
    type: String,
    required: false,
    trim: true,
    maxLength: 100,
    default: ''
  },
  status: {
    type: String,
    required: true,
    enum: ['Completed', 'In Progress', 'Pending'],
    default: 'Pending'
  },
  duration: {
    type: Number, // Duration in minutes
    default: 60
  }
}, { _id: true });

const workSheetBreakSchema = new mongoose.Schema({
  start: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    trim: true
  },
  end: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    trim: true
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
    enum: ['Lunch', 'Tea Break', 'Personal', 'Meeting', 'Other']
  },
  duration: {
    type: Number, // Duration in minutes
    default: 0
  }
}, { _id: true });

const workSheetSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/,
    index: true
  },
  entries: [workSheetEntrySchema],
  breaks: [workSheetBreakSchema],
  totalWorkHours: {
    type: Number,
    default: 0
  },
  totalBreakHours: {
    type: Number,
    default: 0
  },
  effectiveWorkHours: {
    type: Number,
    default: 0
  },
  productivityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  taskSummary: {
    completed: { type: Number, default: 0 },
    inProgress: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  checkInTime: String,
  checkOutTime: String,
  isSubmitted: {
    type: Boolean,
    default: false
  },
  submittedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient queries
workSheetSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Pre-save middleware to calculate durations and productivity
workSheetSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate entry durations
  this.entries.forEach(entry => {
    const startTime = this.parseTime(entry.from);
    const endTime = this.parseTime(entry.to);
    entry.duration = endTime - startTime;
  });
  
  // Calculate break durations
  this.breaks.forEach(breakEntry => {
    const startTime = this.parseTime(breakEntry.start);
    const endTime = this.parseTime(breakEntry.end);
    breakEntry.duration = endTime - startTime;
  });
  
  // Calculate totals
  this.totalWorkHours = this.entries.reduce((total, entry) => total + entry.duration, 0) / 60;
  this.totalBreakHours = this.breaks.reduce((total, breakEntry) => total + breakEntry.duration, 0) / 60;
  this.effectiveWorkHours = Math.max(0, this.totalWorkHours - this.totalBreakHours);
  
  // Calculate task summary
  this.taskSummary.completed = this.entries.filter(e => e.status === 'Completed').length;
  this.taskSummary.inProgress = this.entries.filter(e => e.status === 'In Progress').length;
  this.taskSummary.pending = this.entries.filter(e => e.status === 'Pending').length;
  this.taskSummary.total = this.entries.length;
  
  // Calculate productivity score
  this.productivityScore = this.calculateProductivityScore();
  
  next();
});

// Helper method to parse time string to minutes
workSheetSchema.methods.parseTime = function(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Method to calculate productivity score
workSheetSchema.methods.calculateProductivityScore = function() {
  if (this.entries.length === 0) return 0;
  
  const completedWeight = 1.0;
  const inProgressWeight = 0.7;
  const pendingWeight = 0.3;
  
  const weightedScore = (
    this.taskSummary.completed * completedWeight +
    this.taskSummary.inProgress * inProgressWeight +
    this.taskSummary.pending * pendingWeight
  ) / this.taskSummary.total;
  
  // Factor in effective work hours vs total logged hours
  const timeEfficiency = this.totalWorkHours > 0 ? 
    Math.min(this.effectiveWorkHours / this.totalWorkHours, 1) : 0;
  
  return Math.round(weightedScore * timeEfficiency * 100);
};

// Static method to get productivity summary for date range
workSheetSchema.statics.getProductivitySummary = async function(employeeId, startDate, endDate) {
  const sheets = await this.find({
    employeeId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
  
  const summary = {
    totalDays: sheets.length,
    averageProductivity: 0,
    totalTasksCompleted: 0,
    totalWorkHours: 0,
    totalBreakHours: 0,
    dailyBreakdown: []
  };
  
  if (sheets.length > 0) {
    summary.averageProductivity = sheets.reduce((sum, sheet) => sum + sheet.productivityScore, 0) / sheets.length;
    summary.totalTasksCompleted = sheets.reduce((sum, sheet) => sum + sheet.taskSummary.completed, 0);
    summary.totalWorkHours = sheets.reduce((sum, sheet) => sum + sheet.totalWorkHours, 0);
    summary.totalBreakHours = sheets.reduce((sum, sheet) => sum + sheet.totalBreakHours, 0);
    
    summary.dailyBreakdown = sheets.map(sheet => ({
      date: sheet.date,
      productivity: sheet.productivityScore,
      tasksCompleted: sheet.taskSummary.completed,
      workHours: sheet.totalWorkHours,
      breakHours: sheet.totalBreakHours
    }));
  }
  
  return summary;
};

// Static method to generate hourly slots based on check-in/check-out times
workSheetSchema.statics.generateHourlySlots = function(checkInTime, checkOutTime) {
  const slots = [];
  const startHour = parseInt(checkInTime.split(':')[0]);
  const endHour = parseInt(checkOutTime.split(':')[0]);
  
  for (let hour = startHour; hour < endHour; hour++) {
    const nextHour = hour + 1;
    slots.push({
      from: `${hour.toString().padStart(2, '0')}:00`,
      to: `${nextHour.toString().padStart(2, '0')}:00`,
      task: '',
      project: '',
      status: 'Pending',
      duration: 60
    });
  }
  
  return slots;
};

export default mongoose.model('WorkSheet', workSheetSchema);
