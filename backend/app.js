// BRAIN LINK — Backend Entry Point (Merged)
require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

// ─── Route Imports (all modules) ─────────────────────────────────────────────

// Authentication & User Management (Isira)
const authRoutes     = require('./routes/authentication/authRoutes');
const userRoutes     = require('./routes/User-Management/userRoutes');

// Resource & Admin (Isira)
const resourceRoutes = require('./routes/Resource-Management/resourceRoutes');
const adminRoutes    = require('./routes/Admin-Moderation/adminRoutes');
const reportRoutes   = require('./routes/Admin-Moderation/reportRoutes');

// Kuppi Sessions (Isira)
const sessionRoutes  = require('./routes/SessionRoutes');

// Study Groups, Profile & Requests (Kaushini)
const groupRoutes    = require('./routes/groupRoutes');
const profileRoutes  = require('./routes/profileRoutes');
const requestRoutes  = require('./routes/requestRoutes');

// ─── App Setup ────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);

// Serve static files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/', (req, res) =>
  res.status(200).json({ message: 'BRAIN LINK API is running 🚀' })
);

// Auth & Users
app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);

// Resources & Admin
app.use('/api/resources', resourceRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/reports',   reportRoutes);

// Sessions (Kuppi)
app.use('/api/sessions',  sessionRoutes);

// Groups, Profiles & Help Requests
app.use('/api/groups',    groupRoutes);
app.use('/api/profile',   profileRoutes);
app.use('/api/requests',  requestRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ─── MongoDB + Server Start ───────────────────────────────────────────────────
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://admin:h1vG6BK4PpmeQbEl@ac-p0umdby-shard-00-00.1hh0nlu.mongodb.net:27017,ac-p0umdby-shard-00-01.1hh0nlu.mongodb.net:27017,ac-p0umdby-shard-00-02.1hh0nlu.mongodb.net:27017/brainlink?ssl=true&authSource=admin&replicaSet=atlas-qe3hdm-shard-0&retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅  Connected to MongoDB Atlas');
    app.listen(PORT, () =>
      console.log(`🚀  Server running on http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });
