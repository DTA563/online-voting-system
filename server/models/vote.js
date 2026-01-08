const db = require('../config/db');

class Vote {
    // 1. Check if a user has already voted in a specific election
    static async checkVoterStatus(userId, electionId) {
        const [rows] = await db.query(
            'SELECT has_voted FROM voter_status WHERE user_id = ? AND election_id = ?',
            [userId, electionId]
        );
        return rows[0];
    }

    // 2. Check if user is in the election's master list
    static async checkEligibility(userId, electionId) {
        const [rows] = await db.query(
            'SELECT * FROM voter_registry WHERE user_id = ? AND election_id = ?',
            [userId, electionId]
        );
        return rows.length > 0;
    }

    // 3. Cast a vote (Atomic Operation)
    static async castBallot(userId, electionId, candidateId, timeBucket) {
        // We use a transaction to ensure both operations succeed or both fail
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // A. Record the anonymous vote
            await connection.query(
                'INSERT INTO votes (candidate_id, vote_hour) VALUES (?, ?)',
                [candidateId, timeBucket]
            );

            // B. Update the user's status to 'voted'
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