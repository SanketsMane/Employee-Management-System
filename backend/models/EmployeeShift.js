import mongoose from 'mongoose';

const employeeShiftSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  startTime: {
    type: String,
    required: true,
    default: '09:00'
  },
  endTime: {
    type: String,
    required: true,
    default: '18:00'
  },
  lateThresholdMinutes: {
    type: Number,
    default: 30
  },
  halfDayThresholdHours: {
    type: Number,
    default: 4
  },
  workingDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  }],
  breakDurationMinutes: {
    type: Number,
    default: 60
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
employeeShiftSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to get effective shift settings (employee-specific or default)
employeeShiftSchema.statics.getEffectiveShiftSettings = async function(employeeId) {
  try {
    // Try to get employee-specific settings first
    const employeeShift = await this.findOne({ employeeId });
    if (employeeShift) {
      return employeeShift;
    }
    
    // If no employee-specific settings, get default from ShiftSettings
    const { default: ShiftSettings } = await import('./ShiftSettings.js');
    const defaultSettings = await ShiftSettings.findOne();
    
    return defaultSettings || {
      startTime: '09:00',
      endTime: '18:00',
      lateThresholdMinutes: 30,
      halfDayThresholdHours: 4,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      breakDurationMinutes: 60
    };
  } catch (error) {
    console.error('Error getting effective shift settings:', error);
    // Return default settings if there's an error
    return {
      startTime: '09:00',
      endTime: '18:00',
      lateThresholdMinutes: 30,
      halfDayThresholdHours: 4,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      breakDurationMinutes: 60
    };
  }
};

export default mongoose.model('EmployeeShift', employeeShiftSchema);
