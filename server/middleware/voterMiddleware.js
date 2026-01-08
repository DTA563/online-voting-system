/*
  Ensures that the authenticated user has the 'voter' role.
  This prevents administrators from participating in the actual ballot casting.
 */
const voterMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'voter') {
        next(); // User is a voter, proceed to the controller
    } else {
        // Access denied for Admins or other roles
        return res.status(403).json({ 
            message: "Access Denied: Administrators are not permitted to cast votes." 
        });
    }
};

module.exports = voterMiddleware;