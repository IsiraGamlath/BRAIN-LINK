const mongoose = require("mongoose");

const studyGroupSchema = new mongoose.Schema(
  {
    moduleName: {
      type: String,
      required: true,
      trim: true,
    },
    groupName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    leader: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    batch: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: String,
      required: true,
      trim: true,
    },
    subgroup: {
      type: String,
      required: true,
      trim: true,
    },
    studyType: {
      type: String,
      enum: ["Weekday", "Weekend"],
      required: true,
    },
    maxMembers: {
      type: Number,
      required: true,
      min: 2,
      max: 10,
    },
    members: [
      {
        itNumber: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          enum: ["leader", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["Open", "Full"],
      default: "Open",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyGroup", studyGroupSchema);
