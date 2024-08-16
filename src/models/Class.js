const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  gradeLevel: {
    type: Number,
    required: true
  },
  teachers: [{  // Changed from teacher to teachers, and it's now an array
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }]
});

module.exports = mongoose.model('Class', classSchema);
