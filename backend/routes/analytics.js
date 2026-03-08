const express = require('express');
const router = express.Router();
const { getEventAnalytics, getDashboardAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/event/:eventId', protect, authorize('organizer', 'admin'), getEventAnalytics);
router.get('/dashboard', protect, authorize('organizer', 'admin'), getDashboardAnalytics);

module.exports = router;
