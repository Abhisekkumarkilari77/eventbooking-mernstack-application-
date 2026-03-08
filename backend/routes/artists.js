const express = require('express');
const router = express.Router();
const { createArtist, getArtists, getArtist, updateArtist, deleteArtist } = require('../controllers/artistController');
const { protect, authorize } = require('../middleware/auth');
const { artistValidator } = require('../middleware/validators');

router.get('/', getArtists);
router.get('/:id', getArtist);
router.post('/', protect, authorize('organizer', 'admin'), artistValidator, createArtist);
router.put('/:id', protect, authorize('organizer', 'admin'), updateArtist);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteArtist);

module.exports = router;
