const db = require('../config/db');

class Election {
    static async getAllWithUserStatus(userId) {
        const query = `
            SELECT 
                e.*, 
                (SELECT COUNT(*) FROM voter_registry vr WHERE vr.election_id = e.election_id AND vr.user_id = ?) as is_registered,
                IF(vs.has_voted IS NULL, false, vs.has_voted) as user_has_voted,
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

    // ADDED: Update method mapping 'status' to 'is_published'
    static async update(electionId, data) {
        const { title, start_date, end_date, status } = data;
        
        // Convert frontend string status to database tinyint/boolean
        // Sets to 1 (true) if 'active' or 'upcoming', else 0 (false)
        const is_published = (status === 'active' || status === 'upcoming') ? 1 : 0;

        const query = `
            UPDATE elections 
            SET title = ?, start_date = ?, end_date = ?, is_published = ? 
            WHERE election_id = ?
        `;
        
        const [result] = await db.query(query, [title, start_date, end_date, is_published, electionId]);
        return result;
    }

    // ADDED: Delete method for the manage page
    static async delete(electionId) {
        return await db.query('DELETE FROM elections WHERE election_id = ?', [electionId]);
    }
}

module.exports = Election;