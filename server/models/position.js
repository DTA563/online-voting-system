const db = require('../config/db');

class Position {
    /**
     * getByElection
     */
    static async getByElection(electionId) {
        const [rows] = await db.query(
            'SELECT * FROM positions WHERE election_id = ? ORDER BY position_id ASC', 
            [electionId]
        );
        return rows;
    }

    /**
     * getById
     */
    static async getById(positionId) {
        const [rows] = await db.query('SELECT * FROM positions WHERE position_id = ?', [positionId]);
        return rows[0];
    }

    /**
     * create
     */
    static async create(electionId, title) {
        const [result] = await db.query(
            'INSERT INTO positions (election_id, title) VALUES (?, ?)',
            [electionId, title]
        );
        return result.insertId;
    }

    /**
     * update
     */
    static async update(positionId, title) {
        return await db.query(
            'UPDATE positions SET title = ? WHERE position_id = ?',
            [title, positionId]
        );
    }

    /**
     * delete
     */
    static async delete(positionId) {
        return await db.query('DELETE FROM positions WHERE position_id = ?', [positionId]);
    }
}

module.exports = Position;