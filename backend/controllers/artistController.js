const Artist = require('../models/Artist');

// @desc    Create artist
// @route   POST /api/artists
exports.createArtist = async (req, res, next) => {
  try {
    const artist = await Artist.create(req.body);
    res.status(201).json({ success: true, artist });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all artists
// @route   GET /api/artists
exports.getArtists = async (req, res, next) => {
  try {
    const { genre, search } = req.query;
    let filter = {};
    if (genre) filter.genre = genre;
    if (search) filter.$text = { $search: search };

    const artists = await Artist.find(filter).sort({ name: 1 });
    res.json({ success: true, artists });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single artist
// @route   GET /api/artists/:id
exports.getArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({ success: false, message: 'Artist not found' });
    }
    res.json({ success: true, artist });
  } catch (error) {
    next(error);
  }
};

// @desc    Update artist
// @route   PUT /api/artists/:id
exports.updateArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!artist) {
      return res.status(404).json({ success: false, message: 'Artist not found' });
    }
    res.json({ success: true, artist });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete artist
// @route   DELETE /api/artists/:id
exports.deleteArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findByIdAndDelete(req.params.id);
    if (!artist) {
      return res.status(404).json({ success: false, message: 'Artist not found' });
    }
    res.json({ success: true, message: 'Artist deleted' });
  } catch (error) {
    next(error);
  }
};
