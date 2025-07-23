import express from 'express';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Attendance from '../models/Attendance.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get current user's dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Get user tasks
    const tasks = await Task.find({ 
      assignedTo: { $in: [userId] }
    }).populate('assignedBy', 'fullName email');

    // Get attendance for current month
    const attendance = await Attendance.find({
      user: userId,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });

    // Calculate stats
    const totalDaysInMonth = endOfMonth.getDate();
    const presentDays = attendance.filter(att => att.status === 'present' || att.status === 'late').length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    
    // Calculate learning progress (placeholder - you can implement based on your learning system)
    const learningProgress = 85; // This should come from actual learning data

    const dashboardData = {
      stats: {
        attendance: {
          present: presentDays,
          total: totalDaysInMonth,
          percentage: Math.round((presentDays / totalDaysInMonth) * 100)
        },
        tasks: {
          completed: completedTasks,
          total: tasks.length,
          pending: tasks.filter(task => task.status === 'pending').length,
          inProgress: tasks.filter(task => task.status === 'in-progress').length
        },
        learning: {
          progress: learningProgress
        }
      },
      recentTasks: tasks.slice(0, 5), // Last 5 tasks
      recentAttendance: attendance.slice(-7) // Last 7 days
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// Get user's tasks
router.get('/tasks', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const tasks = await Task.find({ 
      assignedTo: { $in: [userId] }
    }).populate('assignedBy', 'fullName email').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Tasks fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
});

// Get user's attendance
router.get('/attendance', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month, year } = req.query;
    
    let startDate, endDate;
    if (month && year) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    } else {
      const today = new Date();
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    const attendance = await Attendance.find({
      user: userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: -1 });

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Attendance fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance',
      error: error.message
    });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const allowedUpdates = [
      'fullName', 'phone', 'location', 'bio', 'dateOfBirth', 
      'address', 'emergencyContact'
    ];
    
    // Filter only allowed updates
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Validate required fields
    if (updates.fullName && updates.fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 2 characters long'
      });
    }

    // Validate phone format if provided
    if (updates.phone && updates.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(updates.phone.replace(/[\s\-\(\)]/g, ''))) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid phone number'
        });
      }
    }

    // Validate date of birth if provided
    if (updates.dateOfBirth) {
      const dob = new Date(updates.dateOfBirth);
      const now = new Date();
      if (dob > now) {
        return res.status(400).json({
          success: false,
          message: 'Date of birth cannot be in the future'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Placeholder routes - implement as needed
router.get('/', (req, res) => {
  res.json({ message: 'Users routes - Available endpoints: /dashboard, /tasks, /attendance, /profile' });
});

export default router;
