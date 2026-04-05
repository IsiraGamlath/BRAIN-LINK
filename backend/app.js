require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Peer_Help_Request = require('./routes/Peer_Help_Request');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

// Help API routes
app.use('/api/help', Peer_Help_Request);

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;
console.log("Attempting to connect to MongoDB...");
console.log("URI exists:", !!mongoUri);

if (!mongoUri) {
    console.error("ERROR: MONGODB_URI is not set in .env file");
    process.exit(1);
}

mongoose.connect(mongoUri).then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(process.env.PORT || 5000, () => {
        console.log(`✅ Server running on port ${process.env.PORT || 5000}`);
    });
}).catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    console.error("Full error:", err);
    process.exit(1);
});