// controllers/Resource-Management/resourceController.js
const Resource     = require('../../model/Resource-Management/Resource');  // ← fixed path
const User         = require('../../model/User-Management/User');           // ← fixed path
const asyncHandler = require('express-async-handler');

// ─── POST /api/resources ─────────────────────────────────────────────────────
const uploadResource = asyncHandler(async (req, res) => {
  const { title, description, fileUrl, fileType, subject, topic, tags, resourceType, visibility } = req.body;

  // Validation
  if (!title || title.trim().length < 3)       return res.status(400).json({ message: 'Title must be at least 3 characters' });
  if (!subject)                                return res.status(400).json({ message: 'Subject is required' });
  if (!description || description.trim().length < 10) return res.status(400).json({ message: 'Description must be at least 10 characters' });
  if (!fileUrl)                                return res.status(400).json({ message: 'File URL is required' });

  const urlRegex = /^(https?:\/\/).+/;
  if (!urlRegex.test(fileUrl)) return res.status(400).json({ message: 'fileUrl must be a valid URL' });

  const allowedTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'video', 'image', 'link', 'other'];
  if (!allowedTypes.includes(fileType)) return res.status(400).json({ message: `fileType must be one of: ${allowedTypes.join(', ')}` });

  const resource = await Resource.create({
    title: title.trim(),
    description: description.trim(),
    fileUrl,
    fileType,
    subject: subject.trim(),
    topic: topic?.trim() || '',
    tags:  Array.isArray(tags) ? tags : [],
    resourceType: resourceType || 'other',
    uploader: req.user._id,
    visibility: visibility || 'batch'
  });

  await User.findByIdAndUpdate(req.user._id, { $push: { uploadedResources: resource._id } });
  res.status(201).json({ success: true, resource });
});

// ─── GET /api/resources ──────────────────────────────────────────────────────
const getResources = asyncHandler(async (req, res) => {
  const { subject, resourceType, search, sort = '-createdAt', page = 1, limit = 20 } = req.query;

  // Public or own resources
  let query = {
    isDeleted: false,
    $or: [
      { visibility: 'public' },
      { visibility: 'batch' },
      { uploader: req.user._id }
    ]
  };

  if (subject)      query.subject      = { $regex: subject, $options: 'i' };
  if (resourceType) query.resourceType = resourceType;

  if (search) {
    query.$or = [
      { title:   { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { tags:    { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const skip      = (parseInt(page) - 1) * parseInt(limit);
  const resources = await Resource.find(query)
    .populate('uploader', 'fullName slIIId specialization year semester')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Resource.countDocuments(query);
  res.json({ success: true, resources, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// ─── GET /api/resources/:id ──────────────────────────────────────────────────
const getResourceById = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id)
    .populate('uploader', 'fullName slIIId')
    .populate('comments.user', 'fullName');

  if (!resource || resource.isDeleted) return res.status(404).json({ message: 'Resource not found' });

  resource.views += 1;
  await resource.save();

  res.json({ success: true, resource });
});

// ─── PUT /api/resources/:id ──────────────────────────────────────────────────
const updateResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: 'Resource not found' });

  if (resource.uploader.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to edit this resource' });
  }

  const { title, description, subject, topic, tags, visibility, fileType, resourceType } = req.body;

  if (title && title.trim().length < 3) return res.status(400).json({ message: 'Title must be at least 3 characters' });
  if (description && description.trim().length < 10) return res.status(400).json({ message: 'Description must be at least 10 characters' });

  const updated = await Resource.findByIdAndUpdate(
    req.params.id,
    {
      ...(title        && { title: title.trim() }),
      ...(description  && { description: description.trim() }),
      ...(subject      && { subject: subject.trim() }),
      ...(topic        && { topic: topic.trim() }),
      ...(tags         && { tags }),
      ...(visibility   && { visibility }),
      ...(fileType     && { fileType }),
      ...(resourceType && { resourceType }),
      version: resource.version + 1
    },
    { new: true, runValidators: true }
  );

  res.json({ success: true, resource: updated });
});

// ─── DELETE /api/resources/:id ───────────────────────────────────────────────
const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: 'Resource not found' });

  if (resource.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  resource.isDeleted = true;
  await resource.save();
  res.json({ success: true, message: 'Resource deleted successfully' });
});

// ─── POST /api/resources/:id/download ───────────────────────────────────────
const downloadResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource || resource.isDeleted) return res.status(404).json({ message: 'Resource not found' });

  resource.downloads += 1;
  await resource.save();
  res.json({ success: true, fileUrl: resource.fileUrl, message: 'Download started' });
});

// ─── POST /api/resources/:id/rate ───────────────────────────────────────────
const rateResource = asyncHandler(async (req, res) => {
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  const resource = await Resource.findById(req.params.id);
  if (!resource || resource.isDeleted) return res.status(404).json({ message: 'Resource not found' });

  // Simple average re-calculation
  const newTotal    = resource.totalRatings + 1;
  const newAverage  = ((resource.averageRating * resource.totalRatings) + Number(rating)) / newTotal;

  resource.totalRatings  = newTotal;
  resource.averageRating = Math.round(newAverage * 10) / 10;
  await resource.save();

  res.json({ success: true, averageRating: resource.averageRating, totalRatings: resource.totalRatings });
});

// ─── POST /api/resources/:id/comments ───────────────────────────────────────
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length < 3) {
    return res.status(400).json({ message: 'Comment must be at least 3 characters' });
  }

  const resource = await Resource.findById(req.params.id);
  if (!resource || resource.isDeleted) return res.status(404).json({ message: 'Resource not found' });

  resource.comments = resource.comments || [];
  resource.comments.push({ user: req.user._id, text: text.trim(), createdAt: new Date() });
  await resource.save();

  res.status(201).json({ success: true, message: 'Comment added', comments: resource.comments });
});

// ─── GET /api/resources/:id/comments ────────────────────────────────────────
const getComments = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id)
    .select('comments')
    .populate('comments.user', 'fullName');
  if (!resource) return res.status(404).json({ message: 'Resource not found' });
  res.json({ success: true, comments: resource.comments || [] });
});

module.exports = {
  uploadResource, getResources, getResourceById,
  updateResource, deleteResource, downloadResource,
  rateResource, addComment, getComments
};