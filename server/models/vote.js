const db = require('../config/db');

class Vote {
    static async checkVoterStatus(userId, electionId) {
        const [rows] = await db.query(
            'SELECT has_voted, voted_at FROM voter_status WHERE user_id = ? AND election_id = ?',
            [userId, electionId]
        );
        return rows[0];
    }

    static async checkEligibility(userId, electionId) {
        const [rows] = await db.query(
            'SELECT * FROM voter_registry WHERE user_id = ? AND election_id = ?',
            [userId, electionId]
        );
        return rows.length > 0;
    }

    /**
     * castBallot
     * Records multiple position selections in a single atomic transaction.
     * Arguments: (userId, electionId, votesArray, timeBucket)
     */
    static async castBallot(userId, electionId, votesArray, timeBucket) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Insert each selection into the anonymous 'votes' table
            for (const choice of votesArray) {
                await connection.query(
                    'INSERT INTO votes (candidate_id, election_id, vote_hour) VALUES (?, ?, ?)',
                    [choice.candidate_id, electionId, timeBucket]
                );
            }

            // 2. Record the user's participation in 'voter_status'
            await connection.query(
                'INSERT INTO voter_status (user_id, election_id, has_voted, voted_at) VALUES (?, ?, true, NOW()) ON DUPLICATE KEY UPDATE has_voted = true, voted_at = NOW()',
                [userId, electionId]
            );

            await connection.commit();
            return true;
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }
}

module.exports = Vote;