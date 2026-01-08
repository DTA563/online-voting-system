const db = require('../config/db');

class Position {
    static async getByElection(electionId) {
        const [rows] = await db.query('SELECT * FROM positions WHERE election_id = ?', [electionId]);
        return rows;
    }

    static async create(electionId, title) {
        const [result] = await db.query(
            'INSERT INTO positions (election_id, title) VALUES (?, ?)',
            [electionId, title]
        );
        return result.insertId;
    }
}

module.exports = Position;