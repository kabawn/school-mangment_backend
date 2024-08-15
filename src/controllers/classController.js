const Class = require('../models/Class');
const User = require('../models/User'); // Import the User model

// Create a new class
exports.createClass = async (req, res) => {
    const { className, subjects, studentIds } = req.body;

    try {
        // Validate that all teacher ObjectIds in subjects are valid and correspond to teachers
        for (let subject of subjects) {
            const teacher = await User.findById(subject.teacher);
            if (!teacher || teacher.role !== 'teacher') {
                return res.status(400).send({ error: `Invalid teacher ID for subject ${subject.subjectName}` });
            }
        }

        // Validate that all studentIds are valid and correspond to students
        const validStudents = await User.find({
            _id: { $in: studentIds },
            role: 'student'
        });

        if (validStudents.length !== studentIds.length) {
            return res.status(400).send({ error: 'Some student IDs are invalid or do not correspond to students' });
        }

        // Create the new class with validated subjects and students
        const newClass = new Class({
            className,
            subjects, // Array of subjects with associated teachers
            students: studentIds // Array of student ObjectIds
        });

        await newClass.save();
        res.status(201).send(newClass);
    } catch (err) {
        res.status(400).send({ error: 'Error creating class', details: err.message });
    }
};

// Get all classes
exports.getAllClasses = async (req, res) => {
    try {
        const classes = await Class.find()
            .populate('subjects.teacher') // Populate the teacher info in each subject
            .populate('students'); // Optionally, populate student details as well

        res.send(classes);
    } catch (err) {
        res.status(400).send({ error: 'Error fetching classes' });
    }
};

// Update a class
exports.updateClass = async (req, res) => {
    const { className, subjects, studentIds } = req.body;
    try {
        const updatedClass = await Class.findByIdAndUpdate(req.params.id, {
            className,
            subjects, // Array of subjects with associated teachers
            students: studentIds,
        }, { new: true });

        res.send(updatedClass);
    } catch (err) {
        res.status(400).send({ error: 'Error updating class', details: err.message });
    }
};

// Delete a class
exports.deleteClass = async (req, res) => {
    try {
        await Class.findByIdAndDelete(req.params.id);
        res.send({ message: 'Class deleted successfully' });
    } catch (err) {
        res.status(400).send({ error: 'Error deleting class', details: err.message });
    }
};
