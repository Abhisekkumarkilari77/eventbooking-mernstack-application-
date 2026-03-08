const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');
const Booking = require('./models/Booking');
const Ticket = require('./models/Ticket');
const User = require('./models/User');
const Seat = require('./models/Seat');

dotenv.config();

const seedSampleTicket = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const attendee = await User.findOne({ role: 'attendee' }) || await User.findOne();
    const event = await Event.findOne({ title: /Magic Show/ });
    const seat = await Seat.findOne({ eventId: event._id, status: 'available' });

    if (!attendee || !event || !seat) {
      console.error('Required data missing');
      process.exit(1);
    }

    const bookingNumber = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
    const booking = await Booking.create({
      bookingNumber,
      userId: attendee._id,
      eventId: event._id,
      seatIds: [seat._id],
      totalAmount: seat.price,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid'
    });

    const ticketNumber = 'TK-777777'; // Fixed number for easy testing
    const ticket = await Ticket.create({
      ticketNumber,
      bookingId: booking._id,
      userId: attendee._id,
      eventId: event._id,
      seatId: seat._id,
      ticketStatus: 'valid',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TK-777777'
    });

    // Mark seat as booked
    seat.status = 'booked';
    await seat.save();

    console.log(`Sample Ticket Created! Number: ${ticketNumber}`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedSampleTicket();
