import express from 'express';
import auth from '../backend_old_unused/middleware/auth.js';
import { getUserRecentActivities, getAllRecentActivities } from '../backend_old_unused/utils/activityLogger.js';

const router = express.Router();

// Get current user's recent activities
router.get('/my-activities', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;
    
    const activities = await getUserRecentActivities(userId, limit);
    
    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: error.message
    });
  }
});

// Get all activities (Admin only)
router.get('/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const limit = parseInt(req.query.limit) || 50;
    const activities = await getAllRecentActivities(limit);
    
    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching all activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: error.message
    });
  }
});

export default router;
