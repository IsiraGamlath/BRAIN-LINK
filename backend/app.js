// BRAIN LINK — Backend Entry Point (Enhanced)
require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const app = express();

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