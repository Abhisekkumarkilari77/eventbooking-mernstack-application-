const EventSchedule = require('../models/EventSchedule');

// @desc    Add schedule to event
// @route   POST /api/schedules
exports.createSchedule = async (req, res, next) => {
  try {
    const schedule = await EventSchedule.create(req.body);
    const populated = await EventSchedule.findById(schedule._id)
      .populate('artistId', 'name stageName genre profileImage');
    res.status(201).json({ success: true, schedule: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get schedules for event
// @route   GET /api/schedules/event/:eventId
exports.getEventSchedules = async (req, res, next) => {
  try {
    const schedules = await EventSchedule.find({ eventId: req.params.eventId })
      .populate('artistId', 'name stageName genre profileImage')
      .sort({ startTime: 1 });
    res.json({ success: true, schedules });
  } catch (error) {
    next(error);
  }
};

// @desc    Update schedule
// @route   PUT /api/schedules/:id
exports.updateSchedule = async (req, res, next) => {
  try {
    const schedule = await EventSchedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('artistId', 'name stageName genre profileImage');

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    res.json({ success: true, schedule });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
exports.deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await EventSchedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    res.json({ success: true, message: 'Schedule deleted' });
  } catch (error) {
    next(error);
  }
};
