import express from 'express';
import EmployeeShift from '../models/EmployeeShift.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Get shift settings for a specific employee
router.get('/:employeeId/shift', auth, adminAuth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Verify employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Get employee-specific shift settings or return null if using defaults
    const employeeShift = await EmployeeShift.findOne({ employeeId });
    
    if (employeeShift) {
      res.json(employeeShift);
    } else {
      // Return null to indicate using default settings
      res.json(null);
    }
  } catch (error) {
    console.error('Error fetching employee shift settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Set or update shift settings for a specific employee
router.post('/:employeeId/shift', auth, adminAuth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const shiftData = req.body;
    
    // Verify employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Validate required fields
    if (!shiftData.startTime || !shiftData.endTime) {
      return res.status(400).json({ message: 'Start time and end time are required' });
    }
    
    // Check if employee already has custom shift settings
    let employeeShift = await EmployeeShift.findOne({ employeeId });
    
    if (employeeShift) {
      // Update existing settings
      Object.assign(employeeShift, shiftData);
      await employeeShift.save();
    } else {
      // Create new settings
      employeeShift = new EmployeeShift({
        employeeId,
        ...shiftData
      });
      await employeeShift.save();
    }
    
    res.json({
      message: 'Shift settings updated successfully',
      data: employeeShift
    });
  } catch (error) {
    console.error('Error saving employee shift settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete custom shift settings for an employee (revert to defaults)
router.delete('/:employeeId/shift', auth, adminAuth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const result = await EmployeeShift.findOneAndDelete({ employeeId });
    
    if (result) {
      res.json({ message: 'Custom shift settings removed. Employee will use default settings.' });
    } else {
      res.status(404).json({ message: 'No custom shift settings found for this employee' });
    }
  } catch (error) {
    console.error('Error deleting employee shift settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get effective shift settings for an employee (custom or default)
router.get('/:employeeId/effective-shift', auth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Verify employee exists (allow employees to check their own settings)
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Check if user is admin or requesting their own settings
    if (req.user.role !== 'admin' && req.user.id !== employeeId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const effectiveSettings = await EmployeeShift.getEffectiveShiftSettings(employeeId);
    res.json(effectiveSettings);
  } catch (error) {
    console.error('Error fetching effective shift settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
