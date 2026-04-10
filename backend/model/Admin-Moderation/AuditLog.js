// models/Admin-Moderation/AuditLog.js — System audit trail
const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true
  },

  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  targetType: {
    type: String,
    enum: ['user', 'resource', 'report', 'system', 'auth'],
    required: true
  },

  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },

  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  ipAddress: {
    type: String,
    default: ''
  },

  userAgent: {
    type: String,
    default: ''
  }

}, { timestamps: true });

AuditLogSchema.index({ performedBy: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ targetType: 1 });
AuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
