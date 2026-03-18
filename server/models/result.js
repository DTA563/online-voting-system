const db = require('../config/db');

class Result {
    /**
     * getTallyByElection
     * Updated: Now includes position_id for more accurate grouping.
     */
    static async getTallyByElection(electionId) {
        const query = `
            SELECT 
                p.position_id,
                p.title AS position_title,
                c.full_name AS candidate_name,
                c.candidate_id,
                c.photo_url,
                COUNT(v.vote_id) AS vote_count
            FROM positions p
            JOIN candidates c ON p.position_id = c.position_id
            LEFT JOIN votes v ON c.candidate_id = v.candidate_id
            WHERE p.election_id = ?
            GROUP BY p.position_id, c.candidate_id
            ORDER BY p.position_id, vote_count DESC
        `;
        const [rows] = await db.query(query, [electionId]);
        return rows;
    }

    /**
     * getTurnoutStats
     */
    static async getTurnoutStats(electionId) {
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM voter_registry WHERE election_id = ?) AS total_eligible,
                (SELECT COUNT(*) FROM voter_status WHERE election_id = ? AND has_voted = true) AS total_voted
        `;
        const [rows] = await db.query(query, [electionId, electionId]);
        return rows[0] || { total_eligible: 0, total_voted: 0 };
    }
}

module.exports = Result;