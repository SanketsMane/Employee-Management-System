import express from 'express';
import Project from '../backend_old_unused/models/Project.js';
import ProjectTask from '../backend_old_unused/models/ProjectTask.js';
import ProjectAnnouncement from '../backend_old_unused/models/ProjectAnnouncement.js';
import User from '../backend_old_unused/models/User.js';
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

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const { status, search, limit = 10, page = 1 } = req.query;
    const query = { isActive: true };

    // Add status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // For employees, only show projects they're part of
    if (req.user.role === 'employee') {
      query['members.user'] = req.user.userId;
    }

    const projects = await Project.find(query)
      .populate('manager', 'fullName email')
      .populate('members.user', 'fullName email department')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: projects.length,
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get projects',
      error: error.message
    });
  }
});

// Employee-specific routes

// Get employee's projects
router.get('/my-projects', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user.userId,
      isActive: true
    })
      .populate('manager', 'fullName email department position')
      .populate('members.user', 'fullName email department position')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: projects
    });

  } catch (error) {
    console.error('Get employee projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get projects',
      error: error.message
    });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'fullName email department position')
      .populate('members.user', 'fullName email department position');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has access to this project
    if (req.user.role === 'employee') {
      const isMember = project.members.some(member => 
        member.user._id.toString() === req.user.userId
      );
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this project'
        });
      }
    }

    res.json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get project',
      error: error.message
    });
  }
});

// Create project (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      priority,
      budget,
      tags,
      memberIds
    } = req.body;

    // Validate required fields
    if (!name || !description || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, start date, and end date are required'
      });
    }

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Prepare members array
    const members = [];
    if (memberIds && memberIds.length > 0) {
      for (const memberId of memberIds) {
        const user = await User.findById(memberId);
        if (user && user.role === 'employee') {
          members.push({
            user: memberId,
            role: 'member'
          });
        }
      }
    }

    const project = new Project({
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      priority: priority || 'medium',
      manager: req.user.userId,
      members,
      budget: budget || { allocated: 0, spent: 0 },
      tags: tags || []
    });

    await project.save();
    
    await project.populate('manager', 'fullName email');
    await project.populate('members.user', 'fullName email department');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
});

// Update project (Admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = [
      'name', 'description', 'status', 'priority', 
      'startDate', 'endDate', 'budget', 'progress', 'tags'
    ];
    
    const updateData = {};
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    // Validate dates if provided
    if (updateData.startDate && updateData.endDate) {
      if (new Date(updateData.startDate) >= new Date(updateData.endDate)) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('manager', 'fullName email')
    .populate('members.user', 'fullName email department');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
});

// Add members to project (Admin only)
router.post('/:id/members', auth, adminOnly, async (req, res) => {
  try {
    const { memberIds, role = 'member' } = req.body;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Member IDs are required'
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Add new members (avoid duplicates)
    for (const memberId of memberIds) {
      const user = await User.findById(memberId);
      if (user && user.role === 'employee') {
        const existingMember = project.members.find(member => 
          member.user.toString() === memberId
        );
        
        if (!existingMember) {
          project.members.push({
            user: memberId,
            role: role
          });
        }
      }
    }

    await project.save();
    await project.populate('members.user', 'fullName email department');

    res.json({
      success: true,
      message: 'Members added successfully',
      data: project.members
    });

  } catch (error) {
    console.error('Add members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add members',
      error: error.message
    });
  }
});

// Remove member from project (Admin only)
router.delete('/:id/members/:memberId', auth, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    project.members = project.members.filter(member => 
      member.user.toString() !== req.params.memberId
    );

    await project.save();

    res.json({
      success: true,
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member',
      error: error.message
    });
  }
});

// Delete project (Admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Soft delete
    project.isActive = false;
    await project.save();

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
});

export default router;
