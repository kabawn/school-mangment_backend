const express = require('express');
const Student = require('../models/Student'); // Import the Student model
const Teacher = require('../models/Teacher'); // Import the Teacher model
const auth = require('../middleware/auth');
const authRole = require('../middleware/role');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendEmail = require('../utils/email');
const upload = require('../utils/multer'); // Import the multer configuration

const router = express.Router();

// Function to generate a simple, alphanumeric temporary password
function generateTempPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) { // Generate an 8-character password
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    return password;
}

// Route to create a new teacher (admin only)
router.post('/teacher', auth, authRole('admin'), upload.single('profileImage'), async (req, res) => {
    const { username, email, profile } = req.body;
    try {
        const tempPassword = generateTempPassword(); // Generate a temporary password
        const hashedPassword = await bcrypt.hash(tempPassword, 10); // Hash the password

        const teacher = new Teacher({
            username,
            email,
            password: hashedPassword, // Store the hashed password
            profile: {
                ...profile,
                teacherInfo: profile.teacherInfo || {}, // Ensure teacherInfo is inside profile
                profileImage: req.file ? `/uploads/${req.file.filename}` : undefined, // Set the profile image if uploaded
            }
        });

        await teacher.save();

        // Construct the response
        const teacherResponse = {
            username: teacher.username,
            email: teacher.email,
            role: teacher.role,
            profile: {
                name: teacher.profile.name,
                dateOfBirth: teacher.profile.dateOfBirth,
                gender: teacher.profile.gender,
                phone: teacher.profile.phone,
                address: teacher.profile.address,
                teacherInfo: teacher.profile.teacherInfo, // Include teacherInfo in the response
                profileImage: teacher.profile.profileImage, // Include profileImage in the response
            }
        };

        // Send email with temporary password
        await sendEmail(
            email,
            'Your Teacher Account Created',
            `Welcome to the School Management System!\n\nYour username is: ${username}\nTemporary password: ${tempPassword}\n\nPlease log in and change your password as soon as possible.`
        );

        res.status(201).send(teacherResponse);
    } catch (err) {
        res.status(400).send({ error: 'Error creating teacher', details: err.message });
    }
});

// Route to create a new student (admin only)
router.post('/student', auth, authRole('admin'), upload.single('profileImage'), async (req, res) => {
    const { username, email, profile } = req.body;

    try {
        const tempPassword = generateTempPassword(); // Generate a temporary password
        const hashedPassword = await bcrypt.hash(tempPassword, 10); // Hash the password

        // Debugging: Log the profile and studentInfo to see if studentID is being passed
        console.log('Profile:', profile);
        console.log('StudentInfo:', profile.studentInfo);

        // Validate that studentID is provided and not null
        if (!profile || !profile.studentInfo || !profile.studentInfo.studentID) {
            return res.status(400).send({ error: 'studentID is required and must be unique' });
        }

        const student = new Student({
            username,
            email,
            password: hashedPassword, // Store the hashed password
            profile: {
                ...profile,
                studentInfo: {
                    ...profile.studentInfo,
                    studentID: profile.studentInfo.studentID, // Ensure studentID is correctly set
                },
                profileImage: req.file ? `/uploads/${req.file.filename}` : undefined, // Set the profile image if uploaded
            }
        });

        await student.save();

        const studentResponse = {
            username: student.username,
            email: student.email,
            role: student.role,
            profile: {
                name: student.profile.name,
                dateOfBirth: student.profile.dateOfBirth,
                gender: student.profile.gender,
                phone: student.profile.phone,
                address: student.profile.address,
                studentInfo: student.profile.studentInfo,
                profileImage: student.profile.profileImage, // Include profileImage in the response
            }
        };

        await sendEmail(
            email,
            'Your Student Account Created',
            `Welcome to the School Management System!\n\nYour username is: ${username}\nTemporary password: ${tempPassword}\n\nPlease log in and change your password as soon as possible.`
        );

        res.status(201).send(studentResponse);
    } catch (err) {
        console.error('Error creating student:', err.message);
        res.status(400).send({ error: 'Error creating student', details: err.message });
    }
});

// Fetch all teachers (admin only)
router.get('/teachers', auth, authRole('admin'), async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.status(200).send(teachers);
    } catch (err) {
        res.status(500).send({ error: 'Error fetching teachers', details: err.message });
    }
});

// Fetch all students (admin only)
router.get('/students', auth, authRole('admin'), async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).send(students);
    } catch (err) {
        res.status(500).send({ error: 'Error fetching students', details: err.message });
    }
});


// Fetch a teacher by ID (admin only)
router.get('/teacher/:id', auth, authRole('admin'), async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).send({ error: 'Teacher not found' });
        res.status(200).send(teacher);
    } catch (err) {
        res.status(500).send({ error: 'Error fetching teacher', details: err.message });
    }
});

// Fetch a student by ID (admin only)
router.get('/student/:id', auth, authRole('admin'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).send({ error: 'Student not found' });
        res.status(200).send(student);
    } catch (err) {
        res.status(500).send({ error: 'Error fetching student', details: err.message });
    }
});


// Update a teacher by ID (admin only)
router.put('/teacher/:id', auth, authRole('admin'), upload.single('profileImage'), async (req, res) => {
    const { username, email, profile } = req.body;
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).send({ error: 'Teacher not found' });

        teacher.username = username || teacher.username;
        teacher.email = email || teacher.email;
        teacher.profile = {
            ...teacher.profile,
            ...profile,
            teacherInfo: profile.teacherInfo || teacher.profile.teacherInfo,
            profileImage: req.file ? `/uploads/${req.file.filename}` : teacher.profile.profileImage,
        };

        await teacher.save();
        res.status(200).send(teacher);
    } catch (err) {
        res.status(400).send({ error: 'Error updating teacher', details: err.message });
    }
});

// Update a student by ID (admin only)
router.put('/student/:id', auth, authRole('admin'), upload.single('profileImage'), async (req, res) => {
    const { username, email, profile } = req.body;
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).send({ error: 'Student not found' });

        student.username = username || student.username;
        student.email = email || student.email;
        student.profile = {
            ...student.profile,
            ...profile,
            studentInfo: profile.studentInfo || student.profile.studentInfo,
            profileImage: req.file ? `/uploads/${req.file.filename}` : student.profile.profileImage,
        };

        await student.save();
        res.status(200).send(student);
    } catch (err) {
        res.status(400).send({ error: 'Error updating student', details: err.message });
    }
});


// Delete a teacher by ID (admin only)
router.delete('/teacher/:id', auth, authRole('admin'), async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndDelete(req.params.id);
        if (!teacher) return res.status(404).send({ error: 'Teacher not found' });
        res.status(200).send({ message: 'Teacher deleted successfully' });
    } catch (err) {
        res.status(500).send({ error: 'Error deleting teacher', details: err.message });
    }
});

// Delete a student by ID (admin only)
router.delete('/student/:id', auth, authRole('admin'), async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) return res.status(404).send({ error: 'Student not found' });
        res.status(200).send({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).send({ error: 'Error deleting student', details: err.message });
    }
});



module.exports = router;
