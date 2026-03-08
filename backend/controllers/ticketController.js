const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const EventAnalytics = require('../models/EventAnalytics');

// @desc    Check-in ticket (QR scan)
// @route   POST /api/tickets/checkin
exports.checkinTicket = async (req, res, next) => {
  try {
    const { ticketNumber } = req.body;

    const ticket = await Ticket.findOne({ ticketNumber })
      .populate('eventId', 'title startDate endDate organizerId')
      .populate('seatId', 'seatLabel row seatNumber')
      .populate('userId', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Verify organizer has access
    if (ticket.eventId.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to check-in for this event' });
    }

    if (ticket.ticketStatus === 'used') {
      return res.status(400).json({
        success: false,
        message: 'Ticket already used',
        checkedInAt: ticket.checkedInAt
      });
    }

    if (ticket.ticketStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Ticket has been cancelled' });
    }

    // Mark as used
    ticket.ticketStatus = 'used';
    ticket.checkedInAt = new Date();
    await ticket.save();

    // Update analytics
    await EventAnalytics.findOneAndUpdate(
      { eventId: ticket.eventId._id },
      { $inc: { checkIns: 1 }, lastUpdated: new Date() },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Check-in successful! ✅',
      ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's tickets
// @route   GET /api/tickets/my-tickets
exports.getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ userId: req.user._id })
      .populate({
        path: 'eventId',
        populate: { path: 'venueId', select: 'name city address' }
      })
      .populate('seatId', 'seatLabel row seatNumber price')
      .sort({ issuedAt: -1 });

    res.json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ticket by ID
// @route   GET /api/tickets/:id
exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate({
        path: 'eventId',
        populate: [
          { path: 'venueId' },
          { path: 'performers.artistId', select: 'name stageName' }
        ]
      })
      .populate('seatId')
      .populate('userId', 'name email phone');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};
