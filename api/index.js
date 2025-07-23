// Vercel serverless function entry point
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from '../routes/auth.js';
import userRoutes from '../routes/users.js';
import taskRoutes from '../routes/tasks.js';
import attendanceRoutes from '../routes/attendance.js';
import chatRoutes from '../routes/chat.js';
import notificationRoutes from '../routes/notifications.js';
import seedRoutes from '../routes/seed.js';
import adminRoutes from '../routes/admin.js';
import projectRoutes from '../routes/projects.js';
import projectTaskRoutes from '../routes/projectTasks.js';
import projectAnnouncementRoutes from '../routes/projectAnnouncements.js';
import leaveRoutes from '../routes/leaves.js';
import analyticsRoutes from '../routes/analytics.js';
import shiftSettingsRoutes from '../routes/shiftSettings.js';
import activitiesRoutes from '../routes/activities.js';
import employeeShiftsRoutes from '../routes/employeeShifts.js';
import worksheetRoutes from '../routes/worksheet.js';

const app = express();

// Security middleware - adjusted for Vercel
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting for Vercel
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration for Vercel
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
      process.env.FRONTEND_URL,
      'https://ems-formonex-app.vercel.app',
      /^https:\/\/.*\.vercel\.app$/, // Allow all Vercel preview deployments
      /^https:\/\/ems-formonex.*\.vercel\.app$/ // Your specific app
    ].filter(Boolean);
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      return callback(null, true);
    } else {
      console.log('CORS: Origin not allowed:', origin);
      return callback(null, true); // Allow all origins in production for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection with caching for serverless
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    if (process.env.MONGODB_URI) {
      const connection = await mongoose.connect(process.env.MONGODB_URI, {
        bufferCommands: false,
        bufferMaxEntries: 0,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      cachedConnection = connection;
      console.log('✅ Connected to MongoDB Atlas');
      return connection;
    } else {
      console.log('⚠️  No MongoDB URI provided');
      return null;
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return null;
  }
}

// Connect to database on startup
connectToDatabase();

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

// Create admin user endpoint (one-time setup)
app.post('/api/create-admin', async (req, res) => {
  try {
    // Import User model
    const User = (await import('../backend_old_unused/models/User.js')).default;
    
    // Ensure database connection
    await connectToDatabase();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@formonex.com' });
    if (existingAdmin) {
      return res.status(200).json({
        success: true,
        message: 'Admin user already exists',
        data: {
          user: {
            id: existingAdmin._id,
            email: existingAdmin.email,
            fullName: existingAdmin.fullName,
            role: existingAdmin.role,
            department: existingAdmin.department,
            position: existingAdmin.position
          }
        }
      });
    }

    // Create admin user
    const adminUser = new User({
      email: 'admin@formonex.com',
      password: 'Formo#Admin123',
      fullName: 'Formonex Admin',
      role: 'admin',
      department: 'Administration',
      position: 'System Administrator',
      isActive: true
    });

    await adminUser.save();

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully!',
      data: {
        user: {
          id: adminUser._id,
          email: adminUser.email,
          fullName: adminUser.fullName,
          role: adminUser.role,
          department: adminUser.department,
          position: adminUser.position
        }
      }
    });

  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'EMS Backend API is running on Vercel',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root endpoint for API
app.get('/api', (req, res) => {
  res.json({
    message: 'EMS-Formonex API',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/users',
      '/api/tasks',
      '/api/attendance',
      '/api/chat',
      '/api/notifications'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    message: 'API route not found',
    path: req.path
  });
});

// Export for Vercel
export default app;
