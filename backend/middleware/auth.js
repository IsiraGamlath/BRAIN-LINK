// middleware/auth.js — verifyToken (access + refresh aware) + adminOnly + verifyOwner
const jwt  = require('jsonwebtoken');
const User = require('../model/User-Management/User');

const JWT_SECRET = process.env.JWT_SECRET || 'brainlink_super_secret_jwt_key_2024';

// ── protect: verify access token ──────────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized – no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user    = await User.findById(decoded.id).select('-password -refreshTokens -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account suspended. Contact administrator.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired – please refresh your token', expired: true });
    }
    return res.status(401).json({ message: 'Not authorized – token invalid' });
  }
};

// ── adminOnly: must be admin role ─────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Access denied – admin only' });
};

// ── verifyOwner: check resource ownership ────────────────────────────────────
const verifyOwner = (resourceField = 'uploader') => async (req, res, next) => {
  const resource = req.resource;
  if (!resource) return res.status(404).json({ message: 'Resource not found' });

  const ownerId = resource[resourceField]?.toString();
  const userId  = req.user._id.toString();

  if (ownerId !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden – you do not own this resource' });
  }
  next();
};

module.exports = { protect, adminOnly, verifyOwner };