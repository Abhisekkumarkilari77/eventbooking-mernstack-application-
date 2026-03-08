const express = require('express');
const router = express.Router();
const { createVenue, getVenues, getVenue, updateVenue, deleteVenue } = require('../controllers/venueController');
const { protect, authorize } = require('../middleware/auth');
const { venueValidator } = require('../middleware/validators');

router.get('/', getVenues);
router.get('/:id', getVenue);
router.post('/', protect, authorize('organizer', 'admin'), venueValidator, createVenue);
router.put('/:id', protect, authorize('organizer', 'admin'), updateVenue);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteVenue);

module.exports = router;
