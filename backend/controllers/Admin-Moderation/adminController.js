// controllers/Admin-Moderation/adminController.js — Enhanced with audit logs, role assignment, active users
const asyncHandler = require('express-async-handler');
const User     = require('../../model/User-Management/User');
const Resource = require('../../model/Resource-Management/Resource');
const Report   = require('../../model/Admin-Moderation/Report');
const AuditLog = require('../../model/Admin-Moderation/AuditLog');

// ─── GET /api/admin/analytics ────────────────────────────────────────────────
const getAnalytics = asyncHandler(async (req, res) => {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers24h,
    totalResources,
    reportCounts,
    topUploaders,
    popularResources
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ lastLogin: { $gte: last24h } }),
    Resource.countDocuments({ isDeleted: false }),
    Report.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Resource.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$uploader', totalUploads: { $sum: 1 }, totalDownloads: { $sum: '$downloads' } } },
      { $sort: { totalUploads: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { totalUploads: 1, totalDownloads: 1, 'user.fullName': 1, 'user.email': 1, 'user.slIIId': 1 } }
    ]),
    Resource.find({ isDeleted: false })
      .sort({ downloads: -1, views: -1 })
      .limit(5)
      .select('title subject downloads views averageRating resourceType')
  ]);

  const reports = { Pending: 0, Reviewed: 0, Resolved: 0, total: 0 };
  reportCounts.forEach(r => {
    reports[r._id] = r.count;
    reports.total += r.count;
  });

  // Resource upload trend (last 7 days)
  const uploadTrend = await Resource.aggregate([
    { $match: { isDeleted: false, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    analytics: {
      totalUsers,
      activeUsers24h,
      totalResources,
      totalStudyGroups: 0,
      totalKuppiSessions: 0,
      reports,
      topUploaders,
      popularResources,
      uploadTrend
    }
  });
});

// ─── GET /api/admin/users ────────────────────────────────────────────────────
const getAllUsersAdmin = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20, role, isActive } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { fullName:  { $regex: search, $options: 'i' } },
      { email:     { $regex: search, $options: 'i' } },
      { slIIId:    { $regex: search, $options: 'i' } }
    ];
  }
  if (role)     query.role     = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const users = await User.find(query)
    .select('-password -refreshTokens -resetPasswordToken -resetPasswordExpires')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.json({ success: true, users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// ─── PATCH /api/admin/users/:id/suspend ─────────────────────────────────────
const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') return res.status(403).json({ message: 'Cannot suspend another admin' });

  user.isActive      = false;
  user.refreshTokens = []; // Invalidate all sessions
  await user.save({ validateBeforeSave: false });

  await AuditLog.create({
    action: 'USER_SUSPENDED', performedBy: req.user._id,
    targetType: 'user', targetId: user._id,
    details: { suspendedUser: user.email }
  });

  res.json({ success: true, message: `User "${user.fullName}" has been suspended` });
});

// ─── PATCH /api/admin/users/:id/activate ────────────────────────────────────
const activateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.isActive      = true;
  user.loginAttempts = 0;
  user.lockUntil     = null;
  await user.save({ validateBeforeSave: false });

  await AuditLog.create({
    action: 'USER_ACTIVATED', performedBy: req.user._id,
    targetType: 'user', targetId: user._id,
    details: { activatedUser: user.email }
  });

  res.json({ success: true, message: `User "${user.fullName}" has been activated` });
});

// ─── PATCH /api/admin/users/:id/role ────────────────────────────────────────
const assignRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const validRoles = ['student', 'student-leader', 'admin'];
  if (!validRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' });

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const previousRole = user.role;
  user.role = role;
  await user.save({ validateBeforeSave: false });

  await AuditLog.create({
    action: 'ROLE_ASSIGNED', performedBy: req.user._id,
    targetType: 'user', targetId: user._id,
    details: { from: previousRole, to: role, userEmail: user.email }
  });

  res.json({ success: true, message: `Role updated to "${role}" for ${user.fullName}`, user });
});

// ─── DELETE /api/admin/resources/:id ────────────────────────────────────────
const adminDeleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: 'Resource not found' });

  resource.isDeleted = true;
  await resource.save();

  await AuditLog.create({
    action: 'RESOURCE_ADMIN_DELETED', performedBy: req.user._id,
    targetType: 'resource', targetId: resource._id,
    details: { title: resource.title, subject: resource.subject }
  });

  res.json({ success: true, message: 'Resource removed by admin' });
});

// ─── GET /api/admin/resources ───────────────────────────────────────────────
const getAllResourcesAdmin = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20, subject, resourceType, flagged } = req.query;
  const query = { isDeleted: false };

  if (search) {
    query.$or = [
      { title:   { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } }
    ];
  }
  if (subject)      query.subject      = { $regex: subject, $options: 'i' };
  if (resourceType) query.resourceType = resourceType;

  const skip      = (parseInt(page) - 1) * parseInt(limit);
  const resources = await Resource.find(query)
    .populate('uploader', 'fullName email slIIId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Resource.countDocuments(query);

  res.json({ success: true, resources, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// ─── GET /api/admin/audit-logs ───────────────────────────────────────────────
const getAuditLogs = asyncHandler(async (req, res) => {
  const { targetType, action, page = 1, limit = 20 } = req.query;
  const query = {};
  if (targetType) query.targetType = targetType;
  if (action)     query.action     = { $regex: action, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const logs = await AuditLog.find(query)
    .populate('performedBy', 'fullName email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await AuditLog.countDocuments(query);
  res.json({ success: true, logs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

module.exports = {
  getAnalytics,
  getAllUsersAdmin,
  suspendUser,
  activateUser,
  assignRole,
  adminDeleteResource,
  getAllResourcesAdmin,
  getAuditLogs
};
