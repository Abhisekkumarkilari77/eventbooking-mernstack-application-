const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const Payment = require('../models/Payment');
const Refund = require('../models/Refund');
const Notification = require('../models/Notification');
const EventAnalytics = require('../models/EventAnalytics');
const User = require('../models/User');
const QRCode = require('qrcode');

// @desc    Book seats instantly (reserve + pay + generate tickets in one step)
// @route   POST /api/bookings/book
exports.bookNow = async (req, res, next) => {
  try {
    const { eventId, seatIds } = req.body;

    if (!eventId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ success: false, message: 'eventId and seatIds are required' });
    }

    // 1. Check event
    const event = await Event.findById(eventId).catch(() => null);
    if (!event || event.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Event not found or not available' });
    }

    // 2. Fetch all requested seats (even if they were already booked/reserved)
    const seats = await Seat.find({ _id: { $in: seatIds }, eventId });
    if (seats.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid seats found for this event.' });
    }

    const totalAmount = seats.reduce((sum, s) => sum + (s.price || 0), 0);

    // 3. Mark seats booked
    await Seat.updateMany({ _id: { $in: seatIds } }, { status: 'booked', reservedBy: req.user._id, reservedUntil: null });

    // 4. Create booking
    const booking = await Booking.create({
      userId: req.user._id,
      eventId,
      seatIds,
      bookingStatus: 'confirmed',
      totalAmount,
      reservationExpiresAt: new Date(Date.now() + 60 * 60 * 1000)
    });

    // 5. Create payment (non-critical — don't fail booking if this errors)
    let payment = null;
    try {
      payment = await Payment.create({
        bookingId: booking._id,
        userId: req.user._id,
        amount: totalAmount,
        paymentMethod: 'simulated',
        paymentStatus: 'success'
      });
    } catch (payErr) {
      console.error('Payment record error (non-fatal):', payErr.message);
    }

    // 6. Generate tickets with QR codes
    const tickets = [];
    for (const seat of seats) {
      try {
        // Pre-generate ticket number so QR code has it
        const ticketNumber = 'TK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 8).toUpperCase();
        const ticketDoc = new Ticket({
          bookingId: booking._id,
          userId: req.user._id,
          eventId,
          seatId: seat._id,
          ticketNumber
        });
        const qrData = JSON.stringify({
          ticketNumber,
          eventId: eventId.toString(),
          seatLabel: seat.seatLabel || seat.seatNumber || 'Seat'
        });
        ticketDoc.qrCode = await QRCode.toDataURL(qrData);
        await ticketDoc.save();
        tickets.push(ticketDoc);
      } catch (ticketErr) {
        console.error('Ticket generation error (seat ' + seat._id + '):', ticketErr.message);
      }
    }

    // 7-11. Non-critical background updates — each isolated
    try { await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: -seatIds.length } }); } catch (e) { console.error('availableSeats update failed:', e.message); }
    try { await EventAnalytics.findOneAndUpdate({ eventId }, { $inc: { ticketsSold: seatIds.length, revenue: totalAmount }, lastUpdated: new Date() }, { upsert: true }); } catch (e) { console.error('analytics update failed:', e.message); }
    try { if (event.organizerId) await User.findByIdAndUpdate(event.organizerId, { $inc: { walletBalance: totalAmount } }); } catch (e) { console.error('wallet update failed:', e.message); }
    try {
      await Notification.create({
        userId: req.user._id,
        type: 'bookingConfirmation',
        title: 'Booking Confirmed!',
        message: `${tickets.length} ticket(s) booked for ${event.title}. Check My Tickets.`,
        metadata: { eventId, bookingId: booking._id }
      });
    } catch (e) { console.error('notification failed (non-fatal):', e.message); }
    try {
      const io = req.app.get('io');
      if (io) {
        const updatedSeats = await Seat.find({ _id: { $in: seatIds } });
        io.to(eventId.toString()).emit('seat:update', updatedSeats);
      }
    } catch (e) { console.error('socket emit failed:', e.message); }

    return res.status(201).json({ success: true, booking, payment, tickets });
  } catch (error) {
    console.error('bookNow critical error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Booking failed. Please try again.' });
  }
};


