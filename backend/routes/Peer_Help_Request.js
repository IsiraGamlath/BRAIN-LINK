const express = require('express');
const router = express.Router();
const controller = require('../controllers/Peer_Help_Request');

// ==============================
// CREATE ROUTES
// ==============================

// POST /api/help
// Create a new help request
// Body: { userId, subject, description, helpType }
router.post('/', controller.createHelpRequest);

// ==============================
// READ ROUTES
// ==============================

// GET /api/help
// Fetch all open help requests (main feed)
router.get('/', controller.getAllHelpRequests);

// GET /api/help/my/:userId
// Fetch user's own help requests (my requests page)
// Must be BEFORE /:id route to avoid conflicts
router.get('/my/:userId', controller.getUserHelpRequests);

// ==============================
// CHAT ROUTES (BEFORE :id catch-all)
// ==============================

// GET /api/help/:id/messages
// Fetch all messages for a help request
// Returns: Array of messages with senderId, senderName, text, createdAt
router.get('/:id/messages', controller.getMessages);

// POST /api/help/:id/messages
// Add a new message to a help request
// Body: { senderId, senderName, text }
router.post('/:id/messages', controller.addMessage);

// ==============================
// SPECIFIC ID ROUTES
// ==============================

// GET /api/help/:id
// Fetch a single help request by ID
router.get('/:id', controller.getHelpRequestById);

// ==============================
// UPDATE ROUTES
// ==============================

// PUT /api/help/:id
// Update a help request (only when status is 'Open')
// Body: { subject, description, helpType }
router.put('/:id', controller.updateHelpRequest);

// POST /api/help/:id/respond
// Submit a response to a help request (changes status to 'Accepted')
// Body: { helperId, helperMessage }
router.post('/:id/respond', controller.respondToHelpRequest);

// PUT /api/help/:id/close
// Close a help request (changes status to 'Closed')
router.put('/:id/close', controller.closeHelpRequest);

// ==============================
// DELETE ROUTES
// ==============================

// DELETE /api/help/:id
// Delete a help request (only when status is 'Open')
router.delete('/:id', controller.deleteHelpRequest);

module.exports = router;
