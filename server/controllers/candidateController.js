const Candidate = require('../models/candidate');
const AuditLog = require('../models/auditlog'); // ADDED: Import the AuditLog model
const fs = require('fs');
const path = require('path');

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
        const { full_name, fullName, manifesto } = req.body;
        const actor = req.user; // ADDED: Get the user making the change
        
        // Get photo URL from uploaded file or body
        let photo_url = null;
        
        // If file was uploaded via multer
        if (req.file) {
            photo_url = `/uploads/${req.file.filename}`;
        } else {
            // Fallback to body data
            photo_url = req.body.photo_url || req.body.photoUrl;
        }

        const name = full_name || fullName;

        if (!positionId || !name) {
            return res.status(400).json({ message: "Position ID and Full Name are required." });
        }

        const candidateId = await Candidate.create(name, positionId, manifesto, photo_url);
        const newCandidate = await Candidate.getById(candidateId);
        
        // ADDED: Log the creation
        await AuditLog.record(actor.id, `Added candidate '${name}' for position ID ${positionId}`, req.ip);
        
        res.status(201).json({ status: "success", data: newCandidate });
    } catch (err) {
        console.error("Create Candidate Error:", err);
        res.status(500).json({ message: "Error adding candidate." });
    }
};

exports.updateCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, fullName, manifesto } = req.body;
        const actor = req.user; // ADDED: Get the user making the change
        
        // Get existing candidate to check for old photo
        const existingCandidate = await Candidate.getById(id);
        
        // Handle photo update
        let photo_url = req.body.photo_url || req.body.photoUrl;
        
        // If new file was uploaded via multer
        if (req.file) {
            // Delete old photo file if it exists
            if (existingCandidate && existingCandidate.photo_url) {
                const oldPhotoPath = path.join(__dirname, '..', existingCandidate.photo_url);
                if (fs.existsSync(oldPhotoPath)) {
                    fs.unlinkSync(oldPhotoPath);
                }
            }
            photo_url = `/uploads/${req.file.filename}`;
        }

        const updatedName = full_name || fullName;
        const data = {
            full_name: updatedName,
            manifesto: manifesto,
            photo_url: photo_url
        };

        await Candidate.update(id, data);
        const updated = await Candidate.getById(id);

        // ADDED: Log the update. Fallback to existing name if name wasn't changed.
        const logName = updatedName || (existingCandidate ? existingCandidate.full_name : `ID ${id}`);
        await AuditLog.record(actor.id, `Updated candidate '${logName}'`, req.ip);

        res.json({ status: "success", data: updated });
    } catch (err) {
        console.error("Update Candidate Error:", err);
        res.status(500).json({ message: "Error updating candidate." });
    }
};

exports.deleteCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const actor = req.user; // ADDED: Get the user making the change
        
        // Get candidate to delete photo file and grab their name for the log
        const candidate = await Candidate.getById(id);
        
        // Delete photo file if it exists
        if (candidate && candidate.photo_url) {
            const photoPath = path.join(__dirname, '..', candidate.photo_url);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }
        
        await Candidate.delete(id);

        // ADDED: Log the deletion
        const candidateName = candidate ? candidate.full_name : `ID ${id}`;
        await AuditLog.record(actor.id, `Deleted candidate '${candidateName}'`, req.ip);

        res.json({ status: "success", message: "Candidate deleted." });
    } catch (err) {
        console.error("Delete Candidate Error:", err);
        res.status(500).json({ message: "Error deleting candidate." });
    }
};