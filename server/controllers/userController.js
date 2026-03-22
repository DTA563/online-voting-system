const User = require('../models/user');

/**
 * getUsers
 * Get all users with an optional role filter.
 */
exports.getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const users = await User.findAll(role);
        
        res.json({ status: 'success', data: users });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Failed to fetch users", error: err.message });
    }
};

/**
 * verifyUser
 * Sets the is_verified status for a specific user ID.
 */
exports.verifyUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_verified } = req.body;

        if (is_verified === true) {
            await User.verify(id);
            res.json({ status: 'success', message: 'User verified successfully' });
        } else {
            res.status(400).json({ message: "Invalid update operation. Currently, only verification (is_verified: true) is supported." });
        }
    } catch (err) {
        console.error("Error verifying user:", err);
        res.status(500).json({ message: "Failed to verify user" });
    }
};

/**
 * updateUserStatus
 * Suspends or activates a user.
 */
exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'deactivated'].includes(status)) {
            return res.status(400).json({ message: "Invalid status value provided." });
        }

        if (id === req.user.id) {
            return res.status(400).json({ message: "Security Error: You cannot modify your own account status." });
        }

        await User.updateStatus(id, status);

        if (status === 'deactivated') {
            const io = req.app.get('io');
            if (io) {
                const stringId = String(id);
                io.to(stringId).emit('force_logout', { message: "Your access has been revoked by an administrator." });
            }
        }

        res.json({ status: 'success', message: `User status updated to ${status} successfully` });
    } catch (err) {
        console.error("Error updating user status:", err);
        res.status(500).json({ message: "Failed to update user status" });
    }
};

/**
 * deleteUser
 * Completely removes a user from the system.
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Safety: Don't allow an admin to delete themselves via this endpoint
        if (id === req.user.id) {
            return res.status(400).json({ message: "Security Error: You cannot delete your own account." });
        }

        await User.delete(id);

        // KICK OUT THE USER IF THEY ARE LOGGED IN
        // Emit a socket event to the user's specific room
        const io = req.app.get('io');
        if (io) {
            const stringId = String(id);
            io.to(stringId).emit('force_logout', { message: "Your access has been revoked by an administrator." });
        }

        res.json({ status: 'success', message: 'User deleted successfully' });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ message: "Failed to delete user" });
    }
};