const EventAnalytics = require('../models/EventAnalytics');
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Get analytics for an event
// @route   GET /api/analytics/event/:eventId
exports.getEventAnalytics = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // Get or create analytics
    let analytics = await EventAnalytics.findOne({ eventId });
    if (!analytics) {
      analytics = await EventAnalytics.create({ eventId });
    }

    // Get ticket status breakdown
    const ticketBreakdown = await Ticket.aggregate([
      { $match: { eventId: require('mongoose').Types.ObjectId(eventId) } },
      { $group: { _id: '$ticketStatus', count: { $sum: 1 } } }
    ]);

    // Get booking status breakdown
    const bookingBreakdown = await Booking.aggregate([
      { $match: { eventId: require('mongoose').Types.ObjectId(eventId) } },
      { $group: { _id: '$bookingStatus', count: { $sum: 1 } } }
    ]);

    const event = await Event.findById(eventId).select('totalSeats availableSeats title');

    res.json({
      success: true,
      analytics,
      ticketBreakdown,
      bookingBreakdown,
      seatUtilization: event ? ((event.totalSeats - event.availableSeats) / event.totalSeats * 100).toFixed(1) : 0
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard analytics for organizer
// @route   GET /api/analytics/dashboard
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const events = await Event.find({ organizerId: req.user._id }).select('_id');
    const eventIds = events.map(e => e._id);

    const totalEvents = events.length;

    const overallStats = await EventAnalytics.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$revenue' },
          totalTicketsSold: { $sum: '$ticketsSold' },
          totalCheckIns: { $sum: '$checkIns' },
          totalCancellations: { $sum: '$cancellations' }
        }
      }
    ]);

    // Recent bookings
    const recentBookings = await Booking.find({ eventId: { $in: eventIds } })
      .populate('userId', 'name email')
      .populate('eventId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    // Top events by revenue
    const topEvents = await EventAnalytics.find({ eventId: { $in: eventIds } })
      .populate('eventId', 'title category startDate')
      .sort({ revenue: -1 })
      .limit(5);

    res.json({
      success: true,
      totalEvents,
      stats: overallStats[0] || { totalRevenue: 0, totalTicketsSold: 0, totalCheckIns: 0, totalCancellations: 0 },
      recentBookings,
      topEvents
    });
  } catch (error) {
    next(error);
  }
};
