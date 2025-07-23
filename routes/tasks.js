import express from 'express';
import Task from '../backend_old_unused/models/Task.js';
import auth from '../backend_old_unused/middleware/auth.js';

const router = express.Router();

// Get all tasks for current user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const tasks = await Task.find({ 
      assignedTo: { $in: [userId] }
    }).populate('assignedBy', 'fullName email').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Tasks fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
});

// Update task status
router.put('/:taskId', auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.userId;

    // Find task and verify user is assigned to it
    const task = await Task.findOne({ 
      _id: taskId, 
      assignedTo: { $in: [userId] }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you are not assigned to this task'
      });
    }

    // Update task
    task.status = status;
    if (notes) {
      task.notes = notes;
    }
    
    // If marking as completed, set completion date
    if (status === 'completed') {
      task.completedAt = new Date();
    }

    await task.save();

    // Populate assignedBy for response
    await task.populate('assignedBy', 'fullName email');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });

  } catch (error) {
    console.error('Task update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
});

// Placeholder routes - implement as needed
router.get('/placeholder', (req, res) => {
  res.json({ message: 'Tasks routes - Available endpoints: GET /, PUT /:taskId' });
});

export default router;
