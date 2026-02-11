const db = require('../config/db');
const User = require('../models/user');
const AuditLog = require('../models/auditlog');
const VoterRegistry = require('../models/voterRegistry');

// Voter Registry Management

/**
 * registerVoters
 * Allows an Admin to add eligible student IDs to an election's master list.
 */
exports.registerVoters = async (req, res) => {
    try {
        const { electionId, userIds } = req.body; 

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: "Please provide a valid list of User IDs." });
        }

        await VoterRegistry.addBulk(electionId, userIds);

        // Record to Audit Log for transparency
        await AuditLog.record(
            req.user.id, 
            `Registered ${userIds.length} users for election ID: ${electionId}`, 
            req.ip
        );

        res.json({ status: "success", message: `Successfully registered ${userIds.length} users for this election.` });
    } catch (err) {
        res.status(500).json({ message: "Error registering voters", error: err.message });
    }
};

//  System Management 

/**
 * manageUserRole
 * Handles promotions, demotions, and account deactivation.
 * This is restricted to Super Admins and high-level Admins.
 */
exports.manageUserRole = async (req, res) => {
    try {
        const { targetUserId, newRole, newStatus } = req.body;
        const actor = req.user; 

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) return res.status(404).json({ message: "Target user not found." });

        // 1. Prevent self-lockout
        if (targetUserId === actor.id && (newRole !== 'super_admin' || newStatus === 'deactivated')) {
            return res.status(400).json({ message: "Safety Error: You cannot demote or deactivate yourself." });
        }

        // 2. Role-Based Hierarchy
        if (actor.role === 'admin') {
            // Standard Admins CANNOT touch other staff (Admins or Super Admins)
            if (targetUser.role === 'admin' || targetUser.role === 'super_admin') {
                return res.status(403).json({ message: "Permission Denied: Admins cannot modify other staff accounts." });
            }
        }

        // 3. Super Admin Protections
        if (targetUser.role === 'super_admin' && actor.role !== 'super_admin') {
            return res.status(403).json({ message: "Permission Denied: Only a Super Admin can modify another Super Admin." });
        }

        // EXECUTE UPDATE
        if (newRole) await User.updateRole(targetUserId, newRole);
        
        if (newStatus) {
            await db.query('UPDATE users SET status = ? WHERE user_id = ?', [newStatus, targetUserId]);
        }

        // RECORD TO AUDIT LOG (Critical for transparency)
        const actionMessage = `Modified user ${targetUserId}: Role -> ${newRole || targetUser.role}, Status -> ${newStatus || targetUser.status}`;
        await AuditLog.record(actor.id, actionMessage, req.ip);

        res.json({ status: "success", message: "User account updated and action logged." });
    } catch (err) {
        res.status(500).json({ message: "Error in management logic.", error: err.message });
    }
};

/**
 * getSystemLogs
 * Fetches the audit trail for Super Admin review.
 */
exports.getSystemLogs = async (req, res) => {
    try {
        const logs = await AuditLog.getAll();
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: "Error fetching audit logs.", error: err.message });
    }
};