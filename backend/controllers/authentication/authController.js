// controllers/authentication/authController.js — Full JWT + Refresh + Account Lock + Forgot/Reset Password
const crypto       = require('crypto');
const User         = require('../../model/User-Management/User');
const AuditLog     = require('../../model/Admin-Moderation/AuditLog');
const jwt          = require('jsonwebtoken');

const JWT_SECRET         = process.env.JWT_SECRET  || 'brainlink_super_secret_jwt_key_2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'brainlink_refresh_secret_2024';
const ACCESS_EXPIRE      = '15m';
const REFRESH_EXPIRE     = '7d';

// ── Token generators ──────────────────────────────────────────────────────────
const generateAccessToken  = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: ACCESS_EXPIRE });
const generateRefreshToken = (id) => jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRE });

// ── Validate password strength ────────────────────────────────────────────────
const validatePassword = (pwd) => {
  if (pwd.length < 6)                    return 'Password must be at least 6 characters';
  if (!/[a-zA-Z]/.test(pwd))             return 'Password must contain at least one letter';
  if (!/[0-9]/.test(pwd))               return 'Password must contain at least one number';
  return null;
};

// ── Log audit event ───────────────────────────────────────────────────────────
const logAudit = async (action, userId, targetType, targetId, details, req) => {
  try {
    await AuditLog.create({
      action,
      performedBy: userId,
      targetType,
      targetId:    targetId || null,
      details:     details  || {},
      ipAddress:   req?.ip  || '',
      userAgent:   req?.headers?.['user-agent'] || ''
    });
  } catch (_) { /* non-blocking */ }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route  POST /api/auth/signup
// @access Public
// ─────────────────────────────────────────────────────────────────────────────
const signup = async (req, res) => {
  const { slIIId, fullName, email, specialization, year, semester, password, confirmPassword } = req.body;

  // ── Field presence ──────────────────────────────────────────────────────────
  if (!slIIId || !fullName || !email || !specialization || !year || !semester || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // ── Email format ────────────────────────────────────────────────────────────
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // ── Password validation ─────────────────────────────────────────────────────
  const pwdError = validatePassword(password);
  if (pwdError) return res.status(400).json({ message: pwdError });
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  // ── Duplicate check ─────────────────────────────────────────────────────────
  const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { slIIId: slIIId.toUpperCase() }] });
  if (existing) {
    return res.status(400).json({
      message: existing.email === email.toLowerCase()
        ? 'Email already registered'
        : 'SLIIT ID already registered'
    });
  }

  const user = await User.create({
    slIIId:         slIIId.toUpperCase(),
    fullName:       fullName.trim(),
    email:          email.toLowerCase(),
    specialization: specialization.trim(),
    year:           Number(year),
    semester:       Number(semester),
    password
  });

  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token
  user.refreshTokens = [refreshToken];
  await user.save({ validateBeforeSave: false });

  await logAudit('USER_REGISTERED', user._id, 'auth', user._id, { email: user.email }, req);

  res.status(201).json({
    success: true,
    user: {
      _id: user._id, slIIId: user.slIIId, fullName: user.fullName,
      email: user.email, specialization: user.specialization,
      year: user.year, semester: user.semester, role: user.role
    },
    accessToken,
    refreshToken
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @route  POST /api/auth/login
// @access Public
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password +loginAttempts +lockUntil +refreshTokens');
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // ── Account lock check ──────────────────────────────────────────────────────
  if (user.isLocked) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return res.status(423).json({
      message: `Account locked. Try again in ${minutesLeft} minute(s)`,
      locked: true
    });
  }

  // ── Suspended check ─────────────────────────────────────────────────────────
  if (!user.isActive) {
    return res.status(403).json({ message: 'Account suspended. Contact administrator.' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.incLoginAttempts();
    const attemptsLeft = Math.max(0, 5 - (user.loginAttempts + 1));
    return res.status(401).json({
      message: attemptsLeft > 0
        ? `Invalid credentials. ${attemptsLeft} attempt(s) remaining`
        : 'Account locked due to too many failed attempts'
    });
  }

  // ── Successful login: reset attempts, set lastLogin ─────────────────────────
  user.loginAttempts = 0;
  user.lockUntil     = null;
  user.lastLogin     = new Date();

  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Keep up to 5 refresh tokens (multi-device)
  user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
  await user.save({ validateBeforeSave: false });

  await logAudit('USER_LOGIN', user._id, 'auth', user._id, { email: user.email }, req);

  res.json({
    success: true,
    user: {
      _id: user._id, slIIId: user.slIIId, fullName: user.fullName,
      email: user.email, specialization: user.specialization,
      year: user.year, semester: user.semester, role: user.role, lastLogin: user.lastLogin
    },
    accessToken,
    refreshToken
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @route  POST /api/auth/refresh
// @access Public (requires refresh token)
// ─────────────────────────────────────────────────────────────────────────────
const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) return res.status(401).json({ message: 'Refresh token required' });

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_REFRESH_SECRET);
  } catch {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }

  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user || !user.refreshTokens?.includes(token)) {
    return res.status(403).json({ message: 'Refresh token has been revoked' });
  }

  const newAccess  = generateAccessToken(user._id);
  const newRefresh = generateRefreshToken(user._id);

  // Rotate refresh token
  user.refreshTokens = [...user.refreshTokens.filter(t => t !== token), newRefresh];
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, accessToken: newAccess, refreshToken: newRefresh });
};

