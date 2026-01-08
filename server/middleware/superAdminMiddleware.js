const superAdminMiddleware = (req, res, next) => {
    // 1. Check if user is logged in (authMiddleware must run first)
    if (!req.user) {
        return res.status(401).json({ message: "Not authorized." });
    }

    // 2. Check Role & Status
    if (req.user.role === 'super_admin' && req.user.status === 'active') {
        next();
    } else {
        return res.status(403).json({ 
            message: "Access Denied: Only active Super Administrators can perform this action." 
        });
    }
};

module.exports = superAdminMiddleware;