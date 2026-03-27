// routes/authentication/authRoutes.js — Full auth routes
const express = require('express');
const router  = express.Router();

const {
  signup,
  login,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  resetPassword
} = require('../../controllers/authentication/authController');

const { protect }     = require('../../middleware/auth');
const { authLimiter } = require('../../middleware/rateLimiter');

// ── Public routes ─────────────────────────────────────────────────────────────
router.post('/signup',          signup);
router.post('/login',           authLimiter, login);
router.post('/refresh',         refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password',  resetPassword);

// ── Protected routes ──────────────────────────────────────────────────────────
router.get ('/me',     protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;