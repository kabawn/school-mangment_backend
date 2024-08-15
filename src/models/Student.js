const mongoose = require('mongoose');
const User = require('./User');

const studentSchema = new mongoose.Schema({
    "profile.studentInfo": {  // Ensure that studentInfo is nested under profile
        studentID: { type: String, unique: true },
        class: { type: String },
        section: { type: String },
        rollNumber: { type: String },
        subjects: [{ type: String }],
        academicYear: { type: String },
        grades: [{ subject: String, grade: String }],
        attendanceRecord: [{ date: Date, status: String }],
        guardian: {
            name: String,
            phone: String,
            email: String,
        },
        medicalConditions: [{ type: String }],
        enrollmentDate: { type: Date },
        extracurricularActivities: [{ type: String }],
        disciplinaryRecords: [{ date: Date, incident: String }],
        transportationDetails: {
            busNumber: String,
            pickupTime: String,
            dropoffTime: String,
        },
    }
});

const Student = User.discriminator('student', studentSchema);

module.exports = Student;
