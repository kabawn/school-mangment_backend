const express = require("express");
const Student = require("../models/student");
const Admin = require("../models/admin");  // Import the Admin model for user account creation
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");  // Import the role middleware
const upload = require("../middleware/upload");
const crypto = require('crypto');
const sendEmail = require('../utils/email');  // Use your existing sendEmail function
const router = express.Router();

// Get all students (Admin Only)
router.get("/", authMiddleware, roleMiddleware(['admin']), async (req, res) => {
   try {
      const students = await Student.find().populate("class").populate("parent");
      res.json(students);
   } catch (err) {
      res.status(500).json({ message: err.message });
   }
});

// Create a new student with profile image upload (Admin Only)
router.post("/", authMiddleware, roleMiddleware(['admin']), upload.single("profileImage"), async (req, res) => {
   try {
       // Check if a student with the same email already exists
       const existingStudent = await Student.findOne({ email: req.body.email });
       if (existingStudent) {
           return res.status(400).json({ message: 'A student with this email already exists.' });
       }

       // Generate a random password
       const password = crypto.randomBytes(8).toString('hex');

       // Create the student record
       const student = new Student({
           firstName: req.body.firstName,
           lastName: req.body.lastName,
           dob: req.body.dob,
           gender: req.body.gender,
           address: req.body.address,
           email: req.body.email,
           phone: req.body.phone,
           class: req.body.class,
           parent: req.body.parent,
           profileImage: req.file ? req.file.filename : null,
       });

       // Save the student record
       const newStudent = await student.save();

       // Create a user account for the student
       const userAccount = new Admin({
           username: req.body.email,  // Use the student's email as the username
           password: password,  // Set the generated password
           email: req.body.email,
           role: 'student'
       });
       await userAccount.save();

       // Send an email to the student with their login credentials
       const emailSubject = 'Your Student Account Has Been Created';
       const emailText = `Hello ${req.body.firstName},\n\nYour student account has been created. Please log in with the following credentials:\n\nUsername: ${req.body.email}\nPassword: ${password}\n\nPlease change your password after logging in.\n\nBest regards,\nSchool Management System`;

       await sendEmail(req.body.email, emailSubject, emailText);

       // Respond with the new student and a success message
       res.status(201).json({
           newStudent,
           message: 'Student account created successfully and login details have been sent to the student\'s email.'
       });
   } catch (err) {
       res.status(400).json({ message: err.message });
   }
});


// Get a specific student by ID (Admin Only)
router.get("/:id", authMiddleware, roleMiddleware(['admin']), async (req, res) => {
   try {
      const student = await Student.findById(req.params.id).populate("class").populate("parent");
      if (!student) {
         return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
   } catch (err) {
      res.status(500).json({ message: err.message });
   }
});

// Update a student by ID (Admin Only)
router.put("/:id", authMiddleware, roleMiddleware(['admin']), async (req, res) => {
   try {
      const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!student) {
         return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
   } catch (err) {
      res.status(400).json({ message: err.message });
   }
});

// Delete a student by ID (Admin Only)
router.delete("/:id", authMiddleware, roleMiddleware(['admin']), async (req, res) => {
   try {
      const student = await Student.findByIdAndDelete(req.params.id);
      if (!student) {
         return res.status(404).json({ message: "Student not found" });
      }
      res.json({ message: "Student deleted successfully" });
   } catch (err) {
      res.status(500).json({ message: err.message });
   }
});

module.exports = router;
