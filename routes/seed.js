import express from 'express';
import User from '../backend_old_unused/models/User.js';
import Task from '../backend_old_unused/models/Task.js';
import Attendance from '../backend_old_unused/models/Attendance.js';

const router = express.Router();

// Seed sample data for testing
router.post('/seed', async (req, res) => {
  try {
    console.log('Starting data seeding...');

    // Find test employee
    const employee = await User.findOne({ email: 'employeetest@gmail.com' });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Test employee not found. Please register employeetest@gmail.com first.'
      });
    }

    // Find admin
    const admin = await User.findOne({ email: 'contactsanket1@gmail.com' });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found.'
      });
    }

    // Clear existing data for this employee
    await Task.deleteMany({ assignedTo: { $in: [employee._id] } });
    await Attendance.deleteMany({ user: employee._id });

    // Create sample tasks
    const sampleTasks = [
      {
        title: 'Complete Project Documentation',
        description: 'Write comprehensive documentation for the EMS project including API docs and user guides.',
        assignedTo: [employee._id],
        assignedBy: admin._id,
        status: 'completed',
        priority: 'high',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        title: 'Review Code Quality',
        description: 'Perform code review for the authentication module and provide feedback.',
        assignedTo: [employee._id],
        assignedBy: admin._id,
        status: 'completed',
        priority: 'medium',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        completedAt: new Date()
      },
      {
        title: 'Implement Dashboard Features',
        description: 'Add real-time data integration to the employee dashboard.',
        assignedTo: [employee._id],
        assignedBy: admin._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      },
      {
        title: 'Update User Interface',
        description: 'Modernize the UI components and improve user experience.',
        assignedTo: [employee._id],
        assignedBy: admin._id,
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
      },
      {
        title: 'Database Optimization',
        description: 'Optimize database queries and improve performance.',
        assignedTo: [employee._id],
        assignedBy: admin._id,
        status: 'pending',
        priority: 'low',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 weeks from now
      }
    ];

    const createdTasks = await Task.insertMany(sampleTasks);

    // Create sample attendance for the current month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const attendanceRecords = [];

    // Create attendance for each working day this month
    for (let day = 1; day <= today.getDate(); day++) {
      const currentDate = new Date(today.getFullYear(), today.getMonth(), day);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        continue;
      }

      const checkInTime = new Date(currentDate);
      checkInTime.setHours(9, Math.floor(Math.random() * 30), 0); // 9:00-9:30 AM

      const checkOutTime = new Date(currentDate);
      checkOutTime.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0); // 5:00-7:00 PM

      let status = 'present';
      if (checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 15)) {
        status = 'late';
      }

      attendanceRecords.push({
        user: employee._id,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
        checkIn: checkInTime,
        checkOut: checkOutTime,
        status: status,
        workingHours: Math.floor((checkOutTime - checkInTime) / (1000 * 60)), // in minutes
        location: {
          checkIn: {
            latitude: 40.7128,
            longitude: -74.0060,
            address: 'Office Location, New York'
          },
          checkOut: {
            latitude: 40.7128,
            longitude: -74.0060,
            address: 'Office Location, New York'
          }
        }
      });
    }

    const createdAttendance = await Attendance.insertMany(attendanceRecords);

    res.json({
      success: true,
      message: 'Sample data seeded successfully',
      data: {
        tasksCreated: createdTasks.length,
        attendanceRecordsCreated: createdAttendance.length,
        employee: {
          id: employee._id,
          email: employee.email,
          fullName: employee.fullName
        }
      }
    });

  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed data',
      error: error.message
    });
  }
});

export default router;
