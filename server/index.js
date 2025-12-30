const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// cors() allows your React frontend to communicate with this API
app.use(cors());
// express.json() allows the server to handle JSON data in requests
app.use(express.json());

// Basic Route for testing
app.get('/', (req, res) => {
    res.json({ 
        status: "success",
        message: "Voting System API is running...",
        version: "1.0.0"
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});