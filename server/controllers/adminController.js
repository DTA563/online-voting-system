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

/**
 * getDashboardStats
 * Returns aggregated statistics for the admin dashboard.
 */
exports.getDashboardStats = async (req, res) => {
    try {
        // 1. User Stats
        const [roleCounts] = await db.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
        const [pendingCount] = await db.query('SELECT COUNT(*) as count FROM users WHERE is_verified = 0');
        
        const userStats = roleCounts.reduce((acc, row) => {
            acc[row.role] = row.count;
            return acc;
        }, {});

        // 2. Election Stats
        const [electionCounts] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_published = 1 AND start_date <= NOW() AND end_date >= NOW() THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN end_date < NOW() THEN 1 ELSE 0 END) as completed
            FROM elections
        `);

        res.json({
            status: "success",
            data: { // Add this wrapper
                users: {
                    by_role: userStats,
                    pending: pendingCount[0].count
                },
                elections: {
                    total: electionCounts[0].total || 0,
                    active: electionCounts[0].active || 0,
                    completed: electionCounts[0].completed || 0
                }
            }
        });

    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json({ message: "Error fetching dashboard stats", error: err.message });
    }
};