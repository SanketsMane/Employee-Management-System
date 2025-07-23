import express from 'express';
import WorkSheet from '../backend_old_unused/models/WorkSheet.js';
import Attendance from '../backend_old_unused/models/Attendance.js';
import User from '../backend_old_unused/models/User.js';
import auth from '../backend_old_unused/middleware/auth.js';
import adminAuth from '../backend_old_unused/middleware/adminAuth.js';
import { logActivity } from '../backend_old_unused/utils/activityLogger.js';

const router = express.Router();

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Validate if date is today
const isToday = (date) => {
  return date === getTodayDate();
};

// Parse time string to minutes from midnight
const parseTimeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Get or create worksheet for today
router.get('/today', auth, async (req, res) => {
  try {
    const employeeId = req.user.userId; // Changed from req.user.id to req.user.userId
    const today = getTodayDate();
    
    console.log('DEBUG: Worksheet request - employeeId:', employeeId, 'today:', today);
    
    let worksheet = await WorkSheet.findOne({ employeeId, date: today });
    
    if (!worksheet) {
      // Get today's attendance - use simpler approach
      console.log('DEBUG: Looking for attendance with user:', employeeId, 'today:', today);
      
      // Create start and end of today in local timezone
      const todayDate = new Date(today + 'T00:00:00+05:30'); // IST timezone
      const tomorrowDate = new Date(today + 'T23:59:59+05:30'); // IST timezone
      
      console.log('DEBUG: Date range - start:', todayDate, 'end:', tomorrowDate);
      
      const attendance = await Attendance.findOne({
        user: employeeId,
        checkIn: { $exists: true, $ne: null }
      }).sort({ date: -1 });
      
      console.log('DEBUG: Found most recent attendance:', attendance ? {
        id: attendance._id,
        user: attendance.user,
        date: attendance.date,
        checkIn: attendance.checkIn,
        status: attendance.status
      } : 'null');
      
      if (!attendance || !attendance.checkIn) {
        console.log('DEBUG: No attendance or checkIn found, returning error');
        return res.status(404).json({
          success: false,
          message: 'Please check in first to access your worksheet'
        });
      }
      
      const checkInTime = new Date(attendance.checkIn).toTimeString().slice(0, 5);
      const checkOutTime = attendance.checkOut ? 
        new Date(attendance.checkOut).toTimeString().slice(0, 5) : 
        '18:00'; // Default end time if not checked out yet
      
      // Generate hourly slots
      const entries = WorkSheet.generateHourlySlots(checkInTime, checkOutTime);
      
      worksheet = new WorkSheet({
        employeeId,
        date: today,
        entries,
        breaks: [],
        checkInTime,
        checkOutTime: attendance.checkOut ? checkOutTime : null
      });
      
      await worksheet.save();
    }
    
    res.json({
      success: true,
      data: worksheet
    });
  } catch (error) {
    console.error('Error fetching today worksheet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch worksheet'
    });
  }
});

// Submit/Update worksheet entry
router.post('/submit', auth, async (req, res) => {
  try {
    const employeeId = req.user.userId; // Changed from req.user.id to req.user.userId
    const { date, entries, breaks } = req.body;
    
    // Only allow today's date
    if (!isToday(date)) {
      return res.status(400).json({
        success: false,
        message: 'You can only edit today\'s worksheet'
      });
    }
    
    // Validate entries
    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({
        success: false,
        message: 'Valid entries array is required'
      });
    }
    
    // Validate time formats and logical consistency
    for (const entry of entries) {
      if (!entry.from || !entry.to || !entry.task || !entry.project) {
        return res.status(400).json({
          success: false,
          message: 'All entry fields (from, to, task, project) are required'
        });
      }
      
      const fromMinutes = parseTimeToMinutes(entry.from);
      const toMinutes = parseTimeToMinutes(entry.to);
      
      if (fromMinutes >= toMinutes) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time for all entries'
        });
      }
    }
    
    // Validate breaks if provided
    if (breaks && Array.isArray(breaks)) {
      for (const breakEntry of breaks) {
        if (!breakEntry.start || !breakEntry.end || !breakEntry.reason) {
          return res.status(400).json({
            success: false,
            message: 'All break fields (start, end, reason) are required'
          });
        }
        
        const startMinutes = parseTimeToMinutes(breakEntry.start);
        const endMinutes = parseTimeToMinutes(breakEntry.end);
        
        if (startMinutes >= endMinutes) {
          return res.status(400).json({
            success: false,
            message: 'Break end time must be after start time'
          });
        }
      }
    }
    
    let worksheet = await WorkSheet.findOne({ employeeId, date });
    
    if (worksheet) {
      worksheet.entries = entries;
      worksheet.breaks = breaks || [];
      worksheet.isSubmitted = true;
      worksheet.submittedAt = new Date();
    } else {
      worksheet = new WorkSheet({
        employeeId,
        date,
        entries,
        breaks: breaks || [],
        isSubmitted: true,
        submittedAt: new Date()
      });
    }
    
    await worksheet.save();
    
    // Log activity
    await logActivity(employeeId, 'worksheet_submission', `Submitted worksheet for ${date}`);
    
    res.json({
      success: true,
      message: 'Worksheet submitted successfully',
      data: worksheet
    });
  } catch (error) {
    console.error('Error submitting worksheet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit worksheet'
    });
  }
});

