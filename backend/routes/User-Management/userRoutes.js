// routes/User-Management/userRoutes.js
const express = require('express');
const router  = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile
} = require('../../controllers/User-Management/userController');

const { protect, adminOnly } = require('../../middleware/auth');

// Logged-in user — own profile
router.get('/profile', protect, getUserProfile);

// Admin only
router.route('/')
  .get(protect, adminOnly, getAllUsers);

router.route('/:id')
  .get(protect, adminOnly, getUserById)
  .put(protect, adminOnly, updateUser)
  .delete(protect, adminOnly, deleteUser);

module.exports = router;