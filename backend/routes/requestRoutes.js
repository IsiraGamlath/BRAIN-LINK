const express = require("express");
const router = express.Router();
const {
  getGroupRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  getStudentRequests,
} = require("../controllers/requestController");

// Get join requests for a group (for leader)
// GET /api/requests/group/:id
router.get("/group/:id", getGroupRequests);

// Get student's join requests
// GET /api/requests/student?itNumber=...
router.get("/student", getStudentRequests);

// Accept join request (for leader)
// PATCH /api/requests/:id/accept/:requestId
router.patch("/:id/accept/:requestId", acceptJoinRequest);

// Reject join request (for leader)
// PATCH /api/requests/:id/reject/:requestId
router.patch("/:id/reject/:requestId", rejectJoinRequest);

module.exports = router;
