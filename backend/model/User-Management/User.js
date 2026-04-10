// models/User-Management/User.js — Enhanced with JWT refresh, account lock, last login
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  slIIId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },

  fullName: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },

  specialization: {
    type: String,
    required: true,
    trim: true
  },

  year: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  semester: {
    type: Number,
    required: true,
    enum: [1, 2]
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },

  role: {
    type: String,
    enum: ['student', 'student-leader', 'admin'],
    default: 'student'
  },

  profilePicture: {
    type: String,
    default: ''
  },

  isVerified: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true  },

  // ── Security fields ────────────────────────────────────────────────────────
  loginAttempts: { type: Number, default: 0 },
  lockUntil:     { type: Date,   default: null },
  lastLogin:     { type: Date,   default: null },

  // Refresh tokens (stored as hashed)
  refreshTokens: [{ type: String }],

  // Password reset
  resetPasswordToken:   { type: String,  select: false },
  resetPasswordExpires: { type: Date,    select: false },

  // ── Relations ──────────────────────────────────────────────────────────────
  uploadedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  joinedGroups:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup' }],
  savedResources:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],

}, { timestamps: true });

// ── Virtual: isLocked ──────────────────────────────────────────────────────
UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ── Pre-save: hash password ────────────────────────────────────────────────
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt   = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Method: compare password ───────────────────────────────────────────────
UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ── Method: increment login attempts (lock after 5) ───────────────────────
UserSchema.methods.incLoginAttempts = async function () {
  const LOCK_TIME = 30 * 60 * 1000; // 30 minutes
  if (this.lockUntil && this.lockUntil < Date.now()) {
    // Reset after lock expires
    return this.updateOne({ $set: { loginAttempts: 1, lockUntil: null } });
  }
  const update = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5) {
    update.$set = { lockUntil: new Date(Date.now() + LOCK_TIME) };
  }
  return this.updateOne(update);
};

module.exports = mongoose.model('User', UserSchema);