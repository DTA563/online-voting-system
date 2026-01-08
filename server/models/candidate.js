const db = require('../config/db');

class Candidate {
    static async getByPosition(positionId) {
        const [rows] = await db.query('SELECT * FROM candidates WHERE position_id = ?', [positionId]);
        return rows;
    }

    static async create(fullName, positionId, manifesto, photoUrl) {
        const [result] = await db.query(
            'INSERT INTO candidates (full_name, position_id, manifesto, photo_url) VALUES (?, ?, ?, ?)',
            [fullName, positionId, manifesto, photoUrl]
        );
        return result.insertId;
    }
}

module.exports = Candidate;