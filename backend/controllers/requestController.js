const JoinRequest = require("../models/JoinRequest");
const StudyGroup = require("../models/StudyGroup");
const mongoose = require("mongoose");

const getRequesterItNumber = (req) => {
  return req.body?.currentUser?.itNumber || req.body?.itNumber || req.query?.itNumber;
};

// Get join requests for a group
const getGroupRequests = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterItNumber = getRequesterItNumber(req);

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

    if (group.leader !== requesterItNumber.trim()) {
      return res.status(403).json({
        success: false,
        message: "Only group leader can view join requests",
      });
    }

    const requests = await JoinRequest.find({
      groupId: id,
      status: "Pending",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Requests retrieved successfully",
      requests,
      group,
    });
  } catch (error) {
    console.error("GET REQUESTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving requests",
      error: error.message,
    });
  }
};

// Accept join request
const acceptJoinRequest = async (req, res) => {
  try {
    const { id, requestId } = req.params;
    const { action } = req.body;
    const requesterItNumber = getRequesterItNumber(req);

    if (!action || action !== "accept") {
      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });
    }

    if (!requesterItNumber || requesterItNumber.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Current user IT Number is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID",
      });
    }

    const group = await StudyGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    if (group.leader !== requesterItNumber.trim()) {
      return res.status(403).json({
        success: false,
        message: "Only group leader can accept join requests",
      });
    }

    const joinRequest = await JoinRequest.findById(requestId);

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: "Join request not found",
      });
    }

    if (joinRequest.groupId.toString() !== id) {
      return res.status(400).json({
        success: false,
        message: "Request does not belong to this group",
      });
    }

    if (joinRequest.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Request is already ${joinRequest.status.toLowerCase()}`,
      });
    }

    if (group.members.length >= group.maxMembers) {
      joinRequest.status = "Rejected";
      await joinRequest.save();

      return res.status(400).json({
        success: false,
        message: "Group is full",
      });
    }

    const isMember = group.members.some((member) => member.itNumber === joinRequest.studentItNumber);

    if (isMember) {
      joinRequest.status = "Rejected";
      await joinRequest.save();

      return res.status(400).json({
        success: false,
        message: "Student is already a member",
      });
    }

    const enrolledInAnotherGroupForModule = await StudyGroup.findOne({
      _id: { $ne: group._id },
      moduleName: group.moduleName,
      "members.itNumber": joinRequest.studentItNumber,
    });

    if (enrolledInAnotherGroupForModule) {
      joinRequest.status = "Rejected";
      await joinRequest.save();

      return res.status(400).json({
        success: false,
        message: "Student already belongs to another group for this module",
      });
    }

    group.members.push({
      itNumber: joinRequest.studentItNumber,
      role: "member",
      joinedAt: new Date(),
    });

    if (group.members.length >= group.maxMembers) {
      group.status = "Full";
    }

    await group.save();

    joinRequest.status = "Accepted";
    await joinRequest.save();

    return res.status(200).json({
      success: true,
      message: "Join request accepted successfully",
      group,
      request: joinRequest,
    });
  } catch (error) {
    console.error("ACCEPT REQUEST ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error accepting join request",
      error: error.message,
    });
  }
};

// Reject join request
const rejectJoinRequest = async (req, res) => {
  try {
    const { id, requestId } = req.params;
    const { action } = req.body;
    const requesterItNumber = getRequesterItNumber(req);

    if (!action || action !== "reject") {
      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });
    }

    if (!requesterItNumber || requesterItNumber.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Current user IT Number is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID",
      });
    }

    const group = await StudyGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    if (group.leader !== requesterItNumber.trim()) {
      return res.status(403).json({
        success: false,
        message: "Only group leader can reject join requests",
      });
    }

    const joinRequest = await JoinRequest.findById(requestId);

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: "Join request not found",
      });
    }

    if (joinRequest.groupId.toString() !== id) {
      return res.status(400).json({
        success: false,
        message: "Request does not belong to this group",
      });
    }

    if (joinRequest.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Request is already ${joinRequest.status.toLowerCase()}`,
      });
    }

    joinRequest.status = "Rejected";
    await joinRequest.save();

    return res.status(200).json({
      success: true,
      message: "Join request rejected successfully",
      request: joinRequest,
    });
  } catch (error) {
    console.error("REJECT REQUEST ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error rejecting join request",
      error: error.message,
    });
  }
};

// Get student's requests
const getStudentRequests = async (req, res) => {
  try {
    const requesterItNumber = getRequesterItNumber(req);

    if (!requesterItNumber || requesterItNumber.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Current user IT Number is required",
      });
    }

    const requests = await JoinRequest.find({
      studentItNumber: requesterItNumber.trim(),
    })
      .populate("groupId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Student requests retrieved successfully",
      requests,
    });
  } catch (error) {
    console.error("GET STUDENT REQUESTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving student requests",
      error: error.message,
    });
  }
};

module.exports = {
  getGroupRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  getStudentRequests,
};
