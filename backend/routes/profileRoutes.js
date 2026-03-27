const express = require("express");
const router = express.Router();
const { saveStudentProfile, getStudentProfile } = require("../controllers/profileController");

// Save or update student profile
// PATCH /api/profile
router.patch("/", saveStudentProfile);

// Get student profile
// GET /api/profile/:itNumber
router.get("/:itNumber", getStudentProfile);

module.exports = router;
