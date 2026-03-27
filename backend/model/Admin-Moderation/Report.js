// models/Admin-Moderation/Report.js — Enhanced with priority, category, admin notes, audit history
const mongoose = require('mongoose');

const AuditEntrySchema = new mongoose.Schema({
  action:      { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note:        { type: String, default: '' },
  timestamp:   { type: Date, default: Date.now }
});

const ReportSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Report type is required'],
    enum: { values: ['group', 'request', 'user', 'resource'], message: 'Invalid report type' }
  },

  category: {
    type: String,
    enum: ['spam', 'abuse', 'academic_misconduct', 'inappropriate_content', 'other'],
    default: 'other'
  },

  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },

  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Reference ID is required']
  },

  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter ID is required']
  },

  reason: {
    type: String,
    required: [true, 'Reason is required'],
    minlength: [10, 'Reason must be at least 10 characters'],
    trim: true
  },

  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Resolved', 'Rejected'],
    default: 'Pending'
  },

  adminNotes: {
    type: String,
    default: ''
  },

  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  auditHistory: [AuditEntrySchema]

}, { timestamps: true });

ReportSchema.index({ status: 1 });
ReportSchema.index({ type: 1 });
ReportSchema.index({ priority: 1 });
ReportSchema.index({ category: 1 });
ReportSchema.index({ reportedBy: 1 });

module.exports = mongoose.model('Report', ReportSchema);
