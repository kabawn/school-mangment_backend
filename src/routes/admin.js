const express = require('express');
const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

// Admin registration
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this username already exists' });
    }
    const admin = new Admin({ username, password, email });
    await admin.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // `identifier` can be either username or email
    const admin = await Admin.findOne({ 
      $or: [{ username: identifier }, { email: identifier }] 
    });
    
    if (!admin) {
      return res.status(400).json({ message: 'Invalid username or email, and password' });
    }
    
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or email, and password' });
    }
    
    const token = jwt.sign({ id: admin._id, role: admin.role }, 'secretkey', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
