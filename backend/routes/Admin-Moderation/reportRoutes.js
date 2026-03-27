// routes/Admin-Moderation/reportRoutes.js — Enhanced with bulk delete
const express = require('express');
const router  = express.Router();
const {
  createReport,
  getAllReports,
  updateReportStatus,
  deleteReport,
  bulkDeleteReports
} = require('../../controllers/Admin-Moderation/reportController');

const { protect, adminOnly } = require('../../middleware/auth');

// Create a report (any authenticated user)
router.post('/',       protect, createReport);

// Bulk delete (admin only) — must come BEFORE /:id
router.delete('/bulk', protect, adminOnly, bulkDeleteReports);

// Admin-only report management
router.get('/',              protect, adminOnly, getAllReports);
router.patch('/:id/status',  protect, adminOnly, updateReportStatus);
router.delete('/:id',        protect, adminOnly, deleteReport);

module.exports = router;
