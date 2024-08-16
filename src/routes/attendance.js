const express = require('express');
const Attendance = require('../models/attendance');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all attendance records (Admin Only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.find().populate('student').populate('class');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new attendance record (Admin Only)
router.post('/', authMiddleware, async (req, res) => {
  const attendance = new Attendance(req.body);

  try {
    const newAttendance = await attendance.save();
    res.status(201).json(newAttendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get a specific attendance record by ID (Admin Only)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate('student').populate('class');
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update an attendance record by ID (Admin Only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json(attendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an attendance record by ID (Admin Only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
