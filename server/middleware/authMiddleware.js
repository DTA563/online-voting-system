const jwt = require('jsonwebtoken');

// This middleware protects routes. Only users with a valid JWT can pass.
const authMiddleware = (req, res, next) => {
    // Get token from header (Format: "Bearer <token>")
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add user info (id, role) to the request object
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid." });
    }
};

module.exports = authMiddleware;