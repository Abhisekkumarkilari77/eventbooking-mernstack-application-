const express = require('express');
const router = express.Router();
const { checkinTicket, getMyTickets, getTicket } = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');

router.post('/checkin', protect, authorize('organizer', 'admin'), checkinTicket);
router.get('/my-tickets', protect, getMyTickets);
router.get('/:id', protect, getTicket);

module.exports = router;
