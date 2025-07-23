import express from 'express';
import ProjectAnnouncement from '../backend_old_unused/models/ProjectAnnouncement.js';
import Project from '../backend_old_unused/models/Project.js';
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

// Get announcements for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;

    // Check if user has access to this project
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (req.user.role === 'employee') {
      const isMember = project.members.some(member => 
        member.user.toString() === req.user.userId
      );
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this project'
        });
      }
    }

    const announcements = await ProjectAnnouncement.find({
      project: req.params.projectId,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gte: new Date() } }
      ]
    })
    .populate('author', 'fullName email')
    .sort({ pinned: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    // Mark announcements as read for this user
    const announcementIds = announcements.map(a => a._id);
    await ProjectAnnouncement.updateMany(
      {
        _id: { $in: announcementIds },
        'recipients.user': req.user.userId
      },
      {
        $set: {
          'recipients.$.isRead': true,
          'recipients.$.readAt': new Date()
        }
      }
    );

    const total = await ProjectAnnouncement.countDocuments({
      project: req.params.projectId,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        announcements,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: announcements.length,
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get announcements',
      error: error.message
    });
  }
});

// Get user's unread announcements across all projects
router.get('/unread', auth, async (req, res) => {
  try {
    const announcements = await ProjectAnnouncement.find({
      'recipients.user': req.user.userId,
      'recipients.isRead': false,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gte: new Date() } }
      ]
    })
    .populate('author', 'fullName email')
    .populate('project', 'name')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({
      success: true,
      data: announcements
    });

  } catch (error) {
    console.error('Get unread announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread announcements',
      error: error.message
    });
  }
});

// Create announcement (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const {
      projectId,
      title,
      message,
      type,
      pinned,
      expiresAt,
      sendToAll
    } = req.body;

    // Validate required fields
    if (!projectId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, title, and message are required'
      });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Prepare recipients
    const recipients = [];
    if (sendToAll) {
      // Send to all project members
      project.members.forEach(member => {
        recipients.push({
          user: member.user,
          isRead: false
        });
      });
    }

    const announcement = new ProjectAnnouncement({
      project: projectId,
      title,
      message,
      type: type || 'info',
      author: req.user.userId,
      recipients,
      pinned: pinned || false,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await announcement.save();
    
    await announcement.populate('author', 'fullName email');
    await announcement.populate('project', 'name');

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    });

  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create announcement',
      error: error.message
    });
  }
});

// Update announcement (Admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['title', 'message', 'type', 'pinned', 'expiresAt'];
    
    const updateData = {};
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    const announcement = await ProjectAnnouncement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('author', 'fullName email')
    .populate('project', 'name');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    });

  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update announcement',
      error: error.message
    });
  }
});

// Mark announcement as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const announcement = await ProjectAnnouncement.findOneAndUpdate(
      {
        _id: req.params.id,
        'recipients.user': req.user.userId
      },
      {
        $set: {
          'recipients.$.isRead': true,
          'recipients.$.readAt': new Date()
        }
      },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      message: 'Announcement marked as read'
    });

  } catch (error) {
    console.error('Mark announcement as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark announcement as read',
      error: error.message
    });
  }
});

// Delete announcement (Admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const announcement = await ProjectAnnouncement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Soft delete
    announcement.isActive = false;
    await announcement.save();

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });

  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete announcement',
      error: error.message
    });
  }
});

// Employee-specific routes

// Get employee's announcements
router.get('/my-announcements', auth, async (req, res) => {
  try {
    const announcements = await ProjectAnnouncement.find({
      'recipients.user': req.user.userId,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gte: new Date() } }
      ]
    })
    .populate('author', 'fullName email')
    .populate('project', 'name')
    .populate('recipients.user', 'fullName')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: announcements
    });

  } catch (error) {
    console.error('Get employee announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get announcements',
      error: error.message
    });
  }
});

// Mark announcement as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const announcement = await ProjectAnnouncement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Find the recipient record for this user
    const recipientIndex = announcement.recipients.findIndex(recipient => 
      recipient.user.toString() === req.user.userId
    );

    if (recipientIndex === -1) {
      return res.status(403).json({
        success: false,
        message: 'You are not a recipient of this announcement'
      });
    }

    // Mark as read
    announcement.recipients[recipientIndex].isRead = true;
    announcement.recipients[recipientIndex].readAt = new Date();

    await announcement.save();

    res.json({
      success: true,
      message: 'Announcement marked as read'
    });

  } catch (error) {
    console.error('Mark announcement read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark announcement as read',
      error: error.message
    });
  }
});

export default router;
