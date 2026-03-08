const Event = require('../models/Event');
const Venue = require('../models/Venue');
const EventSchedule = require('../models/EventSchedule');
const SeatSection = require('../models/SeatSection');
const Seat = require('../models/Seat');
const EventAnalytics = require('../models/EventAnalytics');

// @desc    Create event
// @route   POST /api/events
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, category, venueId, startDate, endDate, totalSeats,
            bannerImages, tags, seatMapEnabled, ticketPriceRange, performers, sections } = req.body;

    // Verify venue exists
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    // Calculate price range if not provided or if sections provided
    let finalPriceRange = ticketPriceRange;
    if (sections && sections.length > 0) {
      const prices = sections.map(s => s.price);
      finalPriceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices)
      };
    }

    // Create event
    const event = await Event.create({
      title,
      description,
      category,
      organizerId: req.user._id,
      venueId,
      startDate,
      endDate,
      totalSeats,
      availableSeats: totalSeats,
      bannerImages: bannerImages || [],
      tags: tags || [],
      seatMapEnabled: seatMapEnabled !== false,
      ticketPriceRange: finalPriceRange || { min: 0, max: 0 },
      performers: performers || []
    });

    // Create seat sections and seats if provided
    if (sections && sections.length > 0) {
      for (const sectionData of sections) {
        const section = await SeatSection.create({
          eventId: event._id,
          name: sectionData.name,
          price: sectionData.price,
          rowCount: sectionData.rowCount,
          seatsPerRow: sectionData.seatsPerRow,
          colorCode: sectionData.colorCode || '#7C3AED'
        });

        // Generate seats for this section
        const seats = [];
        const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let r = 0; r < sectionData.rowCount; r++) {
          for (let s = 1; s <= sectionData.seatsPerRow; s++) {
            seats.push({
              eventId: event._id,
              sectionId: section._id,
              row: rowLabels[r] || `R${r + 1}`,
              seatNumber: s,
              seatLabel: `${sectionData.name}-${rowLabels[r] || `R${r + 1}`}${s}`,
              price: sectionData.price,
              status: 'available'
            });
          }
        }
        await Seat.insertMany(seats);
      }

      // Update total seats count
      const totalCreatedSeats = await Seat.countDocuments({ eventId: event._id });
      event.totalSeats = totalCreatedSeats;
      event.availableSeats = totalCreatedSeats;
      await event.save();
    }

    // Create analytics record
    await EventAnalytics.create({ eventId: event._id });

    const populatedEvent = await Event.findById(event._id)
      .populate('venueId')
      .populate('performers.artistId')
      .populate('organizerId', 'name email');

    res.status(201).json({ success: true, event: populatedEvent });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events (with filters)
// @route   GET /api/events
exports.getEvents = async (req, res, next) => {
  try {
    const { city, category, artist, minPrice, maxPrice, startDate, endDate, search, status, page = 1, limit = 12 } = req.query;

    let filter = {};

    // Only show published events to public
    if (!req.user || req.user.role === 'attendee') {
      filter.status = 'published';
    }

    if (status) filter.status = status;
    if (category) filter.category = category;
    
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    if (minPrice || maxPrice) {
      filter['ticketPriceRange.min'] = {};
      if (minPrice) filter['ticketPriceRange.min'].$gte = Number(minPrice);
      if (maxPrice) filter['ticketPriceRange.max'] = { $lte: Number(maxPrice) };
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // City filter requires venue lookup
    let venueFilter = {};
    if (city) {
      const venues = await Venue.find({ city: new RegExp(city, 'i') }).select('_id');
      filter.venueId = { $in: venues.map(v => v._id) };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const events = await Event.find(filter)
      .populate('venueId', 'name city state address coordinates')
      .populate('performers.artistId', 'name stageName genre profileImage')
      .populate('organizerId', 'name email')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('venueId')
      .populate('performers.artistId')
      .populate('organizerId', 'name email profileImage');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Get schedules
    const schedules = await EventSchedule.find({ eventId: event._id })
      .populate('artistId', 'name stageName genre profileImage')
      .sort({ startTime: 1 });

    // Get seat sections with availability counts
    const sections = await SeatSection.find({ eventId: event._id });
    const sectionData = await Promise.all(sections.map(async (section) => {
      const availableCount = await Seat.countDocuments({
        sectionId: section._id,
        status: 'available'
      });
      const totalCount = await Seat.countDocuments({ sectionId: section._id });
      return {
        ...section.toObject(),
        availableSeats: availableCount,
        totalSeats: totalCount
      };
    }));

    res.json({
      success: true,
      event,
      schedules,
      sections: sectionData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check ownership
    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('venueId').populate('performers.artistId');

    res.json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Clean up related data
    await SeatSection.deleteMany({ eventId: event._id });
    await Seat.deleteMany({ eventId: event._id });
    await EventSchedule.deleteMany({ eventId: event._id });
    await EventAnalytics.deleteMany({ eventId: event._id });
    await Event.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organizer's events
// @route   GET /api/events/organizer/my-events
exports.getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizerId: req.user._id })
      .populate('venueId', 'name city')
      .sort({ createdAt: -1 });

    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured events
// @route   GET /api/events/featured
exports.getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: 'published', isFeatured: true })
      .populate('venueId', 'name city state')
      .populate('performers.artistId', 'name stageName profileImage')
      .sort({ startDate: 1 })
      .limit(6);

    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
};
