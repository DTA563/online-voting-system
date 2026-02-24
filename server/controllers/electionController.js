const Election = require('../models/Election');

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
        console.error("❌ Get Elections Error:", err.message);
        res.status(500).json({ message: "Error fetching elections" });
    }
};

/**
 * createElection
 */
exports.createElection = async (req, res) => {
    try {
        const { title, start_date, end_date } = req.body;
        if (!title || !start_date || !end_date) {
            return res.status(400).json({ message: "Missing title or dates." });
        }
        const electionId = await Election.create(title, start_date, end_date);
        res.status(201).json({ status: "success", data: { election_id: electionId } });
    } catch (err) {
        res.status(500).json({ message: "Failed to create election." });
    }
};

/**
 * deleteElection
 */
exports.deleteElection = async (req, res) => {
    try {
        const { id } = req.params;
        // Ensure you have this method in your Election model
        await Election.delete(id); 
        res.json({ status: "success", message: "Election deleted." });
    } catch (err) {
        res.status(500).json({ message: "Error deleting election." });
    }
};