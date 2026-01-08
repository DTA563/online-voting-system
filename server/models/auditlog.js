const db = require('../config/db');

class AuditLog {
    // Record a new action
    static async record(userId, action, ipAddress) {
        await db.query(
            'INSERT INTO audit_logs (performed_by, action, ip_address) VALUES (?, ?, ?)',
            [userId, action, ipAddress]
        );
    }

    // Retrieve logs (For Super Admin Dashboard)
    static async getAll() {
        const [rows] = await db.query(
            'SELECT a.*, u.full_name FROM audit_logs a JOIN users u ON a.performed_by = u.user_id ORDER BY a.created_at DESC'
        );
        return rows;
    }
}

module.exports = AuditLog;