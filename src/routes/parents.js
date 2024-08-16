const express = require('express');
const Parent = require('../models/parent');
const Admin = require('../models/admin');  // Import the Admin model for user account creation
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');  // Import the role middleware
const crypto = require('crypto');
const sendEmail = require('../utils/email');  // Use your existing sendEmail function
const router = express.Router();

// Get all parents (Admin Only)
router.get('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const parents = await Parent.find().populate('children');
    res.json(parents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new parent (Admin Only)
router.post('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    // Check if a user with the same email already exists in the admins collection
    const existingAdmin = await Admin.findOne({ email: req.body.email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Generate a random password
    const password = crypto.randomBytes(8).toString('hex');

    // Create the parent record
    const parent = new Parent(req.body);

    // Save the parent record
    const newParent = await parent.save();

    // Create a user account for the parent
    const userAccount = new Admin({
      username: req.body.email,  // Use the parent's email as the username
      password: password,  // Set the generated password
      email: req.body.email,
      role: 'parent'
    });
    await userAccount.save();

    // Send an email to the parent with their login credentials
    const emailSubject = 'Your Parent Account Has Been Created';
    const emailText = `Hello ${req.body.firstName},\n\nYour parent account has been created. Please log in with the following credentials:\n\nUsername: ${req.body.email}\nPassword: ${password}\n\nPlease change your password after logging in.\n\nBest regards,\nSchool Management System`;

    await sendEmail(req.body.email, emailSubject, emailText);

    // Respond with the new parent and a success message
    res.status(201).json({
      newParent,
      message: 'Parent account created successfully and login details have been sent to the parent\'s email.'
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get a specific parent by ID (Admin Only)
router.get('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id).populate('children');
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    res.json(parent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a parent by ID (Admin Only)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const parent = await Parent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    res.json(parent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a parent by ID (Admin Only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const parent = await Parent.findByIdAndDelete(req.params.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    res.json({ message: 'Parent deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
