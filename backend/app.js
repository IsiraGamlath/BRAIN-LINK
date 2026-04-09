<<<<<<< HEAD
// BRAIN LINK — Backend Entry Point (Enhanced)
require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

=======
// ===== Imports =====
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// ===== Routes from Kaushini_Study_Group =====
const groupRoutes = require("./routes/groupRoutes");
const profileRoutes = require("./routes/profileRoutes");
const requestRoutes = require("./routes/requestRoutes");

// ===== Routes from Isira_Kuppi_Session (HEAD) =====
const sessionRoutes = require('./routes/SessionRoutes');

// ===== App Setup =====
>>>>>>> 78e7208b82ea5ba983d1ec175f213ac1a4bd3008
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://admin:h1vG6BK4PpmeQbEl@ac-p0umdby-shard-00-00.1hh0nlu.mongodb.net:27017,ac-p0umdby-shard-00-01.1hh0nlu.mongodb.net:27017,ac-p0umdby-shard-00-02.1hh0nlu.mongodb.net:27017/brainlink?ssl=true&authSource=admin&replicaSet=atlas-qe3hdm-shard-0&retryWrites=true&w=majority";

<<<<<<< HEAD
// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy (for rate limiting by IP behind reverse proxy)
app.set('trust proxy', 1);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.status(200).json({ message: 'BRAIN LINK API is running 🚀' }));

app.use('/api/auth',      require('./routes/authentication/authRoutes'));
app.use('/api/users',     require('./routes/User-Management/userRoutes'));
app.use('/api/resources', require('./routes/Resource-Management/resourceRoutes'));
app.use('/api/admin',     require('./routes/Admin-Moderation/adminRoutes'));
app.use('/api/reports',   require('./routes/Admin-Moderation/reportRoutes'));

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ─── MongoDB + Server ────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI ||
  'mongodb://admin:h1vG6BK4PpmeQbEl@ac-p0umdby-shard-00-00.1hh0nlu.mongodb.net:27017,ac-p0umdby-shard-00-01.1hh0nlu.mongodb.net:27017,ac-p0umdby-shard-00-02.1hh0nlu.mongodb.net:27017/brainlink?ssl=true&authSource=admin&replicaSet=atlas-qe3hdm-shard-0&retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅  Connected to MongoDB Atlas');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });
=======
// ===== Middleware =====
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Common middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== Routes =====
// From Isira_Kuppi_Session
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});
app.use('/sessions', sessionRoutes);

// From Kaushini_Study_Group
app.use("/api/groups", groupRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/requests", requestRoutes);

// Optional test route from Kaushini_Study_Group
app.get("/test", (req, res) => {
  res.send("It is working");
});

// ===== MongoDB Connection + Server Start =====
async function startServer() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        const errorMessage = err && err.message ? err.message : "Unknown MongoDB connection error";
        console.error(`MongoDB connection failed: ${errorMessage}`);
        console.error("Check your MongoDB Atlas IP allowlist and credentials if using Atlas.");
        process.exit(1);
    }
}

// Start the server
startServer();
>>>>>>> 78e7208b82ea5ba983d1ec175f213ac1a4bd3008
