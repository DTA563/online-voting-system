const Result = require('../models/result');
const db = require('../config/db');

/**
 * getElectionResults
 * Manages the "Privacy Filter" for real-time results.
 */
exports.getElectionResults = async (req, res) => {
    try {
        const { electionId } = req.params;

        // 1. Fetch Election details
        const [elections] = await db.query('SELECT * FROM elections WHERE election_id = ?', [electionId]);
        const election = elections[0];
        
        if (!election) {
            return res.status(404).json({ message: "Election not found." });
        }

        const now = new Date();
        const endDate = new Date(election.end_date);
        const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super_admin');
        const isOngoing = now < endDate;

        // 2. Always get Turnout Stats (This is public data)
        const stats = await Result.getTurnoutStats(electionId);
        
        const responseData = {
            status: "success",
            electionTitle: election.title,
            isOngoing: isOngoing,
            turnout: {
                totalEligible: stats.total_eligible || 0,
                totalVoted: stats.total_voted || 0,
                percentage: stats.total_eligible > 0 
                    ? ((stats.total_voted / stats.total_eligible) * 100).toFixed(2) 
                    : 0
            }
        };

        // 3. APPLY SECURITY LOCK: Hide candidate tallies if voter views an ongoing election
        if (isOngoing && !isAdmin) {
            // Voter sees that people are voting, but not WHO is winning
            responseData.results = null; 
            responseData.message = "Detailed candidate results are hidden until the election ends to prevent bandwagon bias.";
        } else {
            // Admins or Voters (after end_date) see the full tally
            const tally = await Result.getTallyByElection(electionId);
            responseData.results = tally;
        }

        res.json(responseData);
    } catch (err) {
        res.status(500).json({ message: "Error fetching results.", error: err.message });
    }
};