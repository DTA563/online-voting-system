const db = require('../config/db');

class Election {
    /**
     * getAllWithUserStatus
     * Enhanced to include 'total_votes_cast' for the public dashboard.
     */
    static async getAllWithUserStatus(userId) {
        const query = `
            SELECT 
                e.*, 
                -- 1. Check if user is eligible for this specific election
                (SELECT COUNT(*) FROM voter_registry vr WHERE vr.election_id = e.election_id AND vr.user_id = ?) as is_registered,
                -- 2. Check if user has already participated
                IF(vs.has_voted IS NULL, false, vs.has_voted) as user_has_voted,
                -- 3. THE TURNOUT COUNTER: Shows how many people have voted so far (Social Proof)
                (SELECT COUNT(*) FROM votes v WHERE v.election_id = e.election_id) as total_votes_cast
            FROM elections e
            LEFT JOIN voter_status vs ON e.election_id = vs.election_id AND vs.user_id = ?
            WHERE e.is_published = 1
            ORDER BY e.start_date DESC
        `;
        const [rows] = await db.query(query, [userId, userId]);
        return rows;
    }

    static async getAll() {
        const [rows] = await db.query('SELECT * FROM elections ORDER BY created_at DESC');
        return rows;
    }

    static async create(title, startDate, endDate) {
        const [result] = await db.query(
            'INSERT INTO elections (title, start_date, end_date) VALUES (?, ?, ?)',
            [title, startDate, endDate]
        );
        return result.insertId;
    }
}

module.exports = Election;