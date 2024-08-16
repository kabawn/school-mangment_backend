const express = require('express');
const Grades = require('../models/grades');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all grades (Admin Only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const grades = await Grades.find().populate('student');
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new grade (Admin Only)
router.post('/', authMiddleware, async (req, res) => {
  const grade = new Grades(req.body);

  try {
    const newGrade = await grade.save();
    res.status(201).json(newGrade);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get a specific grade by ID (Admin Only)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const grade = await Grades.findById(req.params.id).populate('student');
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    res.json(grade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a grade by ID (Admin Only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const grade = await Grades.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    res.json(grade);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a grade by ID (Admin Only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const grade = await Grades.findByIdAndDelete(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    res.json({ message: 'Grade deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
