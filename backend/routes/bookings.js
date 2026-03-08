const express = require('express');
const router = express.Router();
const { reserveSeats, confirmBooking, cancelBooking, getMyBookings, getBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { bookingValidator } = require('../middleware/validators');

router.post('/reserve', protect, bookingValidator, reserveSeats);
router.post('/confirm', protect, confirmBooking);
router.post('/:id/cancel', protect, cancelBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBooking);

module.exports = router;
