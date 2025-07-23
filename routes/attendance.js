import express from 'express';
import Attendance from '../backend_old_unused/models/Attendance.js';
import ShiftSettings from '../backend_old_unused/models/ShiftSettings.js';
import auth from '../backend_old_unused/middleware/auth.js';
import { logActivity, ACTIVITY_TYPES } from '../backend_old_unused/utils/activityLogger.js';

const router = express.Router();

// Helper function to calculate time difference in minutes
const getTimeDifferenceInMinutes = (time1, time2) => {
  return Math.abs(time2 - time1) / (1000 * 60);
};

// Helper function to parse time string to today's date
const parseTimeToToday = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0);
};

// Helper function to calculate attendance status
const calculateAttendanceStatus = async (attendance, shiftSettings) => {
  if (!attendance.checkIn) {
    return { status: 'absent', isLate: false, isHalfDay: false };
  }

  const shiftStartTime = parseTimeToToday(shiftSettings.shiftStart);
  const shiftEndTime = parseTimeToToday(shiftSettings.shiftEnd);
  const checkInTime = new Date(attendance.checkIn);
  
  // Check if late
  const lateThresholdTime = new Date(shiftStartTime.getTime() + (shiftSettings.lateThreshold * 60000));
  const isLate = checkInTime > lateThresholdTime;
  
  // Check if half day (if checked out before required hours)
  let isHalfDay = false;
  if (attendance.checkOut) {
    const checkOutTime = new Date(attendance.checkOut);
    const requiredEndTime = new Date(shiftEndTime.getTime() - (shiftSettings.halfDayThreshold * 60 * 60000));
    isHalfDay = checkOutTime < requiredEndTime;
  }
  
  // Determine status
  let status = 'present';
  if (isHalfDay) {
    status = 'half-day';
  } else if (isLate) {
    status = 'late';
  }
  
  return { status, isLate, isHalfDay };
};

// Check in
router.post('/checkin', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { location } = req.body;
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Get shift settings
    const shiftSettings = await ShiftSettings.findOne({ organization: 'default' });
    if (!shiftSettings) {
      return res.status(400).json({
        success: false,
        message: 'Shift settings not configured'
      });
    }

    // Check if already checked in today
    let attendance = await Attendance.findOne({ user: userId, date: dateOnly });
    
    if (attendance && attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    // Create or update attendance record
    if (!attendance) {
      attendance = new Attendance({
        user: userId,
        date: dateOnly,
        checkIn: new Date(),
        breaks: [],
        location: {
          checkIn: location
        }
      });
    } else {
      attendance.checkIn = new Date();
      if (location) {
        attendance.location.checkIn = location;
      }
    }

    // Calculate status based on check-in time
    const statusInfo = await calculateAttendanceStatus(attendance, shiftSettings);
    attendance.status = statusInfo.status;
    attendance.isLate = statusInfo.isLate;
    attendance.isHalfDay = statusInfo.isHalfDay;

    await attendance.save();

    // Log activity
    await logActivity(
      userId,
      ACTIVITY_TYPES.ATTENDANCE.CHECK_IN.type,
      ACTIVITY_TYPES.ATTENDANCE.CHECK_IN.action,
      `Checked in at ${attendance.checkIn.toLocaleTimeString()} - Status: ${statusInfo.status}`,
      {
        checkInTime: attendance.checkIn,
        status: statusInfo.status,
        isLate: statusInfo.isLate,
        location: location?.address || 'Office'
      },
      req
    );

    // Provide feedback based on timing
    let message = 'Checked in successfully!';
    if (statusInfo.isLate) {
      const shiftStartTime = parseTimeToToday(shiftSettings.shiftStart);
      const minutesLate = Math.floor(getTimeDifferenceInMinutes(shiftStartTime, attendance.checkIn));
      message = `Checked in late by ${minutesLate} minutes`;
    }

    res.json({
      success: true,
      message,
      data: attendance,
      shiftInfo: {
        shiftStart: shiftSettings.shiftStart,
        shiftEnd: shiftSettings.shiftEnd,
        isLate: statusInfo.isLate,
        status: statusInfo.status
      }
    });

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in',
      error: error.message
    });
  }
});

// Check out
router.post('/checkout', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { location } = req.body;
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Get shift settings
    const shiftSettings = await ShiftSettings.findOne({ organization: 'default' });
    if (!shiftSettings) {
      return res.status(400).json({
        success: false,
        message: 'Shift settings not configured'
      });
    }

    const attendance = await Attendance.findOne({ user: userId, date: dateOnly });
    
    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Must check in first'
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today'
      });
    }

    // End any ongoing break
    if (attendance.breaks.length > 0) {
      const lastBreak = attendance.breaks[attendance.breaks.length - 1];
      if (!lastBreak.end) {
        lastBreak.end = new Date();
      }
    }

    const checkOutTime = new Date();
    attendance.checkOut = checkOutTime;
    if (location) {
      attendance.location.checkOut = location;
    }

    // Calculate total break time
    let totalBreakTime = 0;
    attendance.breaks.forEach(breakPeriod => {
      if (breakPeriod.start && breakPeriod.end) {
        totalBreakTime += getTimeDifferenceInMinutes(breakPeriod.start, breakPeriod.end);
      }
    });
    attendance.totalBreakTime = totalBreakTime;

    // Calculate working hours
    const workingMinutes = getTimeDifferenceInMinutes(attendance.checkIn, checkOutTime) - totalBreakTime;
    attendance.workingHours = Math.max(0, workingMinutes / 60);

    // Recalculate status based on checkout time
    const statusInfo = await calculateAttendanceStatus(attendance, shiftSettings);
    attendance.status = statusInfo.status;
    attendance.isLate = statusInfo.isLate;
    attendance.isHalfDay = statusInfo.isHalfDay;

    await attendance.save();

    // Log activity
    await logActivity(
      userId,
      ACTIVITY_TYPES.ATTENDANCE.CHECK_OUT.type,
      ACTIVITY_TYPES.ATTENDANCE.CHECK_OUT.action,
      `Checked out at ${checkOutTime.toLocaleTimeString()} - Status: ${statusInfo.status} - Working hours: ${attendance.workingHours.toFixed(2)}h`,
      {
        checkOutTime: checkOutTime,
        status: statusInfo.status,
        isHalfDay: statusInfo.isHalfDay,
        workingHours: attendance.workingHours,
        totalBreakTime: totalBreakTime,
        location: location?.address || 'Office'
      },
      req
    );

    // Provide feedback based on timing
    let message = 'Checked out successfully!';
    const shiftEndTime = parseTimeToToday(shiftSettings.shiftEnd);
    
    if (statusInfo.isHalfDay) {
      message = 'Checked out early - marked as half day';
    } else if (checkOutTime >= shiftEndTime) {
      message = 'Full day completed successfully!';
    } else {
      const requiredEndTime = new Date(shiftEndTime.getTime() - (shiftSettings.halfDayThreshold * 60 * 60000));
      if (checkOutTime >= requiredEndTime) {
        message = 'Checked out successfully!';
      }
    }

    res.json({
      success: true,
      message,
      data: attendance,
      shiftInfo: {
        shiftStart: shiftSettings.shiftStart,
        shiftEnd: shiftSettings.shiftEnd,
        isHalfDay: statusInfo.isHalfDay,
        status: statusInfo.status,
        workingHours: attendance.workingHours.toFixed(2)
      }
    });

  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check out',
      error: error.message
    });
  }
});

// Start/End break
router.post('/break', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const attendance = await Attendance.findOne({ user: userId, date: dateOnly });
    
    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Must check in first'
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Cannot take break after checkout'
      });
    }

    // Check if currently on break
    const currentBreak = attendance.breaks.find(breakSession => !breakSession.end);

    if (currentBreak) {
      // End current break
      currentBreak.end = new Date();
      await attendance.save();

      res.json({
        success: true,
        message: 'Break ended',
        data: attendance,
        onBreak: false
      });
    } else {
      // Start new break
      attendance.breaks.push({
        start: new Date()
      });
      await attendance.save();

      res.json({
        success: true,
        message: 'Break started',
        data: attendance,
        onBreak: true
      });
    }

  } catch (error) {
    console.error('Break error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to manage break',
      error: error.message
    });
  }
});

// Get today's attendance status
router.get('/today', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const attendance = await Attendance.findOne({ user: userId, date: dateOnly });

    const status = {
      hasCheckedIn: !!(attendance && attendance.checkIn),
      hasCheckedOut: !!(attendance && attendance.checkOut),
      onBreak: false,
      attendance: attendance
    };

    if (attendance && attendance.breaks.length > 0) {
      const lastBreak = attendance.breaks[attendance.breaks.length - 1];
      status.onBreak = !lastBreak.end;
    }

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Today status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get today status',
      error: error.message
    });
  }
});

// Get monthly attendance for calendar
router.get('/:employeeId/:month', auth, async (req, res) => {
  try {
    const { employeeId, month } = req.params;
    const userId = req.user.userId;

    // Only allow users to view their own data or admin to view any
    // Convert both to strings for proper comparison
    if (userId.toString() !== employeeId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [year, monthNum] = month.split('-');
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    const attendance = await Attendance.find({
      user: employeeId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    res.json({
      success: true,
      data: attendance
    });

  } catch (error) {
    console.error('Monthly attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get monthly attendance',
      error: error.message
    });
  }
});

export default router;
