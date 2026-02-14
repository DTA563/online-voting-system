const Candidate = require('../models/Candidate');
const Position = require('../models/Position');

/**
  getCandidatesByElection
  Fetches all candidates grouped by their positions for a specific election.
 */
exports.getCandidatesByElection = async (req, res) => {
    try {
        const { electionId } = req.params;
        
        // 1. Get all positions for this election
        const [positions] = await db.query('SELECT * FROM positions WHERE election_id = ?', [electionId]);
        
        // 2. For each position, get the candidates
        const results = await Promise.all(positions.map(async (pos) => {
            const [candidates] = await db.query('SELECT * FROM candidates WHERE position_id = ?', [pos.position_id]);
            return {
                position: pos.title,
                position_id: pos.position_id,
                candidates: candidates
            };
        }));

        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Error fetching candidates", error: err.message });
    }
};

// addCandidate (Admin Only)
exports.addCandidate = async (req, res) => {
    try {
        const { fullName, positionId, manifesto, photoUrl } = req.body;
        const candidateId = await Candidate.create(fullName, positionId, manifesto, photoUrl);
        res.status(201).json({ message: "Candidate added", candidateId });
    } catch (err) {
        res.status(500).json({ message: "Error adding candidate", error: err.message });
    }
};