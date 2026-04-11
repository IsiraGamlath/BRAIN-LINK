const HelpRequest = require('../model/Peer_Help_Request');

// ==========================
// CREATE OPERATIONS
// ==========================

// Controller: Create a new help request
// POST /api/help
// Body: { userId, subject, description, helpType }
exports.createHelpRequest = async (req, res) => {
  try {
    const { userId, subject, description, helpType } = req.body;

    // Validate required fields
    if (!subject || !description) {
      return res.status(400).json({ message: 'Subject and description are required' });
    }

    // Create new help request
    const newRequest = new HelpRequest({
      userId: userId || 'anonymousUser',
      subject,
      description,
      helpType: helpType || 'chat',
    });

    // Save to database
    await newRequest.save();
    res.status(201).json({ message: 'Help request created', data: newRequest });
  } catch (error) {
    res.status(500).json({ message: 'Error creating help request', error: error.message });
  }
};

// ==========================
// READ OPERATIONS
// ==========================

// Controller: Fetch all open help requests
// GET /api/help
exports.getAllHelpRequests = async (req, res) => {
  try {
    // Get all requests with 'Open' status, sorted by newest first
    const requests = await HelpRequest.find({ status: 'Open' }).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching help requests', error: error.message });
  }
};

// Controller: Fetch a single help request by ID
// GET /api/help/:id
exports.getHelpRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find request by ID
    const request = await HelpRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching help request', error: error.message });
  }
};

// Controller: Fetch user's help requests
// GET /api/help/my/:userId
exports.getUserHelpRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all requests from a specific user, sorted by newest first
    const requests = await HelpRequest.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user requests', error: error.message });
  }
};

// Controller: Fetch help requests where user is requester or helper
// GET /api/help/inbox/:userId
exports.getUserInboxHelpRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    const normalizedUserId = String(userId || '').trim();

    if (!normalizedUserId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Escape user-supplied input before building regex for safe case-insensitive matching.
    const escapedUserId = normalizedUserId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const identityMatcher = new RegExp(`^${escapedUserId}$`, 'i');

    const requests = await HelpRequest.find({
      $or: [
        { userId: identityMatcher },
        { helperId: identityMatcher },
      ],
    }).sort({ updatedAt: -1, createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inbox requests', error: error.message });
  }
};

// ==========================
// UPDATE OPERATIONS
// ==========================

// Controller: Respond to a help request
// POST /api/help/:id/respond
// Body: { helperId, helperMessage }
// Changes status to 'Accepted'
exports.respondToHelpRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { helperId, helperMessage } = req.body;

    const normalizedHelperId = String(helperId || 'helper').trim() || 'helper';
    const normalizedHelperMessage = String(helperMessage || '').trim();

    const request = await HelpRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    request.status = 'Accepted';
    request.helperId = normalizedHelperId;
    request.helperMessage = normalizedHelperMessage;

    // Keep chat history consistent by mirroring first helper response into messages.
    if (normalizedHelperMessage) {
      const alreadyExists = Array.isArray(request.messages)
        && request.messages.some((message) => {
          return (
            String(message.senderId || '').trim().toLowerCase() === normalizedHelperId.toLowerCase()
            && String(message.text || '').trim() === normalizedHelperMessage
          );
        });

      if (!alreadyExists) {
        request.messages.push({
          senderId: normalizedHelperId,
          senderName: normalizedHelperId,
          text: normalizedHelperMessage,
          createdAt: new Date(),
        });
      }
    }

    request.updatedAt = Date.now();
    await request.save();

    res.status(200).json({ message: 'Response submitted', data: request });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting response', error: error.message });
  }
};

// Controller: Update a help request (only when status is 'Open')
// PUT /api/help/:id
// Body: { subject, description, helpType }
exports.updateHelpRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, description, helpType } = req.body;

    // Fetch the request to check status
    const request = await HelpRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    // Only allow editing if status is 'Open'
    if (request.status !== 'Open') {
      return res.status(400).json({
        message: `Cannot edit request. Status is ${request.status}. Only Open requests can be edited.`
      });
    }

    // Validate required fields
    if (!subject || !description) {
      return res.status(400).json({ message: 'Subject and description are required' });
    }

    // Update the request
    const updatedRequest = await HelpRequest.findByIdAndUpdate(
      id,
      {
        subject,
        description,
        helpType: helpType || request.helpType,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({ message: 'Help request updated successfully', data: updatedRequest });
  } catch (error) {
    res.status(500).json({ message: 'Error updating help request', error: error.message });
  }
};

// Controller: Close a help request
// PUT /api/help/:id/close
// Changes status to 'Closed'
exports.closeHelpRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and update the request
    const request = await HelpRequest.findByIdAndUpdate(
      id,
      {
        status: 'Closed',
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    res.status(200).json({ message: 'Help request closed', data: request });
  } catch (error) {
    res.status(500).json({ message: 'Error closing request', error: error.message });
  }
};

// ==========================
// DELETE OPERATIONS
// ==========================

// Controller: Delete a help request (only when status is 'Open')
// DELETE /api/help/:id
exports.deleteHelpRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the request to check status
    const request = await HelpRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    // Only allow deletion if status is 'Open'
    if (request.status !== 'Open') {
      return res.status(400).json({
        message: `Cannot delete request. Status is ${request.status}. Only Open requests can be deleted.`
      });
    }

    // Delete the request
    await HelpRequest.findByIdAndDelete(id);

    res.status(200).json({ message: 'Help request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting help request', error: error.message });
  }
};

// ==========================
// CHAT OPERATIONS
// ==========================

// Controller: Get all messages for a help request
// GET /api/help/:id/messages
exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the request and get messages
    const request = await HelpRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    res.status(200).json({ 
      message: 'Messages retrieved', 
      data: request.messages || [] 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

// Controller: Add a new message to a help request
// POST /api/help/:id/messages
// Body: { senderId, senderName, text }
exports.addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { senderId, senderName, text } = req.body;

    console.log("AddMessage called with:", { id, senderId, senderName, text });

    // Validate required fields - at least senderId and text
    if (!senderId || !text) {
      console.log("Validation failed - missing senderId or text");
      return res.status(400).json({ 
        message: 'senderId and text are required',
        received: { senderId, senderName, text }
      });
    }

    // Find the request and add message
    const request = await HelpRequest.findById(id);

    if (!request) {
      console.log("Request not found:", id);
      return res.status(404).json({ message: 'Help request not found' });
    }

    console.log("Found request, messages count before:", request.messages?.length || 0);

    // Initialize messages array if it doesn't exist
    if (!request.messages) {
      request.messages = [];
    }

    // Add message to messages array
    const newMsg = {
      senderId,
      senderName: senderName || senderId,
      text,
      createdAt: new Date(),
    };

    request.messages.push(newMsg);

    console.log("Message added, saving...");

    // Update the request
    request.updatedAt = new Date();
    await request.save();

    console.log("Request saved successfully");

    res.status(200).json({ 
      message: 'Message added successfully', 
      data: request.messages 
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ 
      message: 'Server error adding message', 
      error: error.message,
      details: error.toString()
    });
  }
};
