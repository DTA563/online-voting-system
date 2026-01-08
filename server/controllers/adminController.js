const db = require('../config/db');
const Election = require('../models/election');
const Position = require('../models/position');
const Candidate = require('../models/candidate');
const User = require('../models/user');
const AuditLog = require('../models/auditlog');
const VoterRegistry = require('../models/voterRegistry');

//  Voter Registry Management

/**
 * registerVoters
 * Allows an Admin to add eligible student IDs to an election.
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

//  Voter View Logic 

/**
 * getElectionDetails
 * Fetches all published elections and calculates eligibility for the current user.
 */
exports.getElectionDetails = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        const elections = await Election.getAllWithUserStatus(userId);
        
        const now = new Date();

        const enrichedElections = elections.map(election => {
            const startDate = new Date(election.start_date);
            const endDate = new Date(election.end_date);
            
            let status = "active";
            let canVote = true;
            let reason = "";

            // Check Master List Eligibility
            if (election.is_registered === 0) {
                status = "ineligible";
                canVote = false;
                reason = "You are not on the official voter register for this election.";
            } else if (now < startDate) {
                status = "upcoming";
                canVote = false;
                reason = "Election has not started yet.";
            } else if (now > endDate) {
                status = "ended";
                canVote = false;
                reason = "Election period has expired.";
            } else if (election.user_has_voted) {
                status = "completed";
                canVote = false;
                reason = "You have already cast your ballot.";
            }

            return {
                ...election,
                current_status: status,
                can_vote: canVote,
                eligibility_reason: reason
            };
        });

        res.json(enrichedElections);
    } catch (err) {
        res.status(500).json({ message: "Error fetching election details", error: err.message });
    }
};

//  System Management 

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

        // 1. Prevent self-lockout
        if (targetUserId === actor.id && (newRole !== 'super_admin' || newStatus === 'deactivated')) {
            return res.status(400).json({ message: "You cannot demote or deactivate yourself." });
        }

        // 2. Role-Based Hierarchy
        if (actor.role === 'admin') {
            if (targetUser.role === 'admin' || targetUser.role === 'super_admin') {
                return res.status(403).json({ message: "Admins cannot modify other staff accounts." });
            }
        }

        // 3. Super Admin Protections
        if (targetUser.role === 'super_admin' && actor.role !== 'super_admin') {
            return res.status(403).json({ message: "Only a Super Admin can modify another Super Admin." });
        }

        //  EXECUTE & LOG 
        if (newRole) await User.updateRole(targetUserId, newRole);
        
        if (newStatus) {
            await db.query('UPDATE users SET status = ? WHERE user_id = ?', [newStatus, targetUserId]);
        }

        const actionMessage = `Changed ${targetUserId} to ${newRole || targetUser.role} (${newStatus || targetUser.status})`;
        await AuditLog.record(actor.id, actionMessage, req.ip);

        res.json({ status: "success", message: "User updated and action logged." });
    } catch (err) {
        res.status(500).json({ message: "Error in management logic.", error: err.message });
    }
};

exports.getSystemLogs = async (req, res) => {
    try {
        const logs = await AuditLog.getAll();
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: "Error fetching logs.", error: err.message });
    }
};

//  Election Content Management 

exports.createElection = async (req, res) => {
    try {
        const { title, startDate, endDate } = req.body;
        const electionId = await Election.create(title, startDate, endDate);
        res.status(201).json({ message: "Election created", electionId });
    } catch (err) {
        res.status(500).json({ message: "Error creating election", error: err.message });
    }
};

exports.addCandidate = async (req, res) => {
    try {
        const { fullName, positionId, manifesto, photoUrl } = req.body;
        const candidateId = await Candidate.create(fullName, positionId, manifesto, photoUrl);
        res.status(201).json({ message: "Candidate added", candidateId });
    } catch (err) {
        res.status(500).json({ message: "Error adding candidate", error: err.message });
    }
};