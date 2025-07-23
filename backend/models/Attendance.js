import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: () => {
      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }
  },
  checkIn: {
    type: Date,
    default: null
  },
  checkOut: {
    type: Date,
    default: null
  },
  breaks: [{
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      default: null
    }
  }],
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'work-from-home', 'holiday'],
    default: 'absent'
  },
  isLate: {
    type: Boolean,
    default: false
  },
  isHalfDay: {
    type: Boolean,
    default: false
  },
  workingHours: {
    type: Number,
    default: 0
  },
  breakHours: {
    type: Number,
    default: 0
  },
  totalBreakTime: {
    type: Number,
    default: 0 // in minutes
  },
  productivityScore: {
    type: Number,
    default: 0
  },
  location: {
    checkIn: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    checkOut: {
      latitude: Number,
      longitude: Number,
      address: String
    }
  },
  notes: {
    type: String,
    maxLength: [500, 'Notes cannot exceed 500 characters']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per user per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

// Calculate working hours, break hours, and productivity before saving
attendanceSchema.pre('save', function(next) {
  // Calculate break hours
  let totalBreakMinutes = 0;
  this.breaks.forEach(breakSession => {
    if (breakSession.start && breakSession.end) {
      const breakDuration = breakSession.end.getTime() - breakSession.start.getTime();
      totalBreakMinutes += Math.floor(breakDuration / (1000 * 60));
    }
  });
  this.breakHours = totalBreakMinutes;

  // Calculate working hours and determine status
  if (this.checkIn && this.checkOut) {
    const totalMinutes = Math.floor((this.checkOut.getTime() - this.checkIn.getTime()) / (1000 * 60));
    this.workingHours = totalMinutes - totalBreakMinutes;
    
    // Calculate productivity score (assuming 8 hours = 480 minutes is standard work day)
    const standardWorkMinutes = 480;
    this.productivityScore = Math.min(100, Math.max(0, (this.workingHours / standardWorkMinutes) * 100));
  }
  
  // Determine status based on check-in time (regardless of check-out status)
  if (this.checkIn) {
    const checkInHour = this.checkIn.getHours();
    const checkInMinute = this.checkIn.getMinutes();
    
    if (checkInHour > 9 || (checkInHour === 9 && checkInMinute > 15)) {
      this.status = 'late';
    } else {
      this.status = 'present';
    }
  }
  
  next();
});

export default mongoose.model('Attendance', attendanceSchema);
