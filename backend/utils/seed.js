const mongoose = require('mongoose');

// Seed data for testing the platform
const seedDatabase = async () => {
  const User = require('../models/User');
  const Venue = require('../models/Venue');
  const Artist = require('../models/Artist');
  const Event = require('../models/Event');
  const SeatSection = require('../models/SeatSection');
  const Seat = require('../models/Seat');
  const EventSchedule = require('../models/EventSchedule');
  const EventAnalytics = require('../models/EventAnalytics');

  try {
    // Check if already seeded
    const existingEvents = await Event.countDocuments();
    if (existingEvents > 0) {
      console.log('📦 Database already has data, skipping seed');
      return;
    }

    console.log('🌱 Seeding database...');

    // Create organizer
    const organizer = await User.create({
      name: 'EventHub Organizer',
      email: 'organizer@eventhub.com',
      passwordHash: 'password123',
      phone: '+91 9876543210',
      role: 'organizer',
      emailVerified: true
    });

    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@eventhub.com',
      passwordHash: 'admin123',
      phone: '+91 9876543211',
      role: 'admin',
      emailVerified: true
    });

    // Create test attendee
    const attendee = await User.create({
      name: 'John Doe',
      email: 'john@test.com',
      passwordHash: 'password123',
      phone: '+91 9876543212',
      role: 'attendee',
      emailVerified: true
    });

    // Create Venues
    const venues = await Venue.insertMany([
      {
        name: 'Gachibowli Indoor Stadium',
        description: 'State-of-the-art indoor stadium perfect for large concerts and shows. Features world-class acoustics and modern amenities.',
        address: 'Gachibowli, HITEC City',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        postalCode: '500032',
        coordinates: { latitude: 17.4401, longitude: 78.3489 },
        capacity: 5000,
        amenities: { parking: true, food: true, wheelchairAccess: true, wifi: true },
        createdBy: organizer._id
      },
      {
        name: 'Phoenix Arena',
        description: 'Premium concert venue in the heart of Mumbai with breathtaking views and VIP lounges.',
        address: 'Lower Parel',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400013',
        coordinates: { latitude: 19.0020, longitude: 72.8312 },
        capacity: 8000,
        amenities: { parking: true, food: true, wheelchairAccess: true, wifi: true },
        createdBy: organizer._id
      },
      {
        name: 'Jawaharlal Nehru Stadium',
        description: 'Iconic outdoor stadium hosting the biggest music festivals and concerts in Delhi.',
        address: 'Pragati Vihar',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        postalCode: '110003',
        coordinates: { latitude: 28.5815, longitude: 77.2335 },
        capacity: 15000,
        amenities: { parking: true, food: true, wheelchairAccess: true, wifi: false },
        createdBy: organizer._id
      },
      {
        name: 'Bangalore Palace Grounds',
        description: 'Open-air venue surrounded by lush greenery, ideal for music festivals and cultural events.',
        address: 'Jayamahal Road, Vasanth Nagar',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560006',
        coordinates: { latitude: 12.9987, longitude: 77.5922 },
        capacity: 10000,
        amenities: { parking: true, food: true, wheelchairAccess: false, wifi: true },
        createdBy: organizer._id
      }
    ]);

    // Create Artists
    const artists = await Artist.insertMany([
      {
        name: 'Arijit Singh',
        stageName: 'Arijit',
        genre: 'Bollywood',
        bio: 'India\'s most acclaimed playback singer known for soulful melodies. With countless chart-topping hits, Arijit has redefined modern Bollywood music.',
        socialLinks: { instagram: 'https://instagram.com/arijitsingh', youtube: 'https://youtube.com/arijitsingh', spotify: 'https://open.spotify.com/artist/arijitsingh' },
        country: 'India',
        rating: 4.9,
        totalPerformances: 500
      },
      {
        name: 'Prateek Kuhad',
        stageName: 'Prateek',
        genre: 'Indie',
        bio: 'Grammy-nominated indie singer-songwriter known for intimate, heartfelt songs. His music bridges Hindi and English with raw emotion.',
        socialLinks: { instagram: 'https://instagram.com/prateekkuhad', youtube: 'https://youtube.com/prateekkuhad' },
        country: 'India',
        rating: 4.7,
        totalPerformances: 200
      },
      {
        name: 'Nucleya',
        stageName: 'Nucleya',
        genre: 'EDM',
        bio: 'India\'s biggest bass music producer. Known for blending electronic beats with Indian folk and street sounds to create an explosive live experience.',
        socialLinks: { instagram: 'https://instagram.com/nucleya', youtube: 'https://youtube.com/nucleya' },
        country: 'India',
        rating: 4.8,
        totalPerformances: 350
      },
      {
        name: 'Zakir Khan',
        stageName: 'Zakir',
        genre: 'Comedy',
        bio: 'India\'s most loved stand-up comedian. His witty observations and relatable humor have earned him a massive following across the country.',
        socialLinks: { instagram: 'https://instagram.com/zakirkhan', youtube: 'https://youtube.com/zakirkhan' },
        country: 'India',
        rating: 4.6,
        totalPerformances: 400
      },
      {
        name: 'The Local Train',
        stageName: 'TLT',
        genre: 'Rock',
        bio: 'Hindi rock band known for their powerful live performances and anthemic songs that resonate with youth across India.',
        socialLinks: { instagram: 'https://instagram.com/thelocaltrain', youtube: 'https://youtube.com/thelocaltrain' },
        country: 'India',
        rating: 4.5,
        totalPerformances: 180
      },
      {
        name: 'DJ Snake',
        stageName: 'DJ Snake',
        genre: 'EDM',
        bio: 'French DJ and record producer known for worldwide hits. His high-energy performances have rocked festivals across the globe.',
        socialLinks: { instagram: 'https://instagram.com/djsnake', youtube: 'https://youtube.com/djsnake', spotify: 'https://open.spotify.com/artist/djsnake' },
        country: 'France',
        rating: 4.9,
        totalPerformances: 600
      }
    ]);

    // Create Events
    const now = new Date();
    const events = await Event.insertMany([
      {
        title: 'Arijit Singh Live - Soulful Night',
        description: 'Experience the magic of Arijit Singh live! An unforgettable evening of soulful melodies, chart-topping hits, and raw emotion. Join thousands of fans for a night that will touch your heart and soul.',
        category: 'Concert',
        organizerId: organizer._id,
        venueId: venues[0]._id,
        startDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        status: 'published',
        tags: ['arijit', 'bollywood', 'live', 'concert', 'soulful'],
        totalSeats: 200,
        availableSeats: 200,
        ticketPriceRange: { min: 999, max: 4999 },
        performers: [{ artistId: artists[0]._id }],
        isFeatured: true
      },
      {
        title: 'Neon Nights - EDM Festival',
        description: 'The biggest EDM festival hits your city! Featuring Nucleya and DJ Snake, experience mind-blowing bass drops, laser shows, and non-stop dancing under the neon lights.',
        category: 'DJ Night',
        organizerId: organizer._id,
        venueId: venues[1]._id,
        startDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        status: 'published',
        tags: ['edm', 'dj', 'festival', 'neon', 'party', 'bass'],
        totalSeats: 300,
        availableSeats: 300,
        ticketPriceRange: { min: 1499, max: 7999 },
        performers: [{ artistId: artists[2]._id }, { artistId: artists[5]._id }],
        isFeatured: true
      },
      {
        title: 'Zakir Khan - Haq Se Single Tour',
        description: 'Zakir Khan brings his legendary humor to stage! Get ready for an evening of non-stop laughter, relatable stories, and his signature "Sakht Launda" moments.',
        category: 'Comedy Night',
        organizerId: organizer._id,
        venueId: venues[0]._id,
        startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        status: 'published',
        tags: ['comedy', 'standup', 'zakir', 'humor', 'live'],
        totalSeats: 150,
        availableSeats: 150,
        ticketPriceRange: { min: 499, max: 2999 },
        performers: [{ artistId: artists[3]._id }],
        isFeatured: true
      },
      {
        title: 'Indie Vibes - Weekend Acoustic',
        description: 'A cozy weekend acoustic session featuring Prateek Kuhad and The Local Train. Perfect for indie music lovers who appreciate raw, unplugged performances.',
        category: 'Acoustic Session',
        organizerId: organizer._id,
        venueId: venues[3]._id,
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        status: 'published',
        tags: ['indie', 'acoustic', 'unplugged', 'weekend', 'chill'],
        totalSeats: 100,
        availableSeats: 100,
        ticketPriceRange: { min: 799, max: 1999 },
        performers: [{ artistId: artists[1]._id }, { artistId: artists[4]._id }],
        isFeatured: true
      },
      {
        title: 'Weekend Pop Singing Fiesta',
        description: 'The ultimate pop singing event! Multiple artists, multiple stages, one incredible weekend. From Bollywood hits to original compositions, this is THE music event of the season.',
        category: 'Pop Singing',
        organizerId: organizer._id,
        venueId: venues[2]._id,
        startDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 26 * 24 * 60 * 60 * 1000),
        status: 'published',
        tags: ['pop', 'singing', 'festival', 'weekend', 'multi-artist'],
        totalSeats: 500,
        availableSeats: 500,
        ticketPriceRange: { min: 1999, max: 9999 },
        performers: [{ artistId: artists[0]._id }, { artistId: artists[1]._id }, { artistId: artists[2]._id }],
        isFeatured: true
      },
      {
        title: 'College Beats - Annual Fest',
        description: 'The biggest college festival featuring live bands, DJ sets, and emerging artists. A celebration of youth, music, and unforgettable memories!',
        category: 'College Fest',
        organizerId: organizer._id,
        venueId: venues[3]._id,
        startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000),
        status: 'published',
        tags: ['college', 'fest', 'youth', 'band', 'annual'],
        totalSeats: 400,
        availableSeats: 400,
        ticketPriceRange: { min: 299, max: 1499 },
        performers: [{ artistId: artists[4]._id }, { artistId: artists[2]._id }],
        isFeatured: false
      }
    ]);

    // Create seat sections and seats for each event
    const sectionConfigs = [
      { name: 'VVIP', price: 4999, rowCount: 2, seatsPerRow: 10, colorCode: '#F472B6' },
      { name: 'VIP', price: 2999, rowCount: 3, seatsPerRow: 10, colorCode: '#7C3AED' },
      { name: 'Gold', price: 1499, rowCount: 4, seatsPerRow: 10, colorCode: '#F59E0B' },
      { name: 'Silver', price: 999, rowCount: 3, seatsPerRow: 10, colorCode: '#94A3B8' },
      { name: 'General', price: 499, rowCount: 3, seatsPerRow: 10, colorCode: '#06B6D4' }
    ];

    const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (const event of events) {
      let totalSeatsCreated = 0;

      for (const config of sectionConfigs) {
        const section = await SeatSection.create({
          eventId: event._id,
          ...config
        });

        const seats = [];
        for (let r = 0; r < config.rowCount; r++) {
          for (let s = 1; s <= config.seatsPerRow; s++) {
            seats.push({
              eventId: event._id,
              sectionId: section._id,
              row: rowLabels[r],
              seatNumber: s,
              seatLabel: `${config.name}-${rowLabels[r]}${s}`,
              price: config.price,
              status: 'available'
            });
          }
        }
        await Seat.insertMany(seats);
        totalSeatsCreated += seats.length;
      }

      // Update event seat counts
      await Event.findByIdAndUpdate(event._id, {
        totalSeats: totalSeatsCreated,
        availableSeats: totalSeatsCreated
      });

      // Create analytics record
      await EventAnalytics.create({ eventId: event._id });
    }

    // Create event schedules
    for (const event of events) {
      const eventStart = new Date(event.startDate);
      const performerIds = event.performers.map(p => p.artistId);

      for (let i = 0; i < performerIds.length; i++) {
        const startTime = new Date(eventStart.getTime() + i * 90 * 60 * 1000); // 90 min intervals
        const endTime = new Date(startTime.getTime() + 75 * 60 * 1000); // 75 min each

        await EventSchedule.create({
          eventId: event._id,
          artistId: performerIds[i],
          stageName: i === 0 ? 'Main Stage' : 'Stage ' + (i + 1),
          startTime,
          endTime,
          performanceType: i === 0 ? 'Opening Act' : (i === performerIds.length - 1 ? 'Main Act' : 'Guest Performance')
        });
      }
    }

    console.log('✅ Database seeded successfully!');
    console.log(`   📊 ${events.length} events created`);
    console.log(`   🎤 ${artists.length} artists created`);
    console.log(`   🏟️  ${venues.length} venues created`);
    console.log(`   👤 3 users created (organizer, admin, attendee)`);
    console.log('');
    console.log('   Test Accounts:');
    console.log('   📧 organizer@eventhub.com / password123');
    console.log('   📧 admin@eventhub.com / admin123');
    console.log('   📧 john@test.com / password123');

  } catch (error) {
    console.error('❌ Seed error:', error.message);
  }
};

module.exports = seedDatabase;
