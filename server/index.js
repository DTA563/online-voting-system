const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize database connection
const db = require('./config/db');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const voteRoutes = require('./routes/voteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const resultRoutes = require('./routes/resultRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

//  GLOBAL MIDDLEWARE 
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

//  ROUTE MOUNTING 
// All authentication logic (Login/Register)
app.use('/api/auth', authRoutes);

// Secure voting logic (Casting ballots)
app.use('/api/votes', voteRoutes);

// Management & Administration (Elections, Candidates, Roles, Registry)
app.use('/api/admin', adminRoutes);

// Real-time Turnout & Final Results
app.use('/api/results', resultRoutes);

//  HEALTH CHECK 
app.get('/', (req, res) => {
    res.json({ 
        status: "success", 
        message: "Online Voting System API (v1.0.6) is fully operational.",
        timestamp: new Date().toISOString()
    });
});

//  GLOBAL ERROR HANDLER 
// Catches any unhandled errors in the request cycle
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({ 
        message: "An internal server error occurred.",
        error: process.env.NODE_ENV === 'development' ? err.message : {} 
    });
});

//  404 HANDLER 
app.use((req, res) => {
    res.status(404).json({ message: "API Route not found." });
});

//  SERVER INITIALIZATION 
app.listen(PORT, () => {
    console.log(`
     SERVER RUNNING ON PORT: ${PORT}
     ENVIRONMENT: ${process.env.NODE_ENV || 'development'}
    `);
});