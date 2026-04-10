const express = require("express");
const router = express.Router();
const {
  createStudyGroup,
  getRelevantGroups,
  getAllGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  deleteGroup,
  updateMaxMembers,
} = require("../controllers/groupController");

router.post("/", createStudyGroup);
router.get("/relevant", getRelevantGroups);
router.get("/", getAllGroups);
router.get("/:id", getGroupById);
router.put("/join/:id", joinGroup);
router.put("/leave/:id", leaveGroup);
router.delete("/:id", deleteGroup);
router.put("/:id/max-members", updateMaxMembers);

module.exports = router;
