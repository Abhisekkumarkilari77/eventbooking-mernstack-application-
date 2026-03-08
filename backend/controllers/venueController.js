const Venue = require('../models/Venue');

// @desc    Create venue
// @route   POST /api/venues
exports.createVenue = async (req, res, next) => {
  try {
    const venue = await Venue.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, venue });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all venues
// @route   GET /api/venues
exports.getVenues = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    let filter = {};
    if (city) filter.city = new RegExp(city, 'i');
    if (search) filter.name = new RegExp(search, 'i');

    const venues = await Venue.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, venues });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single venue
// @route   GET /api/venues/:id
exports.getVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    res.json({ success: true, venue });
  } catch (error) {
    next(error);
  }
};

// @desc    Update venue
// @route   PUT /api/venues/:id
exports.updateVenue = async (req, res, next) => {
  try {
    let venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    if (venue.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, venue });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete venue
// @route   DELETE /api/venues/:id
exports.deleteVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    if (venue.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Venue.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Venue deleted' });
  } catch (error) {
    next(error);
  }
};
