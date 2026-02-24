const Candidate = require('../models/candidate');

/**
 * getCandidates
 * Handles both /api/candidates?position_id=X and /api/positions/:id/candidates
 */
exports.getCandidates = async (req, res) => {
    try {
        const positionId = req.params.positionId || req.query.position_id;
        
        if (!positionId) {
            return res.status(400).json({ message: "Position ID is required." });
        }

        const candidates = await Candidate.getByPosition(positionId);
        res.json({ status: "success", data: candidates });
    } catch (err) {
        console.error("Fetch Candidates Error:", err.message);
        res.status(500).json({ message: "Error fetching candidates." });
    }
};

exports.getCandidateById = async (req, res) => {
    try {
        const { id } = req.params;
        const candidate = await Candidate.getById(id);
        if (!candidate) return res.status(404).json({ message: "Candidate not found." });
        res.json({ status: "success", data: candidate });
    } catch (err) {
        res.status(500).json({ message: "Error fetching candidate." });
    }
};

exports.createCandidate = async (req, res) => {
    try {
        const positionId = req.params.positionId || req.body.position_id;
        const { full_name, fullName, manifesto, photo_url, photoUrl } = req.body;

        const name = full_name || fullName;
        const photo = photo_url || photoUrl;

        if (!positionId || !name) {
            return res.status(400).json({ message: "Position ID and Full Name are required." });
        }

        const candidateId = await Candidate.create(name, positionId, manifesto, photo);
        const newCandidate = await Candidate.getById(candidateId);
        
        res.status(201).json({ status: "success", data: newCandidate });
    } catch (err) {
        res.status(500).json({ message: "Error adding candidate." });
    }
};

exports.updateCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, fullName, manifesto, photo_url, photoUrl } = req.body;

        const data = {
            full_name: full_name || fullName,
            manifesto: manifesto,
            photo_url: photo_url || photoUrl
        };

        await Candidate.update(id, data);
        const updated = await Candidate.getById(id);
        res.json({ status: "success", data: updated });
    } catch (err) {
        res.status(500).json({ message: "Error updating candidate." });
    }
};

exports.deleteCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        await Candidate.delete(id);
        res.json({ status: "success", message: "Candidate deleted." });
    } catch (err) {
        res.status(500).json({ message: "Error deleting candidate." });
    }
};