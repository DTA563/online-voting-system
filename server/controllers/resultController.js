const Result = require('../models/result');
const db = require('../config/db');

exports.getElectionResults = async (req, res) => {
    try {
        const { electionId } = req.params;

        if (!electionId || electionId === 'undefined') {
            return res.json({ status: "success", data: { total: 0, voted: 0, percentage: 0, results: [] } });
        }
 
        // 1. Fetch Election Info
        const [elections] = await db.query('SELECT * FROM elections WHERE election_id = ?', [electionId]);
        const election = elections[0];
        if (!election) return res.status(404).json({ message: "Election not found" });

        // 2. Fetch Turnout
        const stats = await Result.getTurnoutStats(electionId);
        
        // 3. Authorization & Timing Gate
        const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super_admin');
        const isEnded = new Date() > new Date(election.end_date);
        
        let flatResults = [];
        if (isAdmin || isEnded) {
            flatResults = await Result.getTallyByElection(electionId);
        }

        // 4. TRANSFORM: The "Grouper" Logic
        const groupedMap = {};
        
        flatResults.forEach(row => {
            if (!groupedMap[row.position_id]) {
                groupedMap[row.position_id] = {
                    position_id: row.position_id,
                    position_title: row.position_title,
                    total_votes: 0,
                    candidates: []
                };
            }
            
            groupedMap[row.position_id].total_votes += row.vote_count;
            groupedMap[row.position_id].candidates.push({
                candidate_id: row.candidate_id,
                candidate_name: row.candidate_name,
                photo_url: row.photo_url,
                vote_count: row.vote_count,
                percentage: 0 
            });
        });

        // 5. Calculate percentages and DETECT TIES
        const structuredResults = Object.values(groupedMap).map(pos => {
            // Sort candidates highest to lowest first
            pos.candidates.sort((a, b) => b.vote_count - a.vote_count);

            pos.candidates = pos.candidates.map(cand => ({
                ...cand,
                percentage: pos.total_votes > 0 
                    ? parseFloat(((cand.vote_count / pos.total_votes) * 100).toFixed(1)) 
                    : 0
            }));

            // Tie logic implementation
            pos.is_tie = false;
            // Only check for a tie if votes exist and there are at least 2 candidates
            if (pos.total_votes > 0 && pos.candidates.length >= 2) {
                // Since it's sorted, if index 0 and index 1 have the same votes, it's a tie
                if (pos.candidates[0].vote_count === pos.candidates[1].vote_count) {
                    pos.is_tie = true;
                }
            }

            return pos;
        });

        // 6. Final unified response
        res.json({ 
            status: "success", 
            data: { 
                electionTitle: election.title,
                total: stats.total_eligible || 0,
                voted: stats.total_voted || 0,
                percentage: stats.total_eligible > 0 
                    ? parseFloat(((stats.total_voted / stats.total_eligible) * 100).toFixed(2)) 
                    : 0,
                results: structuredResults 
            } 
        });

    } catch (err) {
        console.error("Results Logic Error:", err.message);
        res.status(500).json({ message: "Internal server error calculating results." });
    }
};