import express from 'express';
import Leave from '../models/Leave.js';
import User from '../models/User.js';
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

// Employee Routes

// Get employee's leave requests
router.get('/my-leaves', auth, async (req, res) => {
  try {
    const { status, year, limit = 20, page = 1 } = req.query;
    const query = { 
      employee: req.user.userId,
      isActive: true
    };

    // Add filters
    if (status && status !== 'all') {
      query.status = status;
    }

    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      query.startDate = {
        $gte: startOfYear,
        $lte: endOfYear
      };
    }

    const leaves = await Leave.find(query)
      .populate('reviewedBy', 'fullName email')
      .sort({ appliedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Leave.countDocuments(query);

    res.json({
      success: true,
      data: {
        leaves,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: leaves.length,
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Get employee leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leave requests',
      error: error.message
    });
  }
});

// Submit new leave request
router.post('/apply', auth, async (req, res) => {
  try {
    const {
      leaveType,
      startDate,
      endDate,
      reason,
      attachments
    } = req.body;

    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Leave type, start date, end date, and reason are required'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date'
      });
    }

    // Check for overlapping leave requests
    const overlappingLeave = await Leave.findOne({
      employee: req.user.userId,
      isActive: true,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        message: 'You already have a leave request for overlapping dates'
      });
    }

    const leave = new Leave({
      employee: req.user.userId,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      attachments: attachments || []
    });

    await leave.save();
    await leave.populate('employee', 'fullName email department position');

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leave
    });

  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit leave request',
      error: error.message
    });
  }
});

// Cancel leave request (only if pending)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const leave = await Leave.findOne({
      _id: req.params.id,
      employee: req.user.userId
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending leave requests can be cancelled'
      });
    }

    leave.isActive = false;
    await leave.save();

    res.json({
      success: true,
      message: 'Leave request cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel leave request',
      error: error.message
    });
  }
});

// Admin Routes

// Get all leave requests (Admin only)
router.get('/admin/all', auth, adminOnly, async (req, res) => {
  try {
    const { status, department, leaveType, year, limit = 20, page = 1 } = req.query;
    const query = { isActive: true };

    // Add filters
    if (status && status !== 'all') {
      query.status = status;
    }

    if (leaveType && leaveType !== 'all') {
      query.leaveType = leaveType;
    }

    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      query.startDate = {
        $gte: startOfYear,
        $lte: endOfYear
      };
    }

    let leaves = await Leave.find(query)
      .populate('employee', 'fullName email department position')
      .populate('reviewedBy', 'fullName email')
      .sort({ appliedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Filter by department if specified
    if (department && department !== 'all') {
      leaves = leaves.filter(leave => leave.employee.department === department);
    }

    const total = await Leave.countDocuments(query);

    res.json({
      success: true,
      data: {
        leaves,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: leaves.length,
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leave requests',
      error: error.message
    });
  }
});

// Approve/Reject leave request (Admin only)
router.put('/:id/review', auth, adminOnly, async (req, res) => {
  try {
    const { status, adminComments } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }

    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'fullName email department position');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending leave requests can be reviewed'
      });
    }

    leave.status = status;
    leave.adminComments = adminComments || '';
    leave.reviewedBy = req.user.userId;
    leave.reviewedAt = new Date();

    await leave.save();
    await leave.populate('reviewedBy', 'fullName email');

    res.json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: leave
    });

  } catch (error) {
    console.error('Review leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review leave request',
      error: error.message
    });
  }
});

// Get leave statistics (Admin only)
router.get('/admin/stats', auth, adminOnly, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);

    const stats = await Leave.aggregate([
      {
        $match: {
          isActive: true,
          startDate: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDays: { $sum: '$totalDays' }
        }
      }
    ]);

    const leaveTypeStats = await Leave.aggregate([
      {
        $match: {
          isActive: true,
          startDate: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 },
          totalDays: { $sum: '$totalDays' }
        }
      }
    ]);

    const pendingCount = await Leave.countDocuments({
      status: 'pending',
      isActive: true
    });

    res.json({
      success: true,
      data: {
        statusStats: stats,
        leaveTypeStats,
        pendingCount,
        year: parseInt(year)
      }
    });

  } catch (error) {
    console.error('Get leave stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leave statistics',
      error: error.message
    });
  }
});

// Get pending leave requests (Admin only)
router.get('/admin/pending', auth, adminOnly, async (req, res) => {
  try {
    const leaves = await Leave.find({
      status: 'pending',
      isActive: true
    })
      .populate('employee', 'fullName email department position')
      .sort({ appliedAt: 1 })
      .limit(50);

    res.json({
      success: true,
      data: leaves
    });

  } catch (error) {
    console.error('Get pending leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending leave requests',
      error: error.message
    });
  }
});

export default router;
