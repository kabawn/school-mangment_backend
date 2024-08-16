const express = require('express');
const Class = require('../models/class');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all classes (Admin Only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const classes = await Class.find().populate('teacher').populate('students');
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new class (Admin Only)
router.post('/', authMiddleware, async (req, res) => {
  const newClass = new Class(req.body);

  try {
    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get a specific class by ID (Admin Only)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id).populate('teacher').populate('students');
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(classData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a class by ID (Admin Only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(updatedClass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a class by ID (Admin Only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json({ message: 'Class deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
