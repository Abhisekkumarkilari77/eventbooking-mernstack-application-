const Seat = require('../models/Seat');
const SeatSection = require('../models/SeatSection');

// @desc    Get seats for an event
// @route   GET /api/seats/event/:eventId
exports.getEventSeats = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const sections = await SeatSection.find({ eventId });

    const seatsData = await Promise.all(sections.map(async (section) => {
      const seats = await Seat.find({ sectionId: section._id })
        .sort({ row: 1, seatNumber: 1 });
      return {
        section: section.toObject(),
        seats
      };
    }));

    res.json({ success: true, seatsData });
  } catch (error) {
    next(error);
  }
};

// @desc    Get seat by ID
// @route   GET /api/seats/:id
exports.getSeat = async (req, res, next) => {
  try {
    const seat = await Seat.findById(req.params.id)
      .populate('sectionId')
      .populate('eventId', 'title startDate');

    if (!seat) {
      return res.status(404).json({ success: false, message: 'Seat not found' });
    }

    res.json({ success: true, seat });
  } catch (error) {
    next(error);
  }
};

// @desc    Block/unblock seats (organizer)
// @route   PUT /api/seats/block
exports.blockSeats = async (req, res, next) => {
  try {
    const { seatIds, block } = req.body;

    const status = block ? 'blocked' : 'available';
    await Seat.updateMany(
      { _id: { $in: seatIds } },
      { status }
    );

    res.json({ success: true, message: `Seats ${block ? 'blocked' : 'unblocked'}` });
  } catch (error) {
    next(error);
  }
};
