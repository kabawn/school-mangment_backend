const express = require('express');
const connectDB = require('./config/db');
const app = express();

// Load environment variables from .env file
require('dotenv').config();

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Import Routes
const adminRouter = require('./routes/admin');
const studentsRouter = require('./routes/students');
const teachersRouter = require('./routes/teachers');
const classesRouter = require('./routes/classes');
const parentsRouter = require('./routes/parents');
const gradesRouter = require('./routes/grades');
const attendanceRouter = require('./routes/attendance');

// Use Routes
app.use('/admin', adminRouter);
app.use('/students', studentsRouter);
app.use('/teachers', teachersRouter);
app.use('/classes', classesRouter);
app.use('/parents', parentsRouter);
app.use('/grades', gradesRouter);
app.use('/attendance', attendanceRouter);
app.use('/uploads', express.static('uploads'));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something went wrong!' });
  });

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
  
// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
