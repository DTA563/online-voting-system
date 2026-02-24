const db = require('../config/db');

class Candidate {
    /**
     * getByPosition
     */
    static async getByPosition(positionId) {
        const [rows] = await db.query(
            'SELECT * FROM candidates WHERE position_id = ? ORDER BY full_name ASC', 
            [positionId]
        );
        return rows;
    }

    /**
     * getById
     */
    static async getById(candidateId) {
        const [rows] = await db.query('SELECT * FROM candidates WHERE candidate_id = ?', [candidateId]);
        return rows[0];
    }

    /**
     * create
     */
    static async create(fullName, positionId, manifesto, photoUrl) {
        const [result] = await db.query(
            'INSERT INTO candidates (full_name, position_id, manifesto, photo_url) VALUES (?, ?, ?, ?)',
            [fullName, positionId, manifesto, photoUrl]
        );
        return result.insertId;
    }

    /**
     * update
     */
    static async update(candidateId, data) {
        const { full_name, manifesto, photo_url } = data;
        return await db.query(
            'UPDATE candidates SET full_name = ?, manifesto = ?, photo_url = ? WHERE candidate_id = ?',
            [full_name, manifesto, photo_url, candidateId]
        );
    }

    /**
     * delete
     */
    static async delete(candidateId) {
        return await db.query('DELETE FROM candidates WHERE candidate_id = ?', [candidateId]);
    }
}

module.exports = Candidate;