const express = require('express');
const router = express.Router();
const { getEventSeats, getSeat, blockSeats } = require('../controllers/seatController');
const { protect, authorize } = require('../middleware/auth');

router.get('/event/:eventId', getEventSeats);
router.get('/:id', getSeat);
router.put('/block', protect, authorize('organizer', 'admin'), blockSeats);

module.exports = router;
