const express = require('express');
const router = express.Router();
const { createSchedule, getEventSchedules, updateSchedule, deleteSchedule } = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('organizer', 'admin'), createSchedule);
router.get('/event/:eventId', getEventSchedules);
router.put('/:id', protect, authorize('organizer', 'admin'), updateSchedule);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteSchedule);

module.exports = router;
