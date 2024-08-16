const express = require('express');
const Teacher = require('../models/teacher');
const Admin = require('../models/admin');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const upload = require('../middleware/upload');
const crypto = require('crypto');
const sendEmail = require('../utils/email');  // Use your existing sendEmail function
const router = express.Router();

// Get all teachers (Admin Only)
router.get('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const teachers = await Teacher.find().populate('classes');
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new teacher (Admin Only)
router.post('/', authMiddleware, roleMiddleware(['admin']), upload.single('profileImage'), async (req, res) => {
  const { email, firstName } = req.body;

  // Check if a user with the same email already exists in the admins collection
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return res.status(400).json({ message: 'A user with this email already exists.' });
  }

  // Generate a random password
  const password = crypto.randomBytes(8).toString('hex');

  // Create the teacher record
  const teacher = new Teacher({
    ...req.body,
    profileImage: req.file ? req.file.filename : null,
  });

  try {
    // Save the teacher record
    const newTeacher = await teacher.save();

    // Create a user account for the teacher
    const userAccount = new Admin({
      username: email,  // Use the email as the username
      password: password,  // Set the generated password
      email: email,
      role: 'teacher'
    });
    await userAccount.save();

    // Send an email to the teacher with their login credentials
    const emailSubject = 'Your Teacher Account Has Been Created';
    const emailText = `Hello ${firstName},\n\nYour teacher account has been created. Please log in with the following credentials:\n\nUsername: ${email}\nPassword: ${password}\n\nPlease change your password after logging in.\n\nBest regards,\nSchool Management System`;

    await sendEmail(email, emailSubject, emailText);

    // Respond with the new teacher and a success message
    res.status(201).json({
      newTeacher,
      message: 'Teacher account created successfully and login details have been sent to the teacher\'s email.'
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Get a specific teacher by ID (Admin Only)
router.get('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('classes');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new teacher (Admin Only)
router.post('/', authMiddleware, roleMiddleware(['admin']), upload.single('profileImage'), async (req, res) => {
  const { username, password, email } = req.body;

  // Create the teacher record
  const teacher = new Teacher(req.body);
  if (req.file) {
    teacher.profileImage = req.file.filename;
  }

  try {
    // Save the teacher record
    const newTeacher = await teacher.save();

    // Create a user account for the teacher
    const userAccount = new Admin({
      username: username,
      password: password,
      email: email,
      role: 'teacher'  // Assign the role 'teacher'
    });
    await userAccount.save();

    // Respond with both the new teacher and a success message
    res.status(201).json({
      newTeacher,
      message: 'Teacher account created successfully'
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a teacher by ID (Admin Only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
