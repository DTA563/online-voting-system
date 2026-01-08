const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { userId, fullName, password } = req.body;

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

exports.login = async (req, res) => {
    try {
        const { userId, password } = req.body;

        // 1. Find User
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: "Invalid ID or Password." });
        }

        // 2. Check Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid ID or Password." });
        }

        // 3. Generate JWT Token (The "Entry Ticket")
        const token = jwt.sign(
            { id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            status: "success",
            token,
            user: { id: user.user_id, name: user.full_name, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error during login." });
    }
};