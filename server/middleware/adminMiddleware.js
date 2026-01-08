// This middleware assumes the authMiddleware has already run and attached req.user
const adminMiddleware = (req, res, next) => {
    // Check if the user exists and if their role is 'admin'
    if (req.user && req.user.role === 'admin') {
        next(); // User is an admin, proceed to the controller
    } else {
        // Access denied
        return res.status(403).json({ 
            message: "Access Denied: Admin privileges required." 
        });
    }
};

module.exports = adminMiddleware;