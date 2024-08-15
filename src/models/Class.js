// src/models/Class.js
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    className: {
        type: String,
        required: true,
    },
    subjects: [{
        subjectName: { type: String, required: true },
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    }],
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
