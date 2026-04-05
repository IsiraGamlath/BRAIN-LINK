const mongoose = require('mongoose');

// Message Schema - Defines structure for chat messages
const messageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true,
    description: 'ID of the user sending the message',
  },
  senderName: {
    type: String,
    required: true,
    description: 'Name of the user sending the message',
  },
  text: {
    type: String,
    required: true,
    description: 'The message content',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    description: 'When the message was sent',
  },
});

// Help Request Schema - Defines structure for peer help requests
const helpRequestSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    description: 'ID of the student requesting help',
  },
  subject: {
    type: String,
    required: true,
    description: 'Topic or subject of the help request',
  },
  description: {
    type: String,
    required: true,
    description: 'Detailed description of what help is needed',
  },
  helpType: {
    type: String,
    enum: ['chat', 'session'],
    default: 'chat',
    description: 'Type of help: chat (quick) or session (detailed)',
  },
  status: {
    type: String,
    enum: ['Open', 'Accepted', 'Closed'],
    default: 'Open',
    description: 'Current status of the request',
  },
  helperId: {
    type: String,
    default: null,
    description: 'ID of the helper who responded to this request',
  },
  helperMessage: {
    type: String,
    default: null,
    description: 'Message from the helper responding to the request',
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
    description: 'When the request was created',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    description: 'When the request was last updated',
  },
});

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
