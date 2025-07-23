// Load environment variables first
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import attendanceRoutes from './routes/attendance.js';
import chatRoutes from './routes/chat.js';
import notificationRoutes from './routes/notifications.js';
import seedRoutes from './routes/seed.js';
import adminRoutes from './routes/admin.js';
import projectRoutes from './routes/projects.js';
import projectTaskRoutes from './routes/projectTasks.js';
import projectAnnouncementRoutes from './routes/projectAnnouncements.js';
import leaveRoutes from './routes/leaves.js';
import analyticsRoutes from './routes/analytics.js';
import shiftSettingsRoutes from './routes/shiftSettings.js';
import activitiesRoutes from './routes/activities.js';
import employeeShiftsRoutes from './routes/employeeShifts.js';
import worksheetRoutes from './routes/worksheet.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

// Security middleware
app.use(helmet());

// Rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increase limit for development
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('CORS: Origin not allowed:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Add explicit OPTIONS handler for all routes
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Connect to MongoDB with graceful error handling
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB Atlas');
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error.message);
      console.log('🔄 Server will continue running without MongoDB connection');
      console.log('💡 Frontend will use localStorage for data persistence');
    });
} else {
  console.log('⚠️  No MongoDB URI provided, running without database connection');
  console.log('💡 Frontend will use localStorage for data persistence');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/project-tasks', projectTaskRoutes);
app.use('/api/project-announcements', projectAnnouncementRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/shift', shiftSettingsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/admin/employee', employeeShiftsRoutes);
app.use('/api/worksheet', worksheetRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'EMS Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
});
