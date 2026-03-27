const express = require("express");
const router = express.Router();
const {
  createStudyGroup,
  getAllGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
} = require("../controllers/groupController");

router.post("/", createStudyGroup);
router.get("/", getAllGroups);
router.get("/:id", getGroupById);
router.put("/join/:id", joinGroup);
router.put("/leave/:id", leaveGroup);

module.exports = router;
