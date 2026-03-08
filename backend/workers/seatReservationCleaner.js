const cron = require('node-cron');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// Run every minute - clean up expired reservations
const startSeatReservationCleaner = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // Find expired reserved seats
      const expiredSeats = await Seat.find({
        status: 'reserved',
        reservedUntil: { $lte: now }
      });

      if (expiredSeats.length > 0) {
        const seatIds = expiredSeats.map(s => s._id);
        const eventIds = [...new Set(expiredSeats.map(s => s.eventId.toString()))];

        // Release seats
        await Seat.updateMany(
          { _id: { $in: seatIds } },
          { status: 'available', reservedBy: null, reservedUntil: null }
        );

        // Update expired bookings
        await Booking.updateMany(
          {
            seatIds: { $in: seatIds },
            bookingStatus: 'pending',
            reservationExpiresAt: { $lte: now }
          },
          { bookingStatus: 'expired' }
        );

        // Update available seats count for affected events
        for (const eventId of eventIds) {
          const availableCount = await Seat.countDocuments({
            eventId,
            status: 'available'
          });
          await Event.findByIdAndUpdate(eventId, { availableSeats: availableCount });
        }

        console.log(`🧹 Cleaned up ${expiredSeats.length} expired seat reservations`);
      }
    } catch (error) {
      console.error('Seat reservation cleaner error:', error.message);
    }
  });

  console.log('⏰ Seat reservation cleaner started (runs every minute)');
};

module.exports = startSeatReservationCleaner;
