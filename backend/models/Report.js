const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['group', 'request', 'user', 'resource'],
    required: true
  },
  referenceId: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true,
    minlength: 10
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Resolved'],
    default: 'Pending'
  },
  reportedBy: {
    type: String,
    required: true
  },
  image: {
    type: String // Path to uploaded file
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);