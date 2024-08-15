// src/routes/classRoutes.js
const express = require('express');
const { createClass, getAllClasses, updateClass, deleteClass } = require('../controllers/classController');
const auth = require('../middleware/auth');
const authRole = require('../middleware/role');

const router = express.Router();

// Route for creating a new class
router.post('/', auth, authRole('admin'), createClass);

// Route for getting all classes
router.get('/', auth, getAllClasses);

// Route for updating a class
router.put('/:id', auth, authRole('admin'), updateClass);

// Route for deleting a class
router.delete('/:id', auth, authRole('admin'), deleteClass);

module.exports = router;
