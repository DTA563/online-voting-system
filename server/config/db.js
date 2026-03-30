const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'voting_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    port: process.env.DB_PORT || 3306, // Adds port support
    ssl: {
        rejectUnauthorized: false // Required for Aiven cloud connections
    }
});

//const promisePool = pool.promise();

const testConnection = async () => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log('✅ Database Connected Successfully');
    } catch (err) {
        console.error('❌ Database Connection Failed!');
        console.error('Error Code:', err.code);     // Tells us if it's a password or host issue
        console.error('Error Message:', err.message); // Tells us exactly what happened
        console.log('Troubleshooting Tip:');
        console.log('1. Ensure MySQL is running in your Services.');
        console.log('2. Ensure password in .env matches your MySQL root password.');
        console.log('3. Ensure database "voting_system" exists in MySQL.');
    }
};

testConnection();

module.exports = pool;