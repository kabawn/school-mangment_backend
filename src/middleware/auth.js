// src/middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // Get token from the request header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).send({ error: 'Authentication required' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info (e.g., userId, role) to the request object
        next();
    } catch (err) {
        res.status(401).send({ error: 'Invalid token' });
    }
};

module.exports = auth;
