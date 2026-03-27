// routes/Resource-Management/resourceRoutes.js — Enhanced resource routes
const express = require('express');
const router  = express.Router();
const {
  uploadResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
  downloadResource,
  rateResource,
  addComment,
  getComments
} = require('../../controllers/Resource-Management/resourceController');

const { protect } = require('../../middleware/auth');
const { apiLimiter } = require('../../middleware/rateLimiter');

router.use(protect); // All resource routes require authentication

router.route('/')
  .get(getResources)
  .post(apiLimiter, uploadResource);

router.route('/:id')
  .get(getResourceById)
  .put(updateResource)
  .delete(deleteResource);

router.post('/:id/download', downloadResource);
router.post('/:id/rate',     rateResource);
router.post('/:id/comments', addComment);
router.get( '/:id/comments', getComments);

module.exports = router;