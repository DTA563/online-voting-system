const User = require('../models/user');
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
        await User.create(finalId, finalName, hashedPassword, role || 'voter');

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
        if (!user) {
            return res.status(401).json({ message: "Invalid ID or Password." });
        }

        if (user.status === 'deactivated') {
            return res.status(403).json({ message: "Account deactivated." });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid ID or Password." });
        }

        const token = jwt.sign(
            { id: user.user_id, role: user.role, status: user.status },
            process.env.JWT_SECRET || 'any_secret_key',
            { expiresIn: '2h' }
        );

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