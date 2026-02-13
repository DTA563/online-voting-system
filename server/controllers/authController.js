const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- REGISTER CONTROLLER ---
exports.register = async (req, res) => {
    try {
        console.log("📝 Register Request Received:", req.body); // Debug Log

        // 1. GET DATA (Safely handle variable names)
        // Frontend sends 'user_id', but we look for 'userId' too just in case
        const { user_id, userId, fullName, password, role } = req.body;

        // Consolidate ID: Use user_id IF it exists, otherwise use userId
        const finalId = user_id || userId;
        
        // Consolidate Name: If fullName is missing, use the ID as the name
        // This prevents the "Column full_name cannot be null" error
        const finalName = fullName || finalId;

        // Basic Validation
        if (!finalId || !password) {
            return res.status(400).json({ message: "User ID and Password are required." });
        }

        // 2. Check if user already exists
        const existingUser = await User.findById(finalId);
        if (existingUser) {
            return res.status(400).json({ message: "User ID already registered." });
        }

        // 3. Hash the password (Security)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Save to Database
        // We pass 'finalName' which is guaranteed to not be empty now
        await User.create(finalId, finalName, hashedPassword, role || 'voter');

        console.log("✅ User Registered Successfully:", finalId);
        res.status(201).json({ status: "success", message: "User registered successfully!" });

    } catch (err) {
        console.error("❌ REGISTRATION ERROR:", err); // Prints real error to terminal
        res.status(500).json({ message: "Server error during registration.", error: err.message });
    }
};

// --- LOGIN CONTROLLER ---
exports.login = async (req, res) => {
    try {
        console.log("🔑 Login Request Received:", req.body); // Debug Log

        // Handle both 'user_id' and 'userId' to be safe
        const { user_id, userId, password } = req.body;
        const finalId = user_id || userId;

        if (!finalId || !password) {
            return res.status(400).json({ message: "Please provide ID and Password." });
        }

        // 1. Find User
        const user = await User.findById(finalId);
        if (!user) {
            return res.status(401).json({ message: "Invalid ID or Password." });
        }

        // 2. Check Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid ID or Password." });
        }

        // 3. Generate JWT Token
        const token = jwt.sign(
            { id: user.user_id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret_key', // Uses fallback if .env is missing
            { expiresIn: '2h' }
        );

        res.json({
            status: "success",
            token,
            user: { id: user.user_id, name: user.full_name, role: user.role }
        });

    } catch (err) {
        console.error("❌ LOGIN ERROR:", err);
        res.status(500).json({ message: "Server error during login." });
    }
};