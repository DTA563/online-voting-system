const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// ADDED: Built-in Node module and Socket.io
const http = require('http'); 
const { Server } = require('socket.io'); 

// Initialize database connection
const db = require('./config/db');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Uploads directory created');
}

// Route Imports
const authRoutes = require('./routes/authRoutes');
const voteRoutes = require('./routes/voteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const userRoutes = require('./routes/userRoutes');
const resultRoutes = require('./routes/resultRoutes');
const electionRoutes = require('./routes/electionRoutes');
const positionRoutes = require('./routes/positionRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// SOCKET.IO SETUP
// Create the HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Update this to your React app's URL in production
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Make 'io' accessible inside your controllers (like superAdminController)
app.set('io', io);

// Listen for connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // When the React frontend tells us who logged in, put them in a personal room
    socket.on('register_user', (userId) => {
        // FIX: Force the ID to be a string to avoid the Data Type Trap!
        const stringId = String(userId);
        socket.join(stringId);
        console.log(`👤 User ${stringId} joined their personal room.`);
    });

    socket.on('disconnect', () => {
        console.log(' User disconnected:', socket.id);
    });
});


app.set('trust proxy', true);
app.use((req, res, next) => {
    let ip = req.ip;
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
        ip = '127.0.0.1';
    }
    // Force the normalized IP back onto the request object
    Object.defineProperty(req, 'ip', { value: ip, writable: true });
    next();
});

// GLOBAL MIDDLEWARE 
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ROUTE MOUNTING 
// All authentication logic (Login/Register)
app.use('/api/auth', authRoutes);

// Secure voting logic (Casting ballots)
app.use('/api/votes', voteRoutes);

// Management & Administration (Elections, Candidates, Roles, Registry)
app.use('/api/admin', adminRoutes);

// High-Level System Management (Roles, Password Resets, Logs)
app.use('/api/super-admin', superAdminRoutes);

// User Management (Listing, Verification, Deletion)
app.use('/api/users', userRoutes);

// Real-time Turnout & Final Results
app.use('/api/results', resultRoutes);

// Election Route 
app.use('/api/elections', electionRoutes);

// Position Route 
app.use('/api/positions', positionRoutes);

// Candidate Route
app.use('/api/candidates', candidateRoutes);

// HEALTH CHECK 
app.get('/', (req, res) => {
    res.json({ 
        status: "success", 
        message: "Online Voting System API (v1.0.8) is fully operational.",
        timestamp: new Date().toISOString()
    });
});

// GLOBAL ERROR HANDLER 
// Catches any unhandled errors in the request cycle
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({ 
        message: "An internal server error occurred.",
        error: process.env.NODE_ENV === 'development' ? err.message : {} 
    });
});

// 404 HANDLER 
app.use((req, res) => {
    res.status(404).json({ message: "API Route not found." });
});

// SERVER INITIALIZATION 
// CHANGED: Using server.listen instead of app.listen to include Socket.io
server.listen(PORT, () => {
    console.log(`
     🚀 SERVER RUNNING ON PORT: ${PORT}
     🌍 ENVIRONMENT: ${process.env.NODE_ENV || 'development'}
     📁 UPLOADS DIRECTORY: ${uploadsDir}
    `);
});