const Vote = require('../models/vote');

/**
 * checkVoterStatus
 * Handles the handshake to see if a voter is eligible and has already participated.
 */
exports.checkVoterStatus = async (req, res) => {
    try {
        const { electionId } = req.params;
        const userId = req.user.id;

        // Silent guard for race conditions. 
        if (!electionId || electionId === 'undefined' || electionId === 'null') {
            return res.json({ status: "success", data: { has_voted: false } });
        }

        // 1. NEW: Check if they are actually on the voter roll for this election
        const isEligible = await Vote.checkEligibility(userId, electionId);
        if (!isEligible) {
            // Throw a 403 so the frontend Axios catch block knows to skip this election
            return res.status(403).json({ message: "User is not registered for this election." });
        }

        // 2. If they are eligible, check if they have cast a ballot yet
        const status = await Vote.checkVoterStatus(userId, electionId);
        res.json({ 
            status: "success", 
            data: { 
                has_voted: !!status?.has_voted, 
                voted_at: status?.voted_at || null 
            } 
        });
    } catch (err) {
        console.error("Voter Status Check Crash:", err.message);
        res.status(500).json({ message: "Database error checking status." });
    }
};

/**
 * castVote
 * Handles the submission of a full ballot (multiple positions).
 */
exports.castVote = async (req, res) => {
    try {
        // Extracted election_id (snake_case) to match frontend payload
        const { election_id, votes } = req.body;
        const userId = req.user.id;

        if (!election_id || !votes || !Array.isArray(votes)) {
            return res.status(400).json({ message: "Invalid ballot format received." });
        }

        // 1. Eligibility Check
        const isEligible = await Vote.checkEligibility(userId, election_id);
        if (!isEligible) {
            return res.status(403).json({ message: "You are not registered for this election." });
        }

        // 2. Duplicate Prevention
        const status = await Vote.checkVoterStatus(userId, election_id);
        if (status && status.has_voted) {
            return res.status(400).json({ message: "Your ballot has already been cast." });
        }

        // 3. Secure Time Bucketing
        const timeBucket = new Date();
        timeBucket.setMinutes(0, 0, 0);

        // 4. Record Multi-Position Ballot
        await Vote.castBallot(userId, election_id, votes, timeBucket);

        // 5. Emit Socket Event for Real-Time Turnout Updates
        const io = req.app.get('io');
        if (io) {
            io.emit('turnout_update', { election_id });
        }

        res.json({ status: "success", data: { message: "Ballot cast successfully." } });

    } catch (err) {
        console.error("🔥 Cast Vote Crash:", err.message);
        res.status(500).json({ message: "Internal server error during submission." });
    }
};