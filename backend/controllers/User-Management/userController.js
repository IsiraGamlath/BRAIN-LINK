// controllers/User-Management/userController.js
const User         = require('../../model/User-Management/User');   // ← fixed path
const asyncHandler = require('express-async-handler');

// @desc  Get all users (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, search, year, semester, specialization } = req.query;
  let query = { isActive: true };

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { slIIId:   { $regex: search, $options: 'i' } },
      { email:    { $regex: search, $options: 'i' } }
    ];
  }
  if (year)           query.year           = parseInt(year);
  if (semester)       query.semester       = parseInt(semester);
  if (specialization) query.specialization = specialization;

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await User.countDocuments(query);
  res.json({ users, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
});

// @desc  Get single user by ID
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('uploadedResources', 'title subject resourceType');

  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// @desc  Update user (Admin)
const updateUser = asyncHandler(async (req, res) => {
  const { fullName, email, specialization, year, semester, role, isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.fullName      = fullName      || user.fullName;
  user.email         = email         || user.email;
  user.specialization = specialization || user.specialization;
  user.year          = year          || user.year;
  user.semester      = semester      || user.semester;
  user.role          = role          || user.role;
  user.isActive      = isActive !== undefined ? isActive : user.isActive;

  const updated = await user.save();
  res.json({
    _id: updated._id, slIIId: updated.slIIId, fullName: updated.fullName,
    email: updated.email, specialization: updated.specialization,
    year: updated.year, semester: updated.semester, role: updated.role, isActive: updated.isActive
  });
});

// @desc  Soft-delete user (Admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.isActive = false;
  await user.save();
  res.json({ message: 'User deactivated successfully' });
});

// @desc  Current user profile
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('uploadedResources', 'title subject resourceType fileType views downloads');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, getUserProfile };