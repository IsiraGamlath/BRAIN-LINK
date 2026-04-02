const express = require('express');
const router = express.Router();
const SessionController = require('../controllers/SessionController');

// GET all sessions
router.get('/', SessionController.getAll);

// GET upcoming sessions
router.get('/upcoming', SessionController.getUpcoming);

// GET past sessions
router.get('/past', SessionController.getPast);

// POST create new session
router.post('/', SessionController.create);

// PUT cancel session
router.put('/cancel/:id', SessionController.cancel);

// GET session by ID
router.get('/:id', SessionController.getById);

// PUT update session
router.put('/:id', SessionController.update);

// DELETE remove session
router.delete('/:id', SessionController.remove);

module.exports = router;
