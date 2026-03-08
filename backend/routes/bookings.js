const express = require('express');
const router = express.Router();
const { bookNow, reserveSeats, confirmBooking, cancelBooking, getMyBookings, getBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { bookingValidator } = require('../middleware/validators');

// Single-step instant booking (no transaction needed)
router.post('/book', protect, bookNow);

// Legacy two-step flow (kept for reference)
router.post('/reserve', protect, bookingValidator, reserveSeats);
router.post('/confirm', protect, confirmBooking);
router.post('/:id/cancel', protect, cancelBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBooking);

module.exports = router;
