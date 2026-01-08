const db = require('../config/db');

class VoterRegistry {
    // Add a single user to an election's master list
    static async addUser(electionId, userId) {
        const [result] = await db.query(
            'INSERT IGNORE INTO voter_registry (election_id, user_id) VALUES (?, ?)',
            [electionId, userId]
        );
        return result;
    }

    // Bulk add users (useful for uploading a CSV list of student IDs)
    static async addBulk(electionId, userIds) {
        const values = userIds.map(uid => [electionId, uid]);
        const [result] = await db.query(
            'INSERT IGNORE INTO voter_registry (election_id, user_id) VALUES ?',
            [values]
        );
        return result;
    }

    // Check if a user is in the registry for a specific election
    static async isUserRegistered(electionId, userId) {
        const [rows] = await db.query(
            'SELECT * FROM voter_registry WHERE election_id = ? AND user_id = ?',
            [electionId, userId]
        );
        return rows.length > 0;
    }
}

module.exports = VoterRegistry;