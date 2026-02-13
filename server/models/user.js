const db = require('../config/db');

class User {
    // Find a user by their Student ID (Primary Key)
    static async findById(userId) {
        const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
        return rows[0];
    }

    // Find all users (optional filter by role)
    static async findAll(role = null) {
        let query = `
            SELECT 
                u.user_id, 
                u.full_name, 
                u.role, 
                u.status, 
                u.created_at, 
                u.is_verified,
                (SELECT MAX(created_at) FROM audit_logs WHERE performed_by = u.user_id AND action LIKE '%login%') as last_login
            FROM users u
        `;
        const params = [];
        
        if (role) {
            query += ' WHERE u.role = ?';
            params.push(role);
        }
        
        query += ' ORDER BY u.created_at DESC';
        
        const [rows] = await db.query(query, params);
        return rows;
    }

    // Create a new user (Voter)
    static async create(userId, fullName, passwordHash, role = 'voter') {
        // Default is_verified to false (0)
        const [result] = await db.query(
            'INSERT INTO users (user_id, full_name, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?)',
            [userId, fullName, passwordHash, role, false]
        );
        return result;
    }

    // Verify a user
    static async verify(userId) {
        const [result] = await db.query(
            'UPDATE users SET is_verified = 1 WHERE user_id = ?',
            [userId]
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

    // Delete a user
    static async delete(userId) {
        const [result] = await db.query(
            'DELETE FROM users WHERE user_id = ?',
            [userId]
        );
        return result;
    }
}

module.exports = User;