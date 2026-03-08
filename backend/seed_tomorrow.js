const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');
const Venue = require('./models/Venue');
const Seat = require('./models/Seat');
const SeatSection = require('./models/SeatSection');
const User = require('./models/User');

dotenv.config();

const seedTomorrow = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const organizer = await User.findOne({ role: 'organizer' });
    const venue = await Venue.findOne();

    if (!organizer || !venue) {
      console.error('Organizer or Venue not found. Run npm run seed first.');
      process.exit(1);
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0);

    const endTomorrow = new Date(tomorrow);
    endTomorrow.setHours(22, 0, 0, 0);

    await Event.deleteMany({ title: /Magic Show/ });
    await Seat.deleteMany({ seatLabel: /M-/ });
    
    console.log('Cleaned old magic show data');

    const event = await Event.create({
      title: 'Tomorrow Night Magic Show 🎩',
      description: 'An amazing magic show for tomorrow night! Experience the impossible with 3D glassmorphism interface.',
      category: 'Concert',
      organizerId: organizer._id,
      venueId: venue._id,
      startDate: tomorrow,
      endDate: endTomorrow,
      status: 'published',
      totalSeats: 20,
      availableSeats: 20,
      ticketPriceRange: { min: 999, max: 999 },
      tags: ['magic', 'tomorrow', 'live'],
      isFeatured: true
    });

    const section = await SeatSection.create({
      eventId: event._id,
      name: 'Magic Circle',
      price: 999,
      rowCount: 2,
      seatsPerRow: 10,
      colorCode: '#1DB954'
    });

    const seats = [];
    const rows = ['A', 'B'];
    for (let r = 0; r < 2; r++) {
      for (let s = 1; s <= 10; s++) {
        seats.push({
          eventId: event._id,
          sectionId: section._id,
          row: rows[r],
          seatNumber: s,
          seatLabel: `M-${rows[r]}${s}`,
          price: 999,
          status: 'available'
        });
      }
    }
    await Seat.insertMany(seats);

    console.log(`Tomorrow event created successfully! ID: ${event._id}`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedTomorrow();
