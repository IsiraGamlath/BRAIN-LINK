const StudyGroup = require("../models/StudyGroup");
const StudentProfile = require("../models/StudentProfile");
const JoinRequest = require("../models/JoinRequest");
const mongoose = require("mongoose");

// Utility function to update status
const updateGroupStatus = (group) => {
  if (group.members.length >= group.maxMembers) {
    group.status = "Full";
  } else {
    group.status = "Open";
  }
};

// Validate required fields with trim check
const isBlankOrEmpty = (value) => {
  return !value || String(value).trim() === "";
};

const resolveCurrentUser = (req) => {
  const payloadUser = req.body?.currentUser || {};

  return {
    itNumber: payloadUser.itNumber || req.body?.itNumber || req.body?.leader,
    specialization: payloadUser.specialization || req.body?.specialization,
    batch: payloadUser.batch || req.body?.batch,
    semester: payloadUser.semester || req.body?.semester,
    subgroup: payloadUser.subgroup || req.body?.subgroup,
    studyType: payloadUser.studyType || req.body?.studyType,
  };
};

// Create project group
const createStudyGroup = async (req, res) => {
  try {
    const { moduleName, groupName, description, maxMembers } = req.body;
    const currentUser = resolveCurrentUser(req);
    const leaderItNumber = currentUser.itNumber;
    const specialization = currentUser.specialization;
    const batch = currentUser.batch;
    const semester = currentUser.semester;
    const subgroup = currentUser.subgroup;
    const studyType = currentUser.studyType;

    // Validation
    if (isBlankOrEmpty(moduleName)) {
      return res.status(400).json({
        success: false,
        message: "Module Name is required",
      });
    }

    if (isBlankOrEmpty(groupName)) {
      return res.status(400).json({
        success: false,
        message: "Group Name is required",
      });
    }

    if (String(groupName).trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Group Name must be at least 3 characters",
      });
    }

    if (isBlankOrEmpty(description)) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    if (String(description).trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Description must be at least 10 characters",
      });
    }

    if (!maxMembers) {
      return res.status(400).json({
        success: false,
        message: "Maximum Members is required",
      });
    }

    const parsedMaxMembers = Number(maxMembers);

    if (isNaN(parsedMaxMembers) || parsedMaxMembers < 2 || parsedMaxMembers > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum members must be between 2 and 10",
      });
    }

    if (!studyType || (studyType !== "Weekday" && studyType !== "Weekend")) {
      return res.status(400).json({
        success: false,
        message: "Study Type must be either Weekday or Weekend",
      });
    }

    if (isBlankOrEmpty(leaderItNumber)) {
      return res.status(400).json({
        success: false,
        message: "Current user IT Number is required",
      });
    }

    if (
      isBlankOrEmpty(specialization) ||
      isBlankOrEmpty(batch) ||
      isBlankOrEmpty(semester) ||
      isBlankOrEmpty(subgroup)
    ) {
      return res.status(400).json({
        success: false,
        message: "Current user academic context is required",
      });
    }

    // Check if student already leads a group for this module
    const existingLeadGroup = await StudyGroup.findOne({
      moduleName: moduleName.trim(),
      leader: leaderItNumber.trim(),
    });

    if (existingLeadGroup) {
      return res.status(400).json({
        success: false,
        message: "You already lead a project group for this module",
      });
    }

    // Check if student already belongs to a group for this module
    const existingMemberGroup = await StudyGroup.findOne({
      moduleName: moduleName.trim(),
      "members.itNumber": leaderItNumber.trim(),
    });

    if (existingMemberGroup) {
      return res.status(400).json({
        success: false,
        message: "You already belong to a project group for this module",
      });
    }

    // Create new group with leader as first member
    const newGroup = new StudyGroup({
      moduleName: moduleName.trim(),
      groupName: groupName.trim(),
      description: description.trim(),
      leader: leaderItNumber.trim(),
      specialization: specialization.trim(),
      batch: batch.trim(),
      semester: semester.trim(),
      subgroup: subgroup.trim(),
      studyType,
      maxMembers: parsedMaxMembers,
      members: [
        {
          itNumber: leaderItNumber.trim(),
          role: "leader",
          joinedAt: new Date(),
        },
      ],
      status: "Open",
    });

    await newGroup.save();

    return res.status(201).json({
      success: true,
      message: "Project group created successfully",
      group: newGroup,
    });
  } catch (error) {
    console.error("CREATE GROUP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating project group",
      error: error.message,
    });
  }
};

