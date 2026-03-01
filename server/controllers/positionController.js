const Position = require('../models/position');
const AuditLog = require('../models/auditlog'); // ADDED: Import the AuditLog model

/**
 * getPositions
 * Handles both /api/positions?election_id=X and /api/elections/:id/positions
 */
exports.getPositions = async (req, res) => {
    try {
        const electionId = req.params.electionId || req.query.election_id;
        
        if (!electionId) {
            return res.status(400).json({ message: "Election ID is required." });
        }

        const positions = await Position.getByElection(electionId);
        res.json({ status: "success", data: positions });
    } catch (err) {
        res.status(500).json({ message: "Error fetching positions." });
    }
};

exports.getPositionById = async (req, res) => {
    try {
        const { id } = req.params;
        const position = await Position.getById(id);
        if (!position) return res.status(404).json({ message: "Position not found." });
        res.json({ status: "success", data: position });
    } catch (err) {
        res.status(500).json({ message: "Error fetching position." });
    }
};

exports.createPosition = async (req, res) => {
    try {
        const electionId = req.params.electionId || req.body.election_id;
        const { title } = req.body;
        const actor = req.user; // ADDED: Get the user making the change

        if (!electionId || !title) {
            return res.status(400).json({ message: "Election ID and Title are required." });
        }

        const positionId = await Position.create(electionId, title);
        const newPosition = await Position.getById(positionId);
        
        // ADDED: Log the creation
        await AuditLog.record(actor.id, `Created position '${title}' for election ID ${electionId}`, req.ip);
        
        res.status(201).json({ status: "success", data: newPosition });
    } catch (err) {
        res.status(500).json({ message: "Error creating position." });
    }
};

exports.updatePosition = async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        const actor = req.user; // ADDED: Get the user making the change

        await Position.update(id, title);
        const updated = await Position.getById(id);

        // ADDED: Log the update
        await AuditLog.record(actor.id, `Updated position ID ${id} to '${title}'`, req.ip);

        res.json({ status: "success", data: updated });
    } catch (err) {
        res.status(500).json({ message: "Error updating position." });
    }
};

exports.deletePosition = async (req, res) => {
    try {
        const { id } = req.params;
        const actor = req.user; // ADDED: Get the user making the change

        await Position.delete(id);

        // ADDED: Log the deletion
        await AuditLog.record(actor.id, `Deleted position ID ${id}`, req.ip);

        res.json({ status: "success", message: "Position deleted." });
    } catch (err) {
        res.status(500).json({ message: "Error deleting position." });
    }
};