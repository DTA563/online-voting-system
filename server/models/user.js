const db = require('../config/db');

class User {
    // Find a user by their Student ID (Primary Key)
    static async findById(userId) {
        const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
        return rows[0];
    }

    // Create a new user (Voter)
    static async create(userId, fullName, passwordHash) {
        const [result] = await db.query(
            'INSERT INTO users (user_id, full_name, password_hash) VALUES (?, ?, ?)',
            [userId, fullName, passwordHash]
        );
        return result;
    }

    // NEW: Update a user's role (Admin Promotion)
    static async updateRole(userId, newRole) {
        const [result] = await db.query(
            'UPDATE users SET role = ? WHERE user_id = ?',
            [newRole, userId]
        );
        return result;
    }
}

module.exports = User;