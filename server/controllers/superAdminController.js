const db = require('../config/db');
const User = require('../models/user');
const AuditLog = require('../models/auditlog');
const bcrypt = require('bcryptjs');

/**
 * getAllUsers
 * Returns a list of users with details (for Super Admin).
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users.", error: err.message });
    }
};

/**
 * resetUserPassword
 * Resets a user's password to a default temporary one.
 */
exports.resetUserPassword = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const actor = req.user;
        const SALT_ROUNDS = 10;

        // Security check
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) return res.status(404).json({ message: "User not found." });

        if (targetUser.role === 'super_admin' && actor.role !== 'super_admin') {
            return res.status(403).json({ message: "Only Super Admins can reset Super Admin passwords." });
        }

        if (actor.role === 'admin' && (targetUser.role === 'admin' || targetUser.role === 'super_admin')) {
             return res.status(403).json({ message: "Admins cannot modify staff accounts." });
        }

        // Generate hash for 'ChangeMe123!'
        const tempPassword = "ChangeMe123!";
        const hashedPassword = await bcrypt.hash(tempPassword, SALT_ROUNDS);

        await db.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [hashedPassword, targetUserId]);

        await AuditLog.record(actor.id, `Reset password for ${targetUserId}`, req.ip);

        res.json({ status: "success", message: `Password reset to: ${tempPassword}` });

    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ message: "Error resetting password.", error: err.message });
    }
};
