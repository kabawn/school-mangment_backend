const mongoose = require('mongoose');
const User = require('./User');

// Teacher Schema extending User
const teacherSchema = new mongoose.Schema({
    "profile.teacherInfo": {  // Note the nesting under 'profile'
        employeeID: { type: String, unique: true },
        subjectsTaught: [{ type: String }],
        classesTaught: [{ type: String }],
        experienceYears: { type: Number },
        qualifications: [{ type: String }],
        employmentDate: { type: Date },
        previousEmployment: [{ school: String, years: Number }],
        weeklyTimetable: [{ day: String, periods: [String] }],
        officeHours: { type: String },
        extracurricularSupervision: [{ type: String }],
        professionalDevelopment: [{ course: String, date: Date }],
        evaluationRecords: [{ date: Date, evaluation: String }],
    }
});

const Teacher = User.discriminator('teacher', teacherSchema);

module.exports = Teacher;
