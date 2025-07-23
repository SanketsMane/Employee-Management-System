import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxLength: [50, 'Full name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in query results by default
  },
  role: {
    type: String,
    enum: ['employee', 'admin'],
    default: 'employee'
  },
  profilePicture: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    maxLength: [500, 'Bio cannot exceed 500 characters']
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  address: {
    type: String,
    default: '',
    maxLength: [200, 'Address cannot exceed 200 characters']
  },
  emergencyContact: {
    name: {
      type: String,
      default: '',
      maxLength: [50, 'Emergency contact name cannot exceed 50 characters']
    },
    phone: {
      type: String,
      default: ''
    },
    relationship: {
      type: String,
      default: '',
      maxLength: [30, 'Relationship cannot exceed 30 characters']
    }
  },
  dateOfJoining: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  refreshToken: {
    type: String,
    select: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  return userObject;
};

export default mongoose.model('User', userSchema);