// @desc    Reserve seats (temporary lock - 5 min)
// @route   POST /api/bookings/reserve
exports.reserveSeats = async (req, res, next) => {
  try {
    const { eventId, seatIds } = req.body;

    // Check event exists and is published
    const event = await Event.findById(eventId);
    if (!event || event.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Event not found or not available' });
    }

    // Check all seats are available
    const seats = await Seat.find({
      _id: { $in: seatIds },
      eventId,
      status: 'available'
    });

    if (seats.length !== seatIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some seats are no longer available. Please refresh and try again.'
      });
    }

    // Calculate total amount
    const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0);

    // Set reservation expiry (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Reserve seats
    await Seat.updateMany(
      { _id: { $in: seatIds } },
      {
        status: 'reserved',
        reservedBy: req.user._id,
        reservedUntil: expiresAt
      }
    );

    // Create booking
    const booking = await Booking.create({
      userId: req.user._id,
      eventId,
      seatIds,
      bookingStatus: 'pending',
      totalAmount,
      reservationExpiresAt: expiresAt
    });

    // Update available seats count
    await Event.findByIdAndUpdate(eventId, {
      $inc: { availableSeats: -seatIds.length }
    });

    // Emit seat update via socket
    const io = req.app.get('io');
    if (io) {
      const updatedSeats = await Seat.find({ _id: { $in: seatIds } });
      io.to(eventId).emit('seat:update', updatedSeats);
    }

    res.status(201).json({
      success: true,
      booking,
      expiresAt,
      totalAmount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm booking after payment
// @route   POST /api/bookings/confirm
exports.confirmBooking = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.bookingStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Booking is not in pending state' });
    }

    // Check if reservation expired
    if (new Date() > booking.reservationExpiresAt) {
      booking.bookingStatus = 'expired';
      await booking.save();
      
      // Release seats
      await Seat.updateMany(
        { _id: { $in: booking.seatIds } },
        { status: 'available', reservedBy: null, reservedUntil: null }
      );

      await Event.findByIdAndUpdate(booking.eventId, {
        $inc: { availableSeats: booking.seatIds.length }
      });

      return res.status(400).json({ success: false, message: 'Reservation expired. Please try again.' });
    }

    // Create simulated payment
    const payment = await Payment.create({
      bookingId: booking._id,
      userId: req.user._id,
      amount: booking.totalAmount,
      paymentMethod: paymentMethod || 'simulated',
      paymentStatus: 'success'
    });

    // Update booking status
    booking.bookingStatus = 'confirmed';
    await booking.save();

    // Update seats to booked
    await Seat.updateMany(
      { _id: { $in: booking.seatIds } },
      { status: 'booked' }
    );

    // Generate tickets with QR codes
    const tickets = [];
    for (const seatId of booking.seatIds) {
      const seat = await Seat.findById(seatId);
      const ticketData = {
        bookingId: booking._id,
        userId: req.user._id,
        eventId: booking.eventId,
        seatId
      };

      const ticket = new Ticket(ticketData);
      
      // Generate QR code
      const qrData = JSON.stringify({
        ticketId: ticket._id,
        ticketNumber: ticket.ticketNumber,
        eventId: booking.eventId,
        seatLabel: seat ? seat.seatLabel : 'N/A'
      });
      ticket.qrCode = await QRCode.toDataURL(qrData);
      
      await ticket.save();
      tickets.push(ticket);
    }

    // Update analytics
    await EventAnalytics.findOneAndUpdate(
      { eventId: booking.eventId },
      {
        $inc: { ticketsSold: booking.seatIds.length, revenue: booking.totalAmount },
        lastUpdated: new Date()
      },
      { upsert: true }
    );

    // Update organizer wallet
    const event = await Event.findById(booking.eventId);
    if (event && event.organizerId) {
      await User.findByIdAndUpdate(
        event.organizerId,
        { $inc: { walletBalance: booking.totalAmount } }
      );
    }

    // Send notification
    await Notification.create({
      userId: req.user._id,
      type: 'bookingConfirmation',
      title: 'Booking Confirmed! 🎫',
      message: `Your booking ${booking.bookingNumber} has been confirmed. ${tickets.length} ticket(s) generated.`,
      metadata: { eventId: booking.eventId, bookingId: booking._id }
    });

    // Emit events via socket
    const io = req.app.get('io');
    if (io) {
      const updatedSeats = await Seat.find({ _id: { $in: booking.seatIds } });
      io.to(booking.eventId.toString()).emit('seat:update', updatedSeats);
      io.to(booking.eventId.toString()).emit('booking:confirmed', {
        bookingId: booking._id,
        seatsBooked: booking.seatIds.length
      });
    }

    res.json({
      success: true,
      booking,
      payment,
      tickets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   POST /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || booking.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }

    // Check if event is more than 24 hours away
    const event = await Event.findById(booking.eventId);
    const hoursUntilEvent = (new Date(event.startDate) - new Date()) / (1000 * 60 * 60);

    if (hoursUntilEvent < 24) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation not allowed within 24 hours of event start'
      });
    }

    // Update booking
    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = req.body.reason || 'User requested cancellation';
    booking.cancelledAt = new Date();
    await booking.save();

    // Release seats
    await Seat.updateMany(
      { _id: { $in: booking.seatIds } },
      { status: 'available', reservedBy: null, reservedUntil: null }
    );

    // Update available seats
    await Event.findByIdAndUpdate(booking.eventId, {
      $inc: { availableSeats: booking.seatIds.length }
    });

    // Cancel tickets
    await Ticket.updateMany(
      { bookingId: booking._id },
      { ticketStatus: 'cancelled' }
    );

    // Process refund
    const payment = await Payment.findOne({ bookingId: booking._id, paymentStatus: 'success' });
    if (payment) {
      payment.paymentStatus = 'refunded';
      await payment.save();

      await Refund.create({
        paymentId: payment._id,
        bookingId: booking._id,
        userId: req.user._id,
        refundAmount: payment.amount,
        refundReason: req.body.reason || 'User cancellation',
        refundStatus: 'processed',
        processedAt: new Date()
      });
    }

    // Update analytics
    await EventAnalytics.findOneAndUpdate(
      { eventId: booking.eventId },
      {
        $inc: { cancellations: 1, ticketsSold: -booking.seatIds.length, revenue: -booking.totalAmount },
        lastUpdated: new Date()
      }
    );

    // Deduct from organizer wallet
    if (event && event.organizerId) {
      await User.findByIdAndUpdate(
        event.organizerId,
        { $inc: { walletBalance: -booking.totalAmount } }
      );
    }

    // Notification
    await Notification.create({
      userId: req.user._id,
      type: 'cancellation',
      title: 'Booking Cancelled',
      message: `Your booking ${booking.bookingNumber} has been cancelled. Refund of ₹${booking.totalAmount} will be processed.`,
      metadata: { eventId: booking.eventId, bookingId: booking._id }
    });

    // Socket emit
    const io = req.app.get('io');
    if (io) {
      const updatedSeats = await Seat.find({ _id: { $in: booking.seatIds } });
      io.to(booking.eventId.toString()).emit('seat:update', updatedSeats);
    }

    res.json({
      success: true,
      message: 'Booking cancelled and refund initiated',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate({
        path: 'eventId',
        populate: [
          { path: 'venueId', select: 'name city address' },
          { path: 'performers.artistId', select: 'name stageName' }
        ]
      })
      .populate('seatIds', 'seatLabel row seatNumber price')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'eventId',
        populate: [
          { path: 'venueId' },
          { path: 'performers.artistId' }
        ]
      })
      .populate('seatIds');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Get tickets for this booking
    const tickets = await Ticket.find({ bookingId: booking._id })
      .populate('seatId', 'seatLabel row seatNumber price');

    // Get payment info
    const payment = await Payment.findOne({ bookingId: booking._id });

    res.json({ success: true, booking, tickets, payment });
  } catch (error) {
    next(error);
  }
};
