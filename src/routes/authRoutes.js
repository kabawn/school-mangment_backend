const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/email'); // Import the sendEmail function

const router = express.Router();

// Route for user login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Step 1: Find the user by email in the database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        console.log('User found:', user);

        // Step 2: Compare the provided password with the hashed password in the database
        const isMatch = await user.comparePassword(password);
        console.log('Password comparison result:', isMatch);

        // Step 3: If passwords do not match, return an error
        if (!isMatch) {
            return res.status(400).send({ error: 'Invalid credentials' });
        }

        // Step 4: If passwords match, generate a JWT token
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h', // Token expires in 1 hour
        });

        // Step 5: Send the JWT token and user information as a response
        res.send({ token, user });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(400).send({ error: 'Error logging in' });
    }
});

// Route to request a password reset
router.post('/reset-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Step 1: Find the user by email in the database
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Step 2: Generate a reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // Token is valid for 1 hour

        // Step 3: Save the reset token and expiration time to the user document
        await user.save();

        // Step 4: Send the reset token via email with a link to reset the password
        const resetUrl = `http://localhost:5000/api/auth/reset-password/${resetToken}`;
        await sendEmail(
            user.email,
            'Password Reset Request',
            `You requested a password reset. Please click the following link to reset your password: ${resetUrl}`
        );

        // Step 5: Respond with a message indicating that the reset email has been sent
        res.send({ message: 'Password reset email sent' });
    } catch (err) {
        res.status(500).send({ error: 'Error processing password reset request', details: err.message });
    }
});

// Route to reset the password using a reset token
router.post('/reset-password/:token', async (req, res) => {
    try {
        // Step 1: Find the user by the reset token and ensure the token is still valid
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }, // Token must not be expired
        });

        if (!user) {
            return res.status(400).send({ error: 'Password reset token is invalid or has expired' });
        }

        // Step 2: Hash the new password provided by the user
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Step 3: Update the user's password and clear the reset token and expiration
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        // Step 4: Save the updated user document
        await user.save();

        // Step 5: Respond with a message indicating that the password has been reset successfully
        res.send({ message: 'Password has been reset successfully' });
    } catch (err) {
        res.status(500).send({ error: 'Error resetting password', details: err.message });
    }
});

// Route to change the password (requires authentication)
router.post('/change-password', auth, async (req, res) => {
    try {
        // Step 1: Find the authenticated user by their ID
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Step 2: Check if the current password provided matches the stored password
        const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).send({ error: 'Incorrect current password' });
        }

        // Step 3: Hash the new password provided by the user
        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

        // Step 4: Update the user's password in the database
        user.password = hashedPassword;

        // Step 5: Save the updated user document
        await user.save();

        // Step 6: Respond with a message indicating that the password has been changed successfully
        res.send({ message: 'Password has been changed successfully' });
    } catch (err) {
        res.status(500).send({ error: 'Error changing password', details: err.message });
    }
});

module.exports = router;