// Get relevant groups for student
const getRelevantGroups = async (req, res) => {
  try {
    const { itNumber } = req.query;

    if (!itNumber || itNumber.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "IT Number is required",
      });
    }

    // Get student profile
    const studentProfile = await StudentProfile.findOne({ itNumber: itNumber.trim() });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found. Please complete your academic profile first.",
      });
    }

    // Find groups matching specialization, batch, semester, study type, and subgroup
    const relevantGroups = await StudyGroup.find({
      specialization: studentProfile.specialization,
      batch: studentProfile.batch,
      semester: studentProfile.semester,
      studyType: studentProfile.studyType,
      subgroup: studentProfile.subgroup,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Relevant groups retrieved successfully",
      groups: relevantGroups,
      studentProfile,
    });
  } catch (error) {
    console.error("GET RELEVANT GROUPS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving relevant groups",
      error: error.message,
    });
  }
};

// Get all groups
const getAllGroups = async (req, res) => {
  try {
    const groups = await StudyGroup.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "All groups retrieved successfully",
      groups,
    });
  } catch (error) {
    console.error("GET ALL GROUPS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving groups",
      error: error.message,
    });
  }
};

// Get group by ID
const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    const group = await StudyGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Group retrieved successfully",
      group,
    });
  } catch (error) {
    console.error("GET GROUP BY ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving group",
      error: error.message,
    });
  }
};

// Join group (creates join request)
const joinGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const currentUser = resolveCurrentUser(req);
    const requesterItNumber = currentUser.itNumber;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    if (!requesterItNumber || requesterItNumber.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Current user IT Number is required",
      });
    }

    const group = await StudyGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if group is full
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({
        success: false,
        message: "This group is full",
      });
    }

    // Check if already a member
    const isMember = group.members.some((member) => member.itNumber === requesterItNumber.trim());

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this group",
      });
    }

    // Check if already belongs to another group for this module
    const otherGroupForModule = await StudyGroup.findOne({
      moduleName: group.moduleName,
      "members.itNumber": requesterItNumber.trim(),
    });

    if (otherGroupForModule) {
      return res.status(400).json({
        success: false,
        message: "You already belong to another project group for this module",
      });
    }

    // Check if already requested
    const existingRequest = await JoinRequest.findOne({
      groupId: id,
      studentItNumber: requesterItNumber.trim(),
      status: "Pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You have already sent a request to this group",
      });
    }

    // Check if already has accepted request for same module
    const acceptedRequestExists = await JoinRequest.findOne({
      moduleName: group.moduleName,
      studentItNumber: requesterItNumber.trim(),
      status: "Accepted",
    });

    if (acceptedRequestExists) {
      return res.status(400).json({
        success: false,
        message: "You already have an accepted request for this module",
      });
    }

    // Create join request
    const joinRequest = new JoinRequest({
      groupId: id,
      moduleName: group.moduleName,
      studentItNumber: requesterItNumber.trim(),
      message: message ? message.trim() : "",
      status: "Pending",
    });

    await joinRequest.save();

    return res.status(201).json({
      success: true,
      message: "Join request sent successfully. Waiting for group leader approval.",
      request: joinRequest,
    });
  } catch (error) {
    console.error("JOIN GROUP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending join request",
      error: error.message,
    });
  }
};

