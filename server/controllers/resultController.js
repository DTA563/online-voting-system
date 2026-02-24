const Result = require('../models/Result');
const db = require('../config/db');

/**
 * getElectionResults
 * Aligned with frontend votes.api.ts expectations
 */
exports.getElectionResults = async (req, res) => {
    try {
        const { electionId } = req.params;

        if (!electionId || electionId === 'undefined') {
            return res.json({ 
                status: "success", 
                data: { total: 0, voted: 0, percentage: 0 } 
            });
        }

        const [elections] = await db.query('SELECT * FROM elections WHERE election_id = ?', [electionId]);
        const election = elections[0];
        
        if (!election) return res.status(404).json({ message: "Election not found" });

        const stats = await Result.getTurnoutStats(electionId);
        
        // FORMATTING: Using keys 'total', 'voted', 'percentage' to match frontend
        const turnoutData = {
            total: stats.total_eligible || 0,
            voted: stats.total_voted || 0,
            percentage: stats.total_eligible > 0 
                ? parseFloat(((stats.total_voted / stats.total_eligible) * 100).toFixed(2)) 
                : 0
        };

        // If admin, we also attach the candidate results
        const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super_admin');
        let results = [];
        if (isAdmin || new Date() > new Date(election.end_date)) {
            results = await Result.getTallyByElection(electionId);
        }

        res.json({ 
            status: "success", 
            data: { 
                ...turnoutData, 
                electionTitle: election.title,
                results: results 
            } 
        });

    } catch (err) {
        console.error("Result Error:", err.message);
        res.status(500).json({ message: "Error fetching results" });
    }
};