
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const bcrypt = require('bcryptjs');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [
    'https://ems-formonex-app.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
}

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create admin user
    await createAdminUser();
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    isConnected = false;
    throw error;
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  department: String,
  position: String,
  isActive: { type: Boolean, default: true },
  preferences: { type: Map, of: mongoose.Schema.Types.Mixed, default: new Map() },
  lastLogin: Date
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Create admin user
const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@formonex.com' });
    if (!adminExists) {
      const adminUser = new User({
        name: 'Formonex Admin',
        email: 'admin@formonex.com',
        password: 'Formo#Admin123', // Will be hashed by pre-save middleware
        role: 'admin',
        department: 'Administration',
        position: 'System Administrator',
        preferences: new Map([
          ['theme', 'dark'],
          ['formonex-splash-seen', true]
        ])
      });

      await adminUser.save();
      console.log('✅ Admin user created');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Auth routes
const jwt = require('jsonwebtoken');

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// User preferences endpoints
app.get('/api/users/preferences', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const preferences = {};
    for (let [key, value] of user.preferences) {
      preferences[key] = value;
    }

    res.json({ success: true, data: preferences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/users/preferences/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const value = user.preferences.get(key);
    res.json({ success: true, data: value });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/users/preferences', async (req, res) => {
  try {
    const { key, value } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.preferences.set(key, value);
    await user.save();

    res.json({ success: true, message: 'Preference updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.json({ 
      success: true, 
      message: 'API is healthy',
      database: isConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Health check failed',
      error: error.message 
    });
  }
});

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'EMS Formonex API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

module.exports = app;