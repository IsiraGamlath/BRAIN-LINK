// routes/Admin-Moderation/adminRoutes.js — Enhanced with role assignment + audit logs
const express = require('express');
const router  = express.Router();
const {
  getAnalytics,
  getAllUsersAdmin,
  suspendUser,
  activateUser,
  assignRole,
  adminDeleteResource,
  getAllResourcesAdmin,
  getAuditLogs
} = require('../../controllers/Admin-Moderation/adminController');

const { protect, adminOnly } = require('../../middleware/auth');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// Analytics
router.get('/analytics', getAnalytics);

// User management
router.get('/users',                    getAllUsersAdmin);
router.patch('/users/:id/suspend',      suspendUser);
router.patch('/users/:id/activate',     activateUser);
router.patch('/users/:id/role',         assignRole);

// Resource / content moderation
router.get('/resources',                getAllResourcesAdmin);
router.delete('/resources/:id',         adminDeleteResource);

// Audit logs
router.get('/audit-logs',               getAuditLogs);

module.exports = router;
