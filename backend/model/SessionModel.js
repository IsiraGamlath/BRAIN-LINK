const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    mode: {
        type: String,
        enum: ['Online', 'Physical'],
        required: true
    },
    location: {
        type: String,
        default: null
    },
    meetingLink: {
        type: String,
        default: null
    },
    studentId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Booked', 'Cancelled', 'Completed'],
        default: 'Booked'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Session', sessionSchema);