// ─────────────────────────────────────────────────────────────────────────────
// @route  POST /api/auth/logout
// @access Protected
// ─────────────────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  const { refreshToken: token } = req.body;

  const user = await User.findById(req.user._id).select('+refreshTokens');
  if (user && token) {
    user.refreshTokens = (user.refreshTokens || []).filter(t => t !== token);
    await user.save({ validateBeforeSave: false });
  }

  await logAudit('USER_LOGOUT', req.user._id, 'auth', req.user._id, {}, req);

  res.json({ success: true, message: 'Logged out successfully' });
};

// ─────────────────────────────────────────────────────────────────────────────
// @route  GET /api/auth/me
// @access Protected
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password -refreshTokens -resetPasswordToken -resetPasswordExpires')
    .populate('uploadedResources', 'title subject resourceType views downloads')
    .populate('savedResources', 'title subject resourceType');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ success: true, user });
};

// ─────────────────────────────────────────────────────────────────────────────
// @route  POST /api/auth/forgot-password
// @access Public
// ─────────────────────────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await User.findOne({ email: email.toLowerCase() }).select('+resetPasswordToken +resetPasswordExpires');

  // Always return success (prevent email enumeration)
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken   = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 min
  await user.save({ validateBeforeSave: false });

  // In production: send email. Here we return the token for simulation.
  const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

  await logAudit('PASSWORD_RESET_REQUESTED', user._id, 'auth', user._id, { email: user.email }, req);

  res.json({
    success: true,
    message: 'Password reset link generated (Email simulation)',
    resetUrl,      // ← For development only; remove in production
    resetToken     // ← For development only; remove in production
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @route  POST /api/auth/reset-password
// @access Public
// ─────────────────────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  const { token, email, newPassword, confirmPassword } = req.body;

  if (!token || !email || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const pwdError = validatePassword(newPassword);
  if (pwdError) return res.status(400).json({ message: pwdError });

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    email:                email.toLowerCase(),
    resetPasswordToken:   hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  }).select('+resetPasswordToken +resetPasswordExpires +refreshTokens');

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired reset token' });
  }

  user.password             = newPassword;
  user.resetPasswordToken   = undefined;
  user.resetPasswordExpires = undefined;
  user.loginAttempts        = 0;
  user.lockUntil            = null;
  user.refreshTokens        = []; // Invalidate all sessions
  await user.save();

  await logAudit('PASSWORD_RESET', user._id, 'auth', user._id, { email: user.email }, req);

  res.json({ success: true, message: 'Password reset successfully. Please log in.' });
};

module.exports = { signup, login, refreshToken, logout, getMe, forgotPassword, resetPassword };