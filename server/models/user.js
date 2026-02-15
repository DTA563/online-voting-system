const db = require('../config/db');

class User {
    // Find a user by their user ID
    static async findById(userId) {
        const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
        return rows[0];
    }

    // find all user
    static async findAll(role = null) {
        let query = 'SELECT user_id, full_name, role, status, created_at, is_verified FROM users';
        let params = [];
        
        if (role) {
            query += ' WHERE role = ?';
            params.push(role);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const [rows] = await db.query(query, params);
        return rows;
    }

    // Create a new user
    static async create(userId, fullName, passwordHash, role = 'voter') {
        const [result] = await db.query(
            'INSERT INTO users (user_id, full_name, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?)',
            [userId, fullName, passwordHash, role, is_verified]
        );
        return result;
    }

    // Update a user's role
    static async updateRole(userId, newRole) {
        const [result] = await db.query(
            'UPDATE users SET role = ? WHERE user_id = ?',
            [newRole, userId]
        );
        return result;
    }

    // Verify user account
    static async verify(userId) {
        const [result] = await db.query(
            'UPDATE users SET is_verified = 1 WHERE user_id = ?',
            [userId]
        );
        return result;
    }

    // Permanently delete a user
    static async delete(userId) {
        const [result] = await db.query(
            'DELETE FROM users WHERE user_id = ?',
            [userId]
        );
        return result;
    }
}

module.exports = User;