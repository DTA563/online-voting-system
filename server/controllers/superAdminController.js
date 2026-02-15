const db = require('../config/db');
const User = require('../models/user');
const AuditLog = require('../models/auditlog');
const bcrypt = require('bcryptjs');

/**
 * getAllUsers
 * Returns a list of users with details (for Super Admin management).
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json({ status: "success", data: users });
    } catch (err) {
        res.status(500).json({ message: "Error fetching users.", error: err.message });
    }
};

/**
 * manageUserRole
 * Handles promotions, demotions, and account deactivation.
 */
exports.manageUserRole = async (req, res) => {
    try {
        const { targetUserId, newRole, newStatus } = req.body;
        const actor = req.user; 

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) return res.status(404).json({ message: "Target user not found." });

        // Prevent self-lockout
        if (targetUserId === actor.id) {
            return res.status(400).json({ message: "Safety Error: You cannot modify your own administrative status." });
        }

        // Execute Role Update
        if (newRole) await User.updateRole(targetUserId, newRole);
        
        // Execute Status Update
        if (newStatus) {
            await db.query('UPDATE users SET status = ? WHERE user_id = ?', [newStatus, targetUserId]);
        }

        const actionMessage = `Modified user ${targetUserId}: Role -> ${newRole || 'unchanged'}, Status -> ${newStatus || 'unchanged'}`;
        await AuditLog.record(actor.id, actionMessage, req.ip);

        res.json({ status: "success", message: "User account updated and action logged." });
    } catch (err) {
        res.status(500).json({ message: "Error in management logic.", error: err.message });
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

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) return res.status(404).json({ message: "User not found." });

        // Security check: Only Super Admin can touch other Super Admin accounts
        if (targetUser.role === 'super_admin' && actor.role !== 'super_admin') {
            return res.status(403).json({ message: "Only Super Admins can reset other Super Admin passwords." });
        }

        const tempPassword = "ChangeMe123!";
        const hashedPassword = await bcrypt.hash(tempPassword, SALT_ROUNDS);

        await db.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [hashedPassword, targetUserId]);

        await AuditLog.record(actor.id, `Reset password for user: ${targetUserId}`, req.ip);

        res.json({ status: "success", message: `Password reset to default: ${tempPassword}` });

    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ message: "Error resetting password.", error: err.message });
    }
};

/**
 * getSystemLogs
 * Fetches the audit trail for Super Admin review.
 */
exports.getSystemLogs = async (req, res) => {
    try {
        const logs = await AuditLog.getAll();
        res.json({ status: "success", data: logs });
    } catch (err) {
        res.status(500).json({ message: "Error fetching audit logs.", error: err.message });
    }
};