const User = require('../models/user');
const AuditLog = require('../models/auditlog'); // ADDED: Import the AuditLog model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * REGISTER CONTROLLER
 */
exports.register = async (req, res) => {
    try {
        const { user_id, userId, fullName, full_name, password, role } = req.body;

        const finalId = user_id || userId;
        const finalName = fullName || full_name

        if (!finalId || !password) {
            return res.status(400).json({ message: "User ID and Password are required." });
        }

        // 2. Check if user already exists
        const existingUser = await User.findById(finalId);
        if (existingUser) {
            return res.status(400).json({ message: "User ID already registered." });
        }

        // 3. Hash the password
        // Ensure 'bcryptjs' is installed via npm
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Save to Database
        const assignedRole = role || 'voter';
        await User.create(finalId, finalName, hashedPassword, assignedRole);

        // ADDED: Log the registration
        // Note: Since they aren't logged in yet, we use the ID they just created
        await AuditLog.record(finalId, `Registered new account as ${assignedRole}`, req.ip);

        console.log("✅ User Registered Successfully:", finalId);
        res.status(201).json({ status: "success", message: "User registered successfully!" });

    } catch (err) {
        // This log will appear in your VS Code terminal
        console.error("❌ REGISTRATION DB ERROR:", err.message);
        res.status(500).json({ 
            message: "Database error during registration.", 
            error: err.message 
        });
    }
};

/**
 * --- LOGIN CONTROLLER ---
 */
exports.login = async (req, res) => {
    try {
        const { user_id, userId, password } = req.body;
        const finalId = user_id || userId;

        if (!finalId || !password) {
            return res.status(400).json({ message: "Please provide ID and Password." });
        }

        const user = await User.findById(finalId);

        // --- LOGIN FAILURE LOGGING ---
        if (!user) {
            // Log failed attempt for non-existent user (id is null because user doesn't exist)
            await AuditLog.record(null, `Failed Login: User ${finalId} not found`, req.ip);
            return res.status(401).json({ message: "Invalid ID or Password." });
        }

        if (user.status === 'deactivated') {
            // Log failed attempt for deactivated user
            await AuditLog.record(user.user_id, 'Failed Login: Account deactivated', req.ip);
            return res.status(403).json({ message: "Account deactivated." });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            // Log failed attempt for invalid password
            await AuditLog.record(user.user_id, 'Failed Login: Invalid Password', req.ip);
            return res.status(401).json({ message: "Invalid ID or Password." });
        }

        const token = jwt.sign(
            { id: user.user_id, role: user.role, status: user.status },
            process.env.JWT_SECRET || 'any_secret_key',
            { expiresIn: '2h' }
        );

        // ADDED: Log the successful login
        await AuditLog.record(user.user_id, `User logged in`, req.ip);

        // ADDED: Update last_login timestamp
        await User.updateLastLogin(user.user_id);

        res.json({
            status: "success",
            token,
            user: { id: user.user_id, name: user.full_name, role: user.role }
        });

    } catch (err) {
        console.error("❌ LOGIN ERROR:", err.message);
        res.status(500).json({ message: "Server error during login." });
    }
};

/**
 * --- LOGOUT CONTROLLER ---
 */
exports.logout = async (req, res) => {
    try {
        // req.user exists because this route should be protected by your auth middleware
        const actor = req.user; 

        if (actor) {
            // Log the successful logout
            await AuditLog.record(actor.id, `User logged out`, req.ip);
        }

        // We don't need to destroy a session on the backend since it's JWT. 
        // We just tell the frontend "Success, now delete your token."
        res.json({ status: "success", message: "Logged out successfully." });

    } catch (err) {
        console.error("❌ LOGOUT ERROR:", err.message);
        res.status(500).json({ message: "Server error during logout." });
    }
};