// Direct add to group (for testing/demo purposes)
const directJoinGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { itNumber } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    if (!itNumber || itNumber.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "IT Number is required",
      });
    }

    const group = await StudyGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if group is full
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({
        success: false,
        message: "Group is full",
      });
    }

    // Check if already a member
    const isMember = group.members.some((member) => member.itNumber === itNumber.trim());

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this group",
      });
    }

    // Add member
    group.members.push({
      itNumber: itNumber.trim(),
      role: "member",
      joinedAt: new Date(),
    });

    updateGroupStatus(group);
    await group.save();

    return res.status(200).json({
      success: true,
      message: "Joined group successfully",
      group,
    });
  } catch (error) {
    console.error("DIRECT JOIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error joining group",
      error: error.message,
    });
  }
};

// Leave group
const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = resolveCurrentUser(req);
    const requesterItNumber = currentUser.itNumber;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    if (!requesterItNumber || requesterItNumber.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Current user IT Number is required",
      });
    }

    const group = await StudyGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if member
    const isMember = group.members.some((member) => member.itNumber === requesterItNumber.trim());

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    // Check if leader
    if (group.leader === requesterItNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: "Group leader cannot leave the group",
      });
    }

    // Remove member
    group.members = group.members.filter((member) => member.itNumber !== requesterItNumber.trim());

    updateGroupStatus(group);
    await group.save();

    return res.status(200).json({
      success: true,
      message: "Left group successfully",
      group,
    });
  } catch (error) {
    console.error("LEAVE GROUP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error leaving group",
      error: error.message,
    });
  }
};

// Delete group (only leader can delete)
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = resolveCurrentUser(req);
    const requesterItNumber = currentUser.itNumber;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    if (!requesterItNumber || requesterItNumber.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Current user IT Number is required",
      });
    }

    const group = await StudyGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if requester is the group leader
    if (group.leader !== requesterItNumber.trim()) {
      return res.status(403).json({
        success: false,
        message: "Only the group leader can delete the group",
      });
    }

    // Delete the group
    await StudyGroup.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    console.error("DELETE GROUP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting group",
      error: error.message,
    });
  }
};

// Update maximum members (only leader can update)
const updateMaxMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { maxMembers } = req.body;
    const currentUser = resolveCurrentUser(req);
    const requesterItNumber = currentUser.itNumber;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    if (!requesterItNumber || requesterItNumber.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Current user IT Number is required",
      });
    }

    const group = await StudyGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if requester is the group leader
    if (group.leader !== requesterItNumber.trim()) {
      return res.status(403).json({
        success: false,
        message: "Only the group leader can update maximum members",
      });
    }

    // Validate input
    if (!maxMembers) {
      return res.status(400).json({
        success: false,
        message: "Maximum members is required",
      });
    }

    const parsedMaxMembers = Number(maxMembers);

    if (isNaN(parsedMaxMembers)) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
      });
    }

    if (parsedMaxMembers <= 0) {
      return res.status(400).json({
        success: false,
        message: "Maximum members must be greater than 0",
      });
    }

    if (parsedMaxMembers < 2 || parsedMaxMembers > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum members must be between 2 and 10",
      });
    }

    // Check if new maximum is less than current member count
    if (parsedMaxMembers < group.members.length) {
      return res.status(400).json({
        success: false,
        message: "Maximum members cannot be less than current members",
      });
    }

    // Update maxMembers
    group.maxMembers = parsedMaxMembers;

    // Update status based on new maxMembers
    updateGroupStatus(group);
    await group.save();

    return res.status(200).json({
      success: true,
      message: "Maximum members updated successfully",
      group,
    });
  } catch (error) {
    console.error("UPDATE MAX MEMBERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating maximum members",
      error: error.message,
    });
  }
};

const getGroupNames = async (req, res) => {
  try {
    const groups = await StudyGroup.find({}, '_id groupName');
    res.status(200).json(groups.map(g => ({ _id: g._id, name: g.groupName })));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createStudyGroup,
  getRelevantGroups,
  getAllGroups,
  getGroupById,
  joinGroup,
  directJoinGroup,
  leaveGroup,
  deleteGroup,
  updateMaxMembers,
  getGroupNames,
};
