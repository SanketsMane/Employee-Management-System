import mongoose from 'mongoose';

const shiftSettingsSchema = new mongoose.Schema({
  organization: {
    type: String,
    default: 'default',
    unique: true
  },
  shiftStart: {
    type: String,
    default: '09:00', // 9:00 AM
    required: true
  },
  shiftEnd: {
    type: String,
    default: '18:00', // 6:00 PM
    required: true
  },
  lateThreshold: {
    type: Number,
    default: 30, // 30 minutes after shift start
    required: true
  },
  halfDayThreshold: {
    type: Number,
    default: 4, // 4 hours before shift end
    required: true
  },
  breakDuration: {
    type: Number,
    default: 60, // 60 minutes total break allowed
    required: true
  },
  workingDays: {
    type: [Number],
    default: [1, 2, 3, 4, 5], // Monday to Friday (0 = Sunday, 1 = Monday, etc.)
    required: true
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default mongoose.model('ShiftSettings', shiftSettingsSchema);
