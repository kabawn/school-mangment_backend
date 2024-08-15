// src/server.js
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const auth = require('./middleware/auth');
const authRole = require('./middleware/role');
const classRoutes = require('./routes/classRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');  // Add this line

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/users', userRoutes);
// Serve static files from the 'uploads' directory
console.log('Serving static files from:', path.join(__dirname, 'uploads'));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.get('/api/protected', auth, (req, res) => {
    res.send({ message: 'You have access to this protected route!', user: req.user });
});

app.post('/api/grades', auth, authRole('teacher'), (req, res) => {
    // Logic to add grades
    res.send({ message: 'Grade added successfully!' });
});
// Connect Database
connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the School Management System API');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
