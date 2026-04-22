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
const multer = require('multer');
const path = require('path');

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});

// Create a report (students only)
router.post('/', protect, upload.single('image'), createReport);

// Bulk delete (admin only) — must come BEFORE /:id
router.delete('/bulk', protect, adminOnly, bulkDeleteReports);

// Admin-only report management
router.get('/',              protect, adminOnly, getAllReports);
router.patch('/:id/status',  protect, adminOnly, updateReportStatus);
router.delete('/:id',        protect, adminOnly, deleteReport);

module.exports = router;