// Get all employees' worksheets for today (Admin only)
router.get('/admin/today-overview', auth, adminAuth, async (req, res) => {
  try {
    console.log('Admin today-overview request received');
    const today = getTodayDate();
    console.log('Today date:', today);
    
    const worksheets = await WorkSheet.find({ date: today })
      .populate('employeeId', 'fullName email department position')
      .sort({ updatedAt: -1 });
    
    console.log('Found worksheets:', worksheets.length);
    
    const overview = worksheets.map(worksheet => ({
      employee: worksheet.employeeId,
      date: worksheet.date,
      productivityScore: worksheet.productivityScore,
      taskSummary: worksheet.taskSummary,
      totalWorkHours: worksheet.totalWorkHours,
      isSubmitted: worksheet.isSubmitted,
      submittedAt: worksheet.submittedAt,
      updatedAt: worksheet.updatedAt
    }));
    
    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s overview',
      error: error.message
    });
  }
});

// Get team productivity comparison (Admin only)
router.get('/admin/team-comparison', auth, adminAuth, async (req, res) => {
  try {
    console.log('Admin team-comparison request received');
    const { range = 'weekly' } = req.query;
    console.log('Range parameter:', range);
    
    const today = new Date();
    console.log('Today:', today);
    
    let startDate, endDate;
    
    switch (range) {
      case 'weekly':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        startDate = weekStart.toISOString().split('T')[0];
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        endDate = weekEnd.toISOString().split('T')[0];
        break;
        
      case 'monthly':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
        
      default:
        const defaultStart = new Date(today);
        defaultStart.setDate(today.getDate() - 6);
        startDate = defaultStart.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
    }
    
    console.log('Date range:', { startDate, endDate });
    
    // Get all employees
    const employees = await User.find({ role: 'employee' }).select('_id fullName department');
    console.log('Found employees:', employees.length);
    
    const teamData = await Promise.all(
      employees.map(async (employee) => {
        console.log('Processing employee:', employee.fullName, 'ID:', employee._id);
        try {
          const summary = await WorkSheet.getProductivitySummary(employee._id, startDate, endDate);
          return {
            employee: {
              id: employee._id,
              name: employee.fullName,
              department: employee.department
            },
            ...summary
          };
        } catch (err) {
          console.error('Error processing employee', employee.fullName, ':', err.message);
          return {
            employee: {
              id: employee._id,
              name: employee.fullName,
              department: employee.department
            },
            error: err.message
          };
        }
      })
    );
    
    console.log('Team data processed successfully');
    
    res.json({
      success: true,
      data: {
        range,
        startDate,
        endDate,
        teamData
      }
    });
  } catch (error) {
    console.error('Error fetching team comparison:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team comparison',
      error: error.message
    });
  }
});

// Get worksheet by employee and date (Admin only)
router.get('/:employeeId/:date', auth, adminAuth, async (req, res) => {
  try {
    const { employeeId, date } = req.params;
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    const worksheet = await WorkSheet.findOne({ employeeId, date })
      .populate('employeeId', 'fullName email department position');
    
    if (!worksheet) {
      return res.status(404).json({
        success: false,
        message: 'Worksheet not found for the specified date'
      });
    }
    
    res.json({
      success: true,
      data: worksheet
    });
  } catch (error) {
    console.error('Error fetching worksheet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch worksheet'
    });
  }
});

// Get productivity score for specific date
router.get('/:employeeId/:date/productivity', auth, async (req, res) => {
  try {
    const { employeeId, date } = req.params;
    
    // Check if user is admin or requesting own data
    if (req.user.role !== 'admin' && req.user.userId !== employeeId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const worksheet = await WorkSheet.findOne({ employeeId, date });
    
    if (!worksheet) {
      return res.status(404).json({
        success: false,
        message: 'Worksheet not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        date,
        productivityScore: worksheet.productivityScore,
        taskSummary: worksheet.taskSummary,
        totalWorkHours: worksheet.totalWorkHours,
        totalBreakHours: worksheet.totalBreakHours,
        effectiveWorkHours: worksheet.effectiveWorkHours
      }
    });
  } catch (error) {
    console.error('Error fetching productivity score:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch productivity score'
    });
  }
});

// Get productivity summary for date range
router.get('/:employeeId/summary', auth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { range = 'weekly', startDate, endDate } = req.query;
    
    // Check if user is admin or requesting own data
    if (req.user.role !== 'admin' && req.user.userId !== employeeId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    let start, end;
    const today = new Date();
    
    if (startDate && endDate) {
      start = startDate;
      end = endDate;
    } else {
      // Calculate date range based on range parameter
      switch (range) {
        case 'weekly':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
          start = weekStart.toISOString().split('T')[0];
          
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
          end = weekEnd.toISOString().split('T')[0];
          break;
          
        case 'monthly':
          start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
          end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
          break;
          
        default:
          // Default to last 7 days
          const defaultStart = new Date(today);
          defaultStart.setDate(today.getDate() - 6);
          start = defaultStart.toISOString().split('T')[0];
          end = today.toISOString().split('T')[0];
      }
    }
    
    const summary = await WorkSheet.getProductivitySummary(employeeId, start, end);
    
    res.json({
      success: true,
      data: {
        range,
        startDate: start,
        endDate: end,
        ...summary
      }
    });
  } catch (error) {
    console.error('Error fetching productivity summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch productivity summary'
    });
  }
});

export default router;
