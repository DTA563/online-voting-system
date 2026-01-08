const Vote = require('../models/vote');

exports.castVote = async (req, res) => {
    try {
        const { candidateId, electionId } = req.body;
        const userId = req.user.id; // From Auth Middleware

        // 1. CRITICAL: Check the Master List (Registry)
        const isEligible = await Vote.checkEligibility(userId, electionId);
        if (!isEligible) {
            return res.status(403).json({ 
                message: "Permission Denied: You are not registered to vote in this election." 
            });
        }

        // 2. Check if already voted
        const status = await Vote.checkVoterStatus(userId, electionId);
        if (status && status.has_voted) {
            return res.status(400).json({ message: "You have already cast your vote for this election." });
        }

        // 3. Create a "Time Bucket" (Security feature: round to the nearest hour)
        const now = new Date();
        now.setMinutes(0, 0, 0); // Anonymity: hides the exact second the vote was cast
        const timeBucket = now;

        // 4. Save Vote
        await Vote.castBallot(userId, electionId, candidateId, timeBucket);

        res.json({ status: "success", message: "Vote cast successfully and recorded anonymously." });
    } catch (err) {
        res.status(500).json({ message: "Error processing vote.", error: err.message });
    }
};