const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEvent, updateEvent, deleteEvent, getMyEvents, getFeaturedEvents } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

router.get('/featured', getFeaturedEvents);
router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', protect, authorize('organizer', 'admin'), createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);
router.get('/organizer/my-events', protect, authorize('organizer', 'admin'), getMyEvents);

module.exports = router;
