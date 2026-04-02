const StudentProfile = require("../models/StudentProfile");

// Save or update student profile
const saveStudentProfile = async (req, res) => {
  try {
    const { itNumber, specialization, batch, semester, studyType, subgroup } = req.body;

    // Validation
    if (!itNumber || String(itNumber).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "IT Number is required",
      });
    }

    if (!specialization || String(specialization).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Specialization is required",
      });
    }

    if (!batch || String(batch).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Batch is required",
      });
    }

    // Batch validation: exactly 3 digits, no letters, positive numbers
    const batchStr = String(batch).trim();
    
    // Check if exactly 3 digits
    if (!/^\d{3}$/.test(batchStr)) {
      return res.status(400).json({
        success: false,
        message: "Batch must be exactly 3 digits",
      });
    }

    // Check if it's a positive number (reject "000")
    const batchNum = parseInt(batchStr, 10);
    if (batchNum === 0) {
      return res.status(400).json({
        success: false,
        message: "Batch must be a positive number (cannot be 000)",
      });
    }

    if (!semester || String(semester).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Semester is required",
      });
    }

    if (!studyType || studyType.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Study Type is required",
      });
    }

    if (studyType !== "Weekday" && studyType !== "Weekend") {
      return res.status(400).json({
        success: false,
        message: "Study Type must be either Weekday or Weekend",
      });
    }

    if (!subgroup || subgroup.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Subgroup is required",
      });
    }

    // Find existing profile or create new
    let profile = await StudentProfile.findOne({ itNumber: itNumber.trim() });

    if (profile) {
      // Update existing profile
      profile.specialization = specialization.trim();
      profile.batch = batch.trim();
      profile.semester = semester.trim();
      profile.studyType = studyType.trim();
      profile.subgroup = subgroup.trim();
      profile.updatedAt = new Date();
      await profile.save();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        profile,
      });
    } else {
      // Create new profile
      const newProfile = new StudentProfile({
        itNumber: itNumber.trim(),
        specialization: specialization.trim(),
        batch: batch.trim(),
        semester: semester.trim(),
        studyType: studyType.trim(),
        subgroup: subgroup.trim(),
      });

      await newProfile.save();

      return res.status(201).json({
        success: true,
        message: "Profile created successfully",
        profile: newProfile,
      });
    }
  } catch (error) {
    console.error("SAVE PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error saving profile",
      error: error.message,
    });
  }
};

// Get student profile
const getStudentProfile = async (req, res) => {
  try {
    const { itNumber } = req.params;

    if (!itNumber || itNumber.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "IT Number is required",
      });
    }

    const profile = await StudentProfile.findOne({ itNumber: itNumber.trim() });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      profile,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving profile",
      error: error.message,
    });
  }
};

module.exports = {
  saveStudentProfile,
  getStudentProfile,
};
