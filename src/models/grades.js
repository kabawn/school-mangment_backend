const mongoose = require('mongoose');

const gradesSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  marks: {
    type: Number,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  term: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model('Grades', gradesSchema);
