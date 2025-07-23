import express from 'express';
import ActivityLog from '../backend_old_unused/models/ActivityLog.js';
import User from '../backend_old_unused/models/User.js';
import Project from '../backend_old_unused/models/Project.js';
import ProjectTask from '../backend_old_unused/models/ProjectTask.js';
import Attendance from '../backend_old_unused/models/Attendance.js';
import Leave from '../backend_old_unused/models/Leave.js';
import auth from '../backend_old_unused/middleware/auth.js';

const router = express.Router();

// Middleware to check admin role
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Activity Monitor Routes

// Get recent activities with pagination and filters
router.get('/activities', auth, adminOnly, async (req, res) => {
  try {
    const { 
      type, 
      status, 
      search, 
      limit = 50, 
      page = 1,
      startDate,
      endDate 
    } = req.query;

    const query = {};
    
    // Add filters
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    let activities = await ActivityLog.find(query)
      .populate('user', 'fullName email department position')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Filter by search query if provided
    if (search) {
      activities = activities.filter(activity => 
        activity.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        activity.action?.toLowerCase().includes(search.toLowerCase()) ||
        activity.details?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await ActivityLog.countDocuments(query);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: activities.length,
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activities',
      error: error.message
    });
  }
});

// Get currently active users
router.get('/active-users', auth, adminOnly, async (req, res) => {
  try {
    // Get users who have logged in within the last 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const recentLogins = await ActivityLog.find({
      type: 'login',
      status: 'success',
      createdAt: { $gte: thirtyMinutesAgo }
    })
    .populate('user', 'fullName email department position')
    .sort({ createdAt: -1 });

    // Get unique users and their last activity
    const activeUsersMap = new Map();
    
    for (const login of recentLogins) {
      if (login.user && !activeUsersMap.has(login.user._id.toString())) {
        // Check if user has logged out since this login
        const logoutAfter = await ActivityLog.findOne({
          user: login.user._id,
          type: 'logout',
          createdAt: { $gt: login.createdAt }
        });

        if (!logoutAfter) {
          // Get user's most recent activity
          const lastActivity = await ActivityLog.findOne({
            user: login.user._id,
            createdAt: { $gte: login.createdAt }
          }).sort({ createdAt: -1 });

          activeUsersMap.set(login.user._id.toString(), {
            id: login.user._id,
            name: login.user.fullName,
            email: login.user.email,
            department: login.user.department,
            lastActive: lastActivity ? lastActivity.createdAt : login.createdAt,
            status: getActiveStatus(lastActivity ? lastActivity.createdAt : login.createdAt),
            currentActivity: lastActivity ? lastActivity.action : 'Dashboard'
          });
        }
      }
    }

    const activeUsers = Array.from(activeUsersMap.values());

    res.json({
      success: true,
      data: activeUsers
    });

  } catch (error) {
    console.error('Get active users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active users',
      error: error.message
    });
  }
});

