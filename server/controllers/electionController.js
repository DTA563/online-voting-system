const Election = require('../models/Election');

/**
 * getAllElections
 * Fetches all published elections and calculates real-time eligibility 
 * and turnout for the current user.
 */
exports.getAllElections = async (req, res) => {
    try {
        const userId = req.user.id;
        const elections = await Election.getAllWithUserStatus(userId);
        
        const now = new Date();

        const enrichedElections = elections.map(election => {
            const startDate = new Date(election.start_date);
            const endDate = new Date(election.end_date);
            
            let status = "active";
            let canVote = true;
            let reason = "";

            if (election.is_registered === 0) {
                status = "ineligible";
                canVote = false;
                reason = "Not on the official register.";
            } else if (now < startDate) {
                status = "upcoming";
                canVote = false;
                reason = "Has not started.";
            } else if (now > endDate) {
                status = "ended";
                canVote = false;
                reason = "Election closed.";
            } else if (election.user_has_voted) {
                status = "completed";
                canVote = false;
                reason = "Ballot already cast.";
            }

            return { ...election, current_status: status, can_vote: canVote, eligibility_reason: reason };
        });

        res.json(enrichedElections);
    } catch (err) {
        res.status(500).json({ message: "Error fetching elections", error: err.message });
    }
};

/**
 * createElection (Admin Only)
 */
exports.createElection = async (req, res) => {
    try {
        const { title, startDate, endDate } = req.body;
        const electionId = await Election.create(title, startDate, endDate);
        res.status(201).json({ message: "Election created", electionId });
    } catch (err) {
        res.status(500).json({ message: "Error creating election", error: err.message });
    }
};