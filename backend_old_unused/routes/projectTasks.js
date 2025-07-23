import express from 'express';
import ProjectTask from '../models/ProjectTask.js';
import Project from '../models/Project.js';
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

// Get tasks for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const { status, priority, limit = 20, page = 1 } = req.query;
    const query = { 
      project: req.params.projectId,
      isActive: true
    };

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
      
      // For employees, only show tasks assigned to them
      query['assignedTo.user'] = req.user.userId;
    }

    // Add filters
    if (status && status !== 'all') {
      query.status = status;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    const tasks = await ProjectTask.find(query)
      .populate('assignedBy', 'fullName email')
      .populate('assignedTo.user', 'fullName email department')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ProjectTask.countDocuments(query);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: tasks.length,
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Get project tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get project tasks',
      error: error.message
    });
  }
});

// Get user's tasks across all projects
router.get('/my-tasks', auth, async (req, res) => {
  try {
    const { status, priority, limit = 20, page = 1 } = req.query;
    const query = { 
      'assignedTo.user': req.user.userId,
      isActive: true
    };

    // Add filters
    if (status && status !== 'all') {
      query['assignedTo.status'] = status;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    const tasks = await ProjectTask.find(query)
      .populate('assignedBy', 'fullName email')
      .populate('project', 'name description')
      .sort({ dueDate: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ProjectTask.countDocuments(query);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: tasks.length,
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tasks',
      error: error.message
    });
  }
});

// Create task (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const {
      title,
      description,
      projectId,
      assignedTo,
      priority,
      dueDate,
      estimatedHours,
      tags
    } = req.body;

    // Validate required fields
    if (!title || !description || !projectId || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, project, and due date are required'
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

    // Prepare assignedTo array
    const assignedUsers = [];
    if (assignedTo && assignedTo.length > 0) {
      for (const userId of assignedTo) {
        // Check if user is a member of the project
        const isMember = project.members.some(member => 
          member.user.toString() === userId
        );
        
        if (isMember) {
          assignedUsers.push({
            user: userId,
            status: 'pending'
          });
        }
      }
    }

    const task = new ProjectTask({
      title,
      description,
      project: projectId,
      assignedBy: req.user.userId,
      assignedTo: assignedUsers,
      priority: priority || 'medium',
      dueDate: new Date(dueDate),
      estimatedHours: estimatedHours || 0,
      tags: tags || [],
      status: assignedUsers.length > 0 ? 'assigned' : 'draft'
    });

    await task.save();
    
    await task.populate('assignedBy', 'fullName email');
    await task.populate('assignedTo.user', 'fullName email department');
    await task.populate('project', 'name');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
});

// Update task status (Employee can update their own status)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ['pending', 'in-progress', 'completed', 'review', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const task = await ProjectTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Find the assigned user
    const assignedUser = task.assignedTo.find(assigned => 
      assigned.user.toString() === req.user.userId
    );

    if (!assignedUser && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    if (req.user.role === 'admin') {
      // Admin can update overall task status
      task.status = status;
    } else {
      // Employee updates their assignment status
      assignedUser.status = status;
      if (notes) assignedUser.notes = notes;
      if (status === 'completed') {
        assignedUser.completedAt = new Date();
      }

      // Update overall task status based on all assignments
      const statuses = task.assignedTo.map(a => a.status);
      if (statuses.every(s => s === 'completed')) {
        task.status = 'completed';
      } else if (statuses.some(s => s === 'in-progress')) {
        task.status = 'in-progress';
      }
    }

    await task.save();
    await task.populate('assignedTo.user', 'fullName email');

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: task
    });

  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task status',
      error: error.message
    });
  }
});

// Update task (Admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = [
      'title', 'description', 'priority', 'dueDate', 
      'estimatedHours', 'actualHours', 'tags', 'status'
    ];
    
    const updateData = {};
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    const task = await ProjectTask.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('assignedBy', 'fullName email')
    .populate('assignedTo.user', 'fullName email department')
    .populate('project', 'name');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
});

// Delete task (Admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const task = await ProjectTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Soft delete
    task.isActive = false;
    await task.save();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
});

// Update task status (for employees)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'in-progress', 'completed', 'on-hold'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const task = await ProjectTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is assigned to this task
    const isAssigned = task.assignedTo.some(assignee => 
      assignee.user.toString() === req.user.userId
    );
    
    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this task'
      });
    }

    // Update the status for this specific user
    const assigneeIndex = task.assignedTo.findIndex(assignee => 
      assignee.user.toString() === req.user.userId
    );
    
    if (assigneeIndex !== -1) {
      task.assignedTo[assigneeIndex].status = status;
      task.assignedTo[assigneeIndex].lastUpdated = new Date();
    }

    // Update overall task status based on assignees' status
    const statuses = task.assignedTo.map(a => a.status);
    if (statuses.every(s => s === 'completed')) {
      task.status = 'completed';
    } else if (statuses.some(s => s === 'in-progress')) {
      task.status = 'in-progress';
    } else if (statuses.every(s => s === 'pending')) {
      task.status = 'pending';
    } else {
      task.status = 'in-progress'; // Mixed statuses
    }

    await task.save();

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: task
    });

  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task status',
      error: error.message
    });
  }
});

export default router;
