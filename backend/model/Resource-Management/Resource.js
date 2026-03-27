const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:      { type: String, required: true, minlength: 3, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    minlength: [3, 'Title must be at least 3 characters'],
    trim: true
  },

  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
    trim: true
  },

  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },

  fileType: {
    type: String,
    enum: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'video', 'image', 'link', 'other'],
    required: true
  },

  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },

  topic: { type: String, trim: true },

  tags: [{ type: String, trim: true }],

  resourceType: {
    type: String,
    enum: [
      'lecture_notes', 'past_papers', 'assignments',
      'tutorials', 'project_guides', 'video_tutorials',
      'reference_materials', 'other'
    ],
    required: true
  },

  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  visibility: {
    type: String,
    enum: ['public', 'batch', 'private'],
    default: 'batch'
  },

  allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Analytics
  downloads:     { type: Number, default: 0 },
  views:         { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalRatings:  { type: Number, default: 0 },

  // Comments
  comments: [CommentSchema],

  // Versioning & soft delete
  version:   { type: Number,  default: 1 },
  isDeleted: { type: Boolean, default: false }

}, { timestamps: true });

ResourceSchema.index({ subject: 1, resourceType: 1 });
ResourceSchema.index({ uploader: 1 });
ResourceSchema.index({ visibility: 1 });
ResourceSchema.index({ tags: 1 });

module.exports = mongoose.model('Resource', ResourceSchema);