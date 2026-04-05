//h1vG6BK4PpmeQbEl


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const Peer_Help_Request = require('./routes/Peer_Help_Request');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://admin:h1vG6BK4PpmeQbEl@ac-p0umdby-shard-00-00.1hh0nlu.mongodb.net:27017,ac-p0umdby-shard-00-01.1hh0nlu.mongodb.net:27017,ac-p0umdby-shard-00-02.1hh0nlu.mongodb.net:27017/brainlink?ssl=true&authSource=admin&replicaSet=atlas-qe3hdm-shard-0&retryWrites=true&w=majority";

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

app.use('/api/help', Peer_Help_Request);

// MongoDB Connection
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB:", err.message);
        process.exit(1);
    });