// Get system statistics
router.get('/system-stats', auth, adminOnly, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get counts
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalProjects = await Project.countDocuments({ isActive: true });
    const totalTasks = await ProjectTask.countDocuments({ isActive: true });
    
    // Today's activities
    const todayLogins = await ActivityLog.countDocuments({
      type: 'login',
      status: 'success',
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayFailedLogins = await ActivityLog.countDocuments({
      type: 'login',
      status: 'error',
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Active users (last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentActivities = await ActivityLog.distinct('user', {
      createdAt: { $gte: thirtyMinutesAgo }
    });

    // Get task completion stats
    const completedTasks = await ProjectTask.countDocuments({
      status: 'completed',
      isActive: true
    });

    // Get attendance stats for today
    const todayAttendance = await Attendance.countDocuments({
      checkInTime: { $gte: today, $lt: tomorrow }
    });

    // Get leave requests pending
    const pendingLeaves = await Leave.countDocuments({
      status: 'pending',
      isActive: true
    });

    const stats = {
      totalUsers,
      activeUsers: recentActivities.length,
      totalProjects,
      activeSessions: recentActivities.length,
      todayLogins,
      failedLogins: todayFailedLogins,
      totalTasks,
      completedTasks,
      taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0,
      todayAttendance,
      attendanceRate: totalUsers > 0 ? (todayAttendance / totalUsers * 100).toFixed(1) : 0,
      pendingLeaves,
      systemUptime: process.uptime(),
      serverLoad: process.memoryUsage(),
      timestamp: new Date()
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system statistics',
      error: error.message
    });
  }
});

// Reports Routes

// Get attendance reports
router.get('/reports/attendance', auth, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Get all users (optionally filtered by department)
    const userQuery = { role: { $ne: 'admin' } };
    if (department && department !== 'all') {
      userQuery.department = department;
    }
    const users = await User.find(userQuery);
    const totalEmployees = users.length;

    // Get attendance data grouped by date
    const attendanceData = await Attendance.aggregate([
      {
        $match: {
          checkInTime: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$checkInTime" }
          },
          present: { $sum: 1 },
          uniqueUsers: { $addToSet: "$user" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Calculate daily attendance statistics
    const dailyStats = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split('T')[0];
      const dayData = attendanceData.find(item => item._id === dateString);
      
      const present = dayData ? dayData.present : 0;
      const absent = totalEmployees - present;
      
      // Calculate late arrivals (assuming 9 AM is standard time)
      const lateCount = dayData ? await Attendance.countDocuments({
        checkInTime: {
          $gte: new Date(`${dateString}T09:00:00.000Z`),
          $lte: new Date(`${dateString}T23:59:59.999Z`)
        }
      }) : 0;

      dailyStats.push({
        date: dateString,
        present,
        absent,
        late: lateCount,
        total: totalEmployees,
        attendanceRate: totalEmployees > 0 ? (present / totalEmployees * 100).toFixed(1) : 0
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      success: true,
      data: dailyStats
    });

  } catch (error) {
    console.error('Get attendance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance report',
      error: error.message
    });
  }
});

// Get task reports
router.get('/reports/tasks', auth, adminOnly, async (req, res) => {
  try {
    const { department } = req.query;

    // Get task statistics by department
    const pipeline = [
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectInfo'
        }
      },
      {
        $unwind: '$projectInfo'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedUser'
        }
      },
      {
        $unwind: '$assignedUser'
      }
    ];

    if (department && department !== 'all') {
      pipeline.push({
        $match: { 'assignedUser.department': department }
      });
    }

    pipeline.push({
      $group: {
        _id: '$assignedUser.department',
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
        },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$status', 'completed'] },
                  { $lt: ['$dueDate', new Date()] }
                ]
              },
              1,
              0
            ]
          }
        },
        total: { $sum: 1 }
      }
    });

    const taskStats = await ProjectTask.aggregate(pipeline);

    // If no specific department, add departments that might not have tasks
    if (!department || department === 'all') {
      const departments = await User.distinct('department', { role: { $ne: 'admin' } });
      const existingDepts = taskStats.map(stat => stat._id);
      
      for (const dept of departments) {
        if (!existingDepts.includes(dept)) {
          taskStats.push({
            _id: dept,
            completed: 0,
            pending: 0,
            inProgress: 0,
            overdue: 0,
            total: 0
          });
        }
      }
    }

    const formattedStats = taskStats.map(stat => ({
      department: stat._id,
      completed: stat.completed,
      pending: stat.pending,
      inProgress: stat.inProgress,
      overdue: stat.overdue,
      total: stat.total,
      completionRate: stat.total > 0 ? (stat.completed / stat.total * 100).toFixed(1) : 0
    }));

    res.json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('Get task report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get task report',
      error: error.message
    });
  }
});

