const express = require('express');
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const path = require('path');
const Report = require('../models/Report');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Configure multer for file uploads
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// POST /api/reports - Create a report (students only)
router.post('/', authMiddleware, upload.single('image'), asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied – only students can create reports' });
  }

  const { type, referenceId, reason } = req.body;

  if (!type || !referenceId || !reason) {
    return res.status(400).json({ message: 'Type, referenceId, and reason are required' });
  }

  const reportData = {
    type,
    referenceId,
    reason,
    reportedBy: req.user.id,
    status: 'Pending'
  };

  if (req.file) {
    reportData.image = req.file.path;
  }

  const report = new Report(reportData);

  await report.save();
  res.status(201).json(report);
}));

// GET /api/reports - Get all reports (admins only)
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied – only admins can view reports' });
  }

  const reports = await Report.find().sort({ createdAt: -1 });
  res.json(reports);
}));

// PUT /api/reports/:id - Update report status (admins only)
router.put('/:id', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied – only admins can update reports' });
  }

  const { status } = req.body;
  if (!status || !['Pending', 'Reviewed', 'Resolved'].includes(status)) {
    return res.status(400).json({ message: 'Valid status is required' });
  }

  const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  res.json(report);
}));

// DELETE /api/reports/:id - Delete a report (admins only)
router.delete('/:id', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied – only admins can delete reports' });
  }

  const report = await Report.findByIdAndDelete(req.params.id);
  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  res.json({ message: 'Report deleted successfully' });
}));

module.exports = router;