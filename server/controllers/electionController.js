const Election = require('../models/election');
const AuditLog = require('../models/auditlog'); // ADDED: Import the AuditLog model

exports.getActiveElection = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // 1. Fetch elections available to this user
        // Note: For voters, this model already filters for is_published = 1
        const elections = await Election.getAllWithUserStatus(userId);
        const now = new Date();

        // 2. Logic: Find the one election that is currently between start and end dates
        const active = elections.find(e => {
            const start = new Date(e.start_date);
            const end = new Date(e.end_date);
            return now >= start && now <= end;
        });

        // 3. Return a clean NULL if no active election exists.
        // This stops VotingBoothPage.tsx from trying to call /status/undefined
        if (!active) {
            return res.json({ status: "success", data: null });
        }

        // 4. Success: Return the single election object
        res.json({ status: "success", data: active });

    } catch (err) {
        console.error("Get Active Election Error:", err.message);
        res.status(500).json({ message: "Internal server error fetching active election" });
    }
};

// getAllElections
// Returns elections wrapped in a 'data' object to match frontend expectations.
exports.getAllElections = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // 1. ADMIN / SUPER ADMIN VIEW
        if (userRole === 'admin' || userRole === 'super_admin') {
            const allElections = await Election.getAll();
            // WRAP IN DATA OBJECT: This fixes the "No elections found" error
            return res.json({ status: "success", data: allElections });
        }

        // 2. VOTER VIEW
        const elections = await Election.getAllWithUserStatus(userId);
        const now = new Date();

        const enrichedElections = elections.map(election => {
            const startDate = new Date(election.start_date);
            const endDate = new Date(election.end_date);
            
            let status = "active";
            let canVote = true;

            if (election.is_registered === 0) {
                status = "ineligible";
                canVote = false;
            } else if (now < startDate) {
                status = "upcoming";
                canVote = false;
            } else if (now > endDate) {
                status = "ended";
                canVote = false;
            } else if (election.user_has_voted) {
                status = "completed";
                canVote = false;
            }

            return { ...election, current_status: status, can_vote: canVote };
        });

        res.json({ status: "success", data: enrichedElections });
    } catch (err) {
        console.error("Get Elections Error:", err.message);
        res.status(500).json({ message: "Error fetching elections" });
    }
};

/**
 * createElection
 */
exports.createElection = async (req, res) => {
    try {
        const { title, start_date, end_date } = req.body;
        const actor = req.user; // Get the user performing the action

        if (!title || !start_date || !end_date) {
            return res.status(400).json({ message: "Missing title or dates." });
        }

        const electionId = await Election.create(title, start_date, end_date);
        
        // ADDED: Log the creation
        await AuditLog.record(actor.id, `Created new election: ${title} (ID: ${electionId})`, req.ip);

        res.status(201).json({ status: "success", data: { election_id: electionId } });
    } catch (err) {
        res.status(500).json({ message: "Failed to create election." });
    }
};

/**
 * updateElection (ADDED TO FIX 404 ERROR)
 */
exports.updateElection = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, start_date, end_date, status } = req.body;
        const actor = req.user; // Get the user performing the action

        if (!title || !start_date || !end_date) {
            return res.status(400).json({ message: "Missing title or dates." });
        }

        await Election.update(id, { title, start_date, end_date, status });
        
        // ADDED: Log the update
        await AuditLog.record(actor.id, `Updated election ID ${id}: ${title}`, req.ip);

        res.json({ status: "success", message: "Election updated successfully." });
    } catch (err) {
        console.error("Update Election Error:", err.message);
        res.status(500).json({ message: "Failed to update election." });
    }
};

/**
 * deleteElection
 */
exports.deleteElection = async (req, res) => {
    try {
        const { id } = req.params;
        const actor = req.user; // Get the user performing the action

        // Ensure you have this method in your Election model
        await Election.delete(id); 
        
        // ADDED: Log the deletion
        await AuditLog.record(actor.id, `Deleted election ID: ${id}`, req.ip);

        res.json({ status: "success", message: "Election deleted." });
    } catch (err) {
        res.status(500).json({ message: "Error deleting election." });
    }
};