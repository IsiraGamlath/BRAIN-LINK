const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    batch: {
      type: String,
      required: true,
      trim: true,
    },
    subgroup: {
      type: String,
      required: true,
      trim: true,
    },
    leader: {
      type: String,
      required: true,
      trim: true,
    },
    members: {
      type: [String],
      default: [],
    },
    maxMembers: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["Open", "Full"],
      default: "Open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);