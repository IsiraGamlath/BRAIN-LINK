const Session = require('../model/SessionModel');

const isValidDate = (value) => {
    const parsed = new Date(value);
    return !Number.isNaN(parsed.getTime());
};

const getSessionDateTime = (dateValue, startTime) => {
    const sessionDateTime = new Date(dateValue);

    if (Number.isNaN(sessionDateTime.getTime())) {
        return new Date('invalid');
    }

    const [hoursRaw, minutesRaw] = String(startTime || '').split(':');
    const hours = parseInt(hoursRaw, 10);
    const minutes = parseInt(minutesRaw, 10);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        sessionDateTime.setHours(0, 0, 0, 0);
        return sessionDateTime;
    }

    sessionDateTime.setHours(hours, minutes, 0, 0);
    return sessionDateTime;
};

const validateSessionData = (data, isUpdate = false) => {
    const errors = [];

    if (!isUpdate || Object.prototype.hasOwnProperty.call(data, 'subject')) {
        if (!data.subject || !String(data.subject).trim()) {
            errors.push('subject must not be empty');
        }
    }

    if (!isUpdate || Object.prototype.hasOwnProperty.call(data, 'date')) {
        if (!data.date || !isValidDate(data.date)) {
            errors.push('date must be a valid future date');
        } else if (new Date(data.date) <= new Date()) {
            errors.push('date must be a valid future date');
        }
    }

    if (!isUpdate || Object.prototype.hasOwnProperty.call(data, 'startTime')) {
        if (!data.startTime || !String(data.startTime).trim()) {
            errors.push('startTime must not be empty');
        }
    }

    if (!isUpdate || Object.prototype.hasOwnProperty.call(data, 'duration')) {
        if (typeof data.duration !== 'number' || data.duration <= 0) {
            errors.push('duration must be a positive number');
        }
    }

    if (!isUpdate || Object.prototype.hasOwnProperty.call(data, 'mode')) {
        if (!['Online', 'Physical'].includes(data.mode)) {
            errors.push('mode must be either "Online" or "Physical"');
        }
    }

    if (!isUpdate || Object.prototype.hasOwnProperty.call(data, 'studentId')) {
        if (!data.studentId || !String(data.studentId).trim()) {
            errors.push('studentId must not be empty');
        }
    }

    const resolvedMode = data.mode;
    if (resolvedMode === 'Online') {
        if (!data.meetingLink || !String(data.meetingLink).trim()) {
            errors.push('meetingLink is required when mode is "Online"');
        }
    }

    if (resolvedMode === 'Physical') {
        if (!data.location || !String(data.location).trim()) {
            errors.push('location is required when mode is "Physical"');
        }
    }

    return errors;
};

// Get all sessions
const getAll = async (req, res) => {
    try {
        const sessions = await Session.find();
        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sessions', error: error.message });
    }
};

// Get upcoming sessions
const getUpcoming = async (req, res) => {
    try {
        const now = new Date();
        const sessions = await Session.find();

        const upcomingSessions = sessions
            .filter((session) => getSessionDateTime(session.date, session.startTime) >= now)
            .sort(
                (a, b) =>
                    getSessionDateTime(a.date, a.startTime).getTime() -
                    getSessionDateTime(b.date, b.startTime).getTime()
            );

        res.status(200).json(upcomingSessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching upcoming sessions', error: error.message });
    }
};

// Get past sessions
const getPast = async (req, res) => {
    try {
        const now = new Date();
        const sessions = await Session.find();

        const pastSessions = sessions
            .filter((session) => getSessionDateTime(session.date, session.startTime) < now)
            .sort(
                (a, b) =>
                    getSessionDateTime(b.date, b.startTime).getTime() -
                    getSessionDateTime(a.date, a.startTime).getTime()
            );

        res.status(200).json(pastSessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching past sessions', error: error.message });
    }
};

// Create a new session
const create = async (req, res) => {
    try {
        const { subject, date, startTime, duration, mode, location, meetingLink, studentId } = req.body;

        const validationErrors = validateSessionData({ subject, date, startTime, duration, mode, location, meetingLink, studentId });
        if (validationErrors.length > 0) {
            return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
        }

        const newSession = new Session({
            subject,
            date,
            startTime,
            duration,
            mode,
            location,
            meetingLink,
            studentId
        });

        const savedSession = await newSession.save();
        res.status(201).json({ message: 'Session created successfully', session: savedSession });
    } catch (error) {
        res.status(400).json({ message: 'Error creating session', error: error.message });
    }
};

// Get session by ID
const getById = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching session', error: error.message });
    }
};

// Update session
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const existingSession = await Session.findById(id);

        if (!existingSession) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const payload = {
            subject: req.body.subject !== undefined ? req.body.subject : existingSession.subject,
            date: req.body.date !== undefined ? req.body.date : existingSession.date,
            startTime: req.body.startTime !== undefined ? req.body.startTime : existingSession.startTime,
            duration: req.body.duration !== undefined ? req.body.duration : existingSession.duration,
            mode: req.body.mode !== undefined ? req.body.mode : existingSession.mode,
            location: req.body.location !== undefined ? req.body.location : existingSession.location,
            meetingLink: req.body.meetingLink !== undefined ? req.body.meetingLink : existingSession.meetingLink,
            studentId: req.body.studentId !== undefined ? req.body.studentId : existingSession.studentId
        };

        const validationErrors = validateSessionData(payload, true);
        if (validationErrors.length > 0) {
            return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
        }

        const updatedSession = await Session.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        res.status(200).json({ message: 'Session updated successfully', session: updatedSession });
    } catch (error) {
        res.status(500).json({ message: 'Error updating session', error: error.message });
    }
};

// Cancel session
const cancel = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const currentDateTime = new Date();
        const sessionDateTime = getSessionDateTime(session.date, session.startTime);

        if (currentDateTime >= sessionDateTime) {
            return res.status(400).json({ message: 'Cannot cancel a past session' });
        }

        const updatedSession = await Session.findByIdAndUpdate(
            req.params.id,
            { status: 'Cancelled' },
            { new: true }
        );

        res.status(200).json({ message: 'Session cancelled successfully', session: updatedSession });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling session', error: error.message });
    }
};

// Delete session
const remove = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        await Session.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Session deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting session', error: error.message });
    }
};

module.exports = {
    getAll,
    getUpcoming,
    getPast,
    create,
    getById,
    update,
    cancel,
    remove
};
