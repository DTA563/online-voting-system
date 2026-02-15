const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER CONTROLLER

exports.register = async (req, res) => {
    try {
        const { userId, fullName, password } = req.body;
        const finalId = user_id || userId;
        const finalName = fullName || finalId; // Fallback to ID if name is missing

        if (!finalId || !password) {
            return res.status(400).json({ message: "User ID and Password are required." });
        }

        // 1. Check if user already exists
        const existingUser = await User.findById(userId);
        if (existingUser) {
            return res.status(400).json({ message: "User ID already registered." });
        }

        // 2. Hash the password (Security)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Save to Database
        await User.create(userId, fullName, hashedPassword);

        res.status(201).json({ status: "success", message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Server error during registration.", error: err.message });
    }
};

// LOGIN CONTROLLER
exports.login = async (req, res) => {
    try {
        const { user_id, userId, password } = req.body;
        const finalId = user_id || userId;

        if (!finalId || !password) {
            return res.status(400).json({ message: "Please provide ID and Password." });
        }

        // 1. Find User
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: "Invalid ID or Password." });
        }

        // 2. SECURITY CHECK: Ensure account isn't deactivated
        if (user.status === 'deactivated') {
            return res.status(403).json({ 
                message: "This account has been deactivated. Please contact the administrator." 
            });
        }

        // 3. Check Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid ID or Password." });
        }

        // 4. Generate JWT Token (The "Entry Ticket")
        const token = jwt.sign(
            { id: user.user_id, role: user.role, status: user.status },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '2h' }
        );

        res.json({
            token,
            user: { user_id: user.user_id, full_name: user.full_name, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error during login." });
    }
};