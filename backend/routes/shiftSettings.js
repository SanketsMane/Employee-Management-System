import express from 'express';
import ShiftSettings from '../models/ShiftSettings.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Get shift settings
router.get('/settings', auth, async (req, res) => {
  try {
    let settings = await ShiftSettings.findOne({ organization: 'default' });
    
    if (!settings) {
      // Create default settings if none exist
      settings = new ShiftSettings({
        organization: 'default',
        shiftStart: '09:00',
        shiftEnd: '18:00',
        lateThreshold: 30,
        halfDayThreshold: 4,
        breakDuration: 60,
        workingDays: [1, 2, 3, 4, 5],
        timezone: 'Asia/Kolkata'
      });
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching shift settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shift settings',
      error: error.message
    });
  }
});

// Update shift settings (Admin only)
router.put('/settings', auth, adminAuth, async (req, res) => {
  try {
    const {
      shiftStart,
      shiftEnd,
      lateThreshold,
      halfDayThreshold,
      breakDuration,
      workingDays,
      timezone
    } = req.body;

    let settings = await ShiftSettings.findOne({ organization: 'default' });
    
    if (!settings) {
      settings = new ShiftSettings({ organization: 'default' });
    }

    if (shiftStart) settings.shiftStart = shiftStart;
    if (shiftEnd) settings.shiftEnd = shiftEnd;
    if (lateThreshold !== undefined) settings.lateThreshold = lateThreshold;
    if (halfDayThreshold !== undefined) settings.halfDayThreshold = halfDayThreshold;
    if (breakDuration !== undefined) settings.breakDuration = breakDuration;
    if (workingDays) settings.workingDays = workingDays;
    if (timezone) settings.timezone = timezone;
    
    settings.updatedBy = req.user.userId;
    
    await settings.save();

    res.json({
      success: true,
      message: 'Shift settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating shift settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shift settings',
      error: error.message
    });
  }
});

export default router;
