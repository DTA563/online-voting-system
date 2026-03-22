const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Ensure we can check user status in DB

// This middleware protects routes. Only users with a valid JWT and active status can pass.
const authMiddleware = async (req, res, next) => {
    // Get token from header (Format: "Bearer <token>")
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Let's verify the user is still active in the database
        const dbUser = await User.findById(decoded.id || decoded.user_id);
        if (!dbUser) {
            return res.status(401).json({ message: "User no longer exists." });
        }
        if (dbUser.status === 'deactivated') {
            return res.status(401).json({ message: "Account deactivated.", status: "deactivated" });
        }

        req.user = decoded; // Add user info (id, role) to the request object
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid." });
    }
};

module.exports = authMiddleware;