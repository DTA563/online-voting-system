const db = require('../config/db');

class AuditLog {
    /**
     * record
     * Saves a new audit entry. Includes IP normalization to convert 
     * the IPv6 loopback (::1) into a readable IPv4 (127.0.0.1).
     */
    static async record(userId, action, ipAddress) {
        // Normalize the IP address
        let normalizedIp = ipAddress;
        
        if (normalizedIp === '::1' || normalizedIp === '::ffff:127.0.0.1') {
            normalizedIp = '127.0.0.1';
        }

        // Execute the database insert with the normalized IP
        await db.query(
            'INSERT INTO audit_logs (performed_by, action, ip_address) VALUES (?, ?, ?)',
            [userId, action, normalizedIp]
        );
    }

    /**
     * getAll
     * Retrieve logs (For Super Admin Dashboard)
     */
    static async getAll() {
        const [rows] = await db.query(
            `SELECT a.*, u.full_name, u.role 
             FROM audit_logs a 
             JOIN users u ON a.performed_by = u.user_id 
             ORDER BY a.created_at DESC`
        );
        return rows;
    }
}

module.exports = AuditLog;