// controllers/Admin-Moderation/reportController.js — Enhanced with priority, category, admin notes, bulk delete
const asyncHandler = require('express-async-handler');
const mongoose     = require('mongoose');
const Report       = require('../../model/Admin-Moderation/Report');
const AuditLog     = require('../../model/Admin-Moderation/AuditLog');

// ── Suspicious keyword detector ────────────────────────────────────────────────
const SUSPICIOUS_KEYWORDS = ['spam', 'hack', 'cheat', 'fraud', 'scam', 'abuse', 'fake', 'plagiarism'];
const detectPriority = (reason = '') => {
  const lower = reason.toLowerCase();
  const hits  = SUSPICIOUS_KEYWORDS.filter(kw => lower.includes(kw)).length;
  if (hits >= 3) return 'High';
  if (hits >= 1) return 'Medium';
  return 'Low';
};

// ─── POST /api/reports ───────────────────────────────────────────────────────
const createReport = asyncHandler(async (req, res) => {
  const { type, referenceId, reason, category } = req.body;

  if (!type || !referenceId || !reason) {
    return res.status(400).json({ message: 'type, referenceId, and reason are required' });
  }
  if (!['group', 'request', 'user', 'resource'].includes(type)) {
    return res.status(400).json({ message: 'Invalid report type. Must be: group, request, user, or resource' });
  }
  if (!mongoose.Types.ObjectId.isValid(referenceId)) {
    return res.status(400).json({ message: 'referenceId must be a valid MongoDB ObjectId' });
  }
  if (reason.trim().length < 10) {
    return res.status(400).json({ message: 'Reason must be at least 10 characters' });
  }

  const autoPriority = detectPriority(reason);

  const report = await Report.create({
    type,
    referenceId,
    reason:   reason.trim(),
    category: category || 'other',
    priority: autoPriority,
    reportedBy: req.user._id,
    auditHistory: [{ action: 'CREATED', performedBy: req.user._id, note: 'Report submitted' }]
  });

  res.status(201).json({ success: true, message: 'Report submitted successfully', report });
});

// ─── GET /api/reports ────────────────────────────────────────────────────────
const getAllReports = asyncHandler(async (req, res) => {
  const { status, type, category, priority, page = 1, limit = 20 } = req.query;
  const query = {};

  if (status)   query.status   = status;
  if (type)     query.type     = type;
  if (category) query.category = category;
  if (priority) query.priority = priority;

  const skip    = (parseInt(page) - 1) * parseInt(limit);
  const reports = await Report.find(query)
    .populate('reportedBy', 'fullName email slIIId')
    .populate('resolvedBy',  'fullName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Report.countDocuments(query);

  res.json({ success: true, reports, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// ─── PATCH /api/reports/:id/status ──────────────────────────────────────────
const updateReportStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;

  if (!['Pending', 'Reviewed', 'Resolved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });

  const prevStatus = report.status;
  report.status     = status;
  report.adminNotes = adminNotes || report.adminNotes;
  if (['Resolved', 'Rejected'].includes(status)) report.resolvedBy = req.user._id;

  report.auditHistory.push({
    action:      `STATUS_CHANGED_TO_${status.toUpperCase()}`,
    performedBy: req.user._id,
    note:        adminNotes || `Status changed from ${prevStatus} to ${status}`
  });

  await report.save();

  await AuditLog.create({
    action: 'REPORT_STATUS_UPDATED', performedBy: req.user._id,
    targetType: 'report', targetId: report._id,
    details: { from: prevStatus, to: status }
  });

  res.json({ success: true, message: `Report status updated to ${status}`, report });
});

// ─── DELETE /api/reports/:id ─────────────────────────────────────────────────
const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });

  await report.deleteOne();

  await AuditLog.create({
    action: 'REPORT_DELETED', performedBy: req.user._id,
    targetType: 'report', targetId: report._id, details: { type: report.type }
  });

  res.json({ success: true, message: 'Report deleted successfully' });
});

// ─── DELETE /api/reports/bulk ────────────────────────────────────────────────
const bulkDeleteReports = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'ids array is required' });
  }

  const result = await Report.deleteMany({ _id: { $in: ids } });

  await AuditLog.create({
    action: 'REPORTS_BULK_DELETED', performedBy: req.user._id,
    targetType: 'report', details: { count: result.deletedCount, ids }
  });

  res.json({ success: true, message: `${result.deletedCount} reports deleted`, deleted: result.deletedCount });
});

module.exports = { createReport, getAllReports, updateReportStatus, deleteReport, bulkDeleteReports };
