const express = require("express");
const router = express.Router();
const {
  createStudyGroup,
  getAllGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  deleteGroup,
  updateMaxMembers,
  getGroupNames,
} = require("../controllers/groupController");

router.post("/", createStudyGroup);
router.get("/", getAllGroups);
router.get("/:id", getGroupById);
router.put("/join/:id", joinGroup);
router.put("/leave/:id", leaveGroup);
router.delete("/:id", deleteGroup);
router.put("/:id/max-members", updateMaxMembers);
router.get("/names/all", getGroupNames);

module.exports = router;