// Get employee performance reports
router.get('/reports/employees', auth, adminOnly, async (req, res) => {
  try {
    const { department, limit = 50 } = req.query;

    const userQuery = { role: { $ne: 'admin' } };
    if (department && department !== 'all') {
      userQuery.department = department;
    }

    const users = await User.find(userQuery).limit(parseInt(limit));

    const employeeStats = await Promise.all(users.map(async (user) => {
      // Get task completion stats
      const taskStats = await ProjectTask.aggregate([
        { $match: { assignedTo: user._id, isActive: true } },
        {
          $group: {
            _id: null,
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            total: { $sum: 1 }
          }
        }
      ]);

      // Get attendance rate (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const workingDays = 22; // Approximate working days in a month
      const attendanceCount = await Attendance.countDocuments({
        user: user._id,
        checkInTime: { $gte: thirtyDaysAgo }
      });

      // Get total activity hours (approximate from activity logs)
      const activities = await ActivityLog.countDocuments({
        user: user._id,
        createdAt: { $gte: thirtyDaysAgo }
      });

      const tasks = taskStats[0] || { completed: 0, total: 0 };

      return {
        id: user._id,
        name: user.fullName,
        email: user.email,
        department: user.department,
        position: user.position,
        tasksCompleted: tasks.completed,
        totalTasks: tasks.total,
        taskCompletionRate: tasks.total > 0 ? (tasks.completed / tasks.total * 100).toFixed(1) : 0,
        attendance: workingDays > 0 ? (attendanceCount / workingDays * 100).toFixed(1) : 0,
        activityScore: Math.min(activities * 2, 100), // Simple activity score
        lastActive: user.lastLoginAt || user.createdAt
      };
    }));

    res.json({
      success: true,
      data: employeeStats
    });

  } catch (error) {
    console.error('Get employee report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get employee report',
      error: error.message
    });
  }
});

// Get leave reports
router.get('/reports/leaves', auth, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const pipeline = [
      {
        $match: {
          startDate: { $gte: start, $lte: end },
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeInfo'
        }
      },
      {
        $unwind: '$employeeInfo'
      }
    ];

    if (department && department !== 'all') {
      pipeline.push({
        $match: { 'employeeInfo.department': department }
      });
    }

    pipeline.push({
      $group: {
        _id: '$leaveType',
        count: { $sum: 1 },
        totalDays: { $sum: '$totalDays' },
        approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
      }
    });

    const leaveStats = await Leave.aggregate(pipeline);

    const formattedStats = leaveStats.map(stat => ({
      leaveType: stat._id,
      totalRequests: stat.count,
      totalDays: stat.totalDays,
      approved: stat.approved,
      pending: stat.pending,
      rejected: stat.rejected,
      approvalRate: stat.count > 0 ? (stat.approved / stat.count * 100).toFixed(1) : 0
    }));

    res.json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('Get leave report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leave report',
      error: error.message
    });
  }
});

// Get overall dashboard statistics
router.get('/reports/overview', auth, adminOnly, async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: { $ne: 'admin' } });
    const activeProjects = await Project.countDocuments({ status: 'active', isActive: true });
    
    // Calculate overall completion rate
    const totalTasks = await ProjectTask.countDocuments({ isActive: true });
    const completedTasks = await ProjectTask.countDocuments({ status: 'completed', isActive: true });
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;
    
    // Calculate average attendance (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const workingDays = 22; // Approximate
    const totalAttendance = await Attendance.countDocuments({
      checkInTime: { $gte: thirtyDaysAgo }
    });
    const avgAttendance = totalEmployees > 0 && workingDays > 0 ? 
      (totalAttendance / (totalEmployees * workingDays) * 100).toFixed(1) : 0;

    // Get pending items count
    const pendingTasks = await ProjectTask.countDocuments({ status: 'pending', isActive: true });
    const pendingLeaves = await Leave.countDocuments({ status: 'pending', isActive: true });

    const overview = {
      totalEmployees,
      activeProjects,
      completionRate: parseFloat(completionRate),
      avgAttendance: parseFloat(avgAttendance),
      pendingTasks,
      pendingLeaves,
      totalTasks,
      completedTasks
    };

    res.json({
      success: true,
      data: overview
    });

  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get overview statistics',
      error: error.message
    });
  }
});

// Helper function to determine user active status
function getActiveStatus(lastActive) {
  const now = new Date();
  const diffMinutes = (now - lastActive) / (1000 * 60);
  
  if (diffMinutes <= 5) return 'online';
  if (diffMinutes <= 15) return 'idle';
  return 'away';
}

export default router;
