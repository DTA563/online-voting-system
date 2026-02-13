const User = require('../models/user');

// Get all users (with optional role filter)
exports.getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const users = await User.findAll(role);
        
        // Wrap in standard response format
        res.json({ status: 'success', data: users });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Failed to fetch users", error: err.message });
    }
};

// Verify a user
exports.verifyUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_verified } = req.body;

        if (is_verified === true) {
            await User.verify(id);
            res.json({ status: 'success', message: 'User verified successfully' });
        } else {
            // If we want to support un-verifying, we'd need a method for that.
            // For now, assuming only verification is requested based on current usage.
             res.status(400).json({ message: "Invalid update operation" });
        }
    } catch (err) {
        console.error("Error verifying user:", err);
        res.status(500).json({ message: "Failed to verify user" });
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.delete(id);
        res.json({ status: 'success', message: 'User deleted successfully' });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ message: "Failed to delete user" });
    }
};
