import express from 'express';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import auth from '../middleware/auth.js';

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

// Get all employees
router.get('/employees', auth, adminOnly, async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' })
      .select('fullName email department position isActive dateOfJoining')
      .sort({ fullName: 1 });

    // Get today's attendance for each employee
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const employeesWithStats = await Promise.all(employees.map(async (employee) => {
      // Get today's attendance
      const todayAttendance = await Attendance.findOne({
        user: employee._id,
        date: {
          $gte: todayStart,
          $lt: todayEnd
        }
      });
      
      // Get monthly average productivity
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthlyAttendance = await Attendance.find({
        user: employee._id,
        date: { $gte: startOfMonth }
      });
      
      const averageProductivity = monthlyAttendance.length > 0 
        ? monthlyAttendance.reduce((sum, att) => sum + (att.productivityScore || 0), 0) / monthlyAttendance.length 
        : 0;
      
      return {
        ...employee.toObject(),
        todayStatus: todayAttendance ? todayAttendance.status : 'absent',
        averageProductivity: Math.round(averageProductivity)
      };
    }));

    res.json({
      success: true,
      data: employeesWithStats
    });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get employees',
      error: error.message
    });
  }
});

// Get specific employee logs
router.get('/employee/:id/logs', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Default to last 30 days if no date range provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const logs = await Attendance.find({
      user: id,
      date: {
        $gte: start,
        $lte: end
      }
    }).sort({ date: -1 });

    // Calculate productivity stats
    const stats = {
      totalDays: logs.length,
      presentDays: logs.filter(log => log.status === 'present').length,
      lateDays: logs.filter(log => log.status === 'late').length,
      averageWorkingHours: logs.length > 0 ? logs.reduce((sum, log) => sum + (log.workingHours || 0), 0) / logs.length : 0,
      averageBreakHours: logs.length > 0 ? logs.reduce((sum, log) => sum + (log.breakHours || 0), 0) / logs.length : 0,
      averageProductivity: logs.length > 0 ? logs.reduce((sum, log) => sum + (log.productivityScore || 0), 0) / logs.length : 0
    };

    res.json({
      success: true,
      logs: logs,
      stats: stats
    });

  } catch (error) {
    console.error('Get employee logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get employee logs',
      error: error.message
    });
  }
});

// Delete employee
router.delete('/employee/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if employee exists
    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Prevent deletion of admin users
    if (employee.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Delete associated attendance records
    await Attendance.deleteMany({ user: id });

    // Delete the employee
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });

  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message
    });
  }
});

// Update admin profile
router.patch('/profile', auth, adminOnly, async (req, res) => {
  try {
    const { fullName, email, phoneNumber, department, position } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (department) user.department = department;
    if (position) user.position = position;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        department: user.department,
        position: user.position,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Get admin dashboard stats
router.get('/dashboard', auth, adminOnly, async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Get total employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    
    // Get today's attendance
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const todayAttendance = await Attendance.find({
      date: {
        $gte: todayStart,
        $lt: todayEnd
      }
    }).populate('user', 'fullName email');
    
    // Calculate today's stats
    const presentToday = todayAttendance.filter(att => att.checkIn).length;
    const lateToday = todayAttendance.filter(att => att.status === 'late').length;
    const absentToday = totalEmployees - presentToday;
    
    // Get weekly attendance data for chart
    const weeklyAttendance = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      
      const dayStart = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate());
      const dayEnd = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate() + 1);
      
      const dayAttendance = await Attendance.find({
        date: {
          $gte: dayStart,
          $lt: dayEnd
        }
      });
      
      weeklyAttendance.push({
        day: dayNames[i].substring(0, 3), // Mon, Tue, etc.
        present: dayAttendance.filter(att => att.status === 'present').length,
        late: dayAttendance.filter(att => att.status === 'late').length,
        absent: totalEmployees - dayAttendance.filter(att => att.checkIn).length
      });
    }
    
    // Get monthly stats for productivity
    const monthlyAttendance = await Attendance.find({
      date: { $gte: startOfMonth }
    }).populate('user', 'fullName');
    
    const averageProductivity = monthlyAttendance.length > 0 
      ? monthlyAttendance.reduce((sum, att) => sum + (att.productivityScore || 0), 0) / monthlyAttendance.length 
      : 0;
    
    // Get top performers (employees with highest average productivity)
    const employeeProductivity = {};
    monthlyAttendance.forEach(att => {
      if (att.user && att.user.fullName) {
        const userId = att.user._id.toString();
        if (!employeeProductivity[userId]) {
          employeeProductivity[userId] = {
            name: att.user.fullName,
            totalProductivity: 0,
            count: 0
          };
        }
        employeeProductivity[userId].totalProductivity += att.productivityScore || 0;
        employeeProductivity[userId].count += 1;
      }
    });
    
    const topPerformers = Object.values(employeeProductivity)
      .map(emp => ({
        name: emp.name,
        averageProductivity: emp.count > 0 ? emp.totalProductivity / emp.count : 0
      }))
      .sort((a, b) => b.averageProductivity - a.averageProductivity)
      .slice(0, 10); // Top 10 performers

    res.json({
      success: true,
      data: {
        totalEmployees,
        averageProductivity: Math.round(averageProductivity),
        todayStats: {
          present: presentToday,
          late: lateToday,
          absent: absentToday,
          workFromHome: 0 // Can be enhanced later
        },
        weeklyAttendance,
        topPerformers,
        todayAttendance,
        recentActivity: monthlyAttendance.slice(-10) // Last 10 activities
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin dashboard data',
      error: error.message
    });
  }
});

export default router;
