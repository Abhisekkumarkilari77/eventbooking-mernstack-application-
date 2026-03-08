const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Artist name is required'],
    trim: true,
    maxlength: 200
  },
  stageName: {
    type: String,
    trim: true,
    maxlength: 200
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    trim: true,
    enum: ['Pop', 'Rock', 'Jazz', 'Classical', 'Hip-Hop', 'EDM', 'Bollywood', 'Indie', 'Folk', 'R&B', 'Country', 'Metal', 'Comedy', 'Other']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 5000
  },
  profileImage: {
    type: String,
    default: ''
  },
  socialLinks: {
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    twitter: { type: String, default: '' },
    spotify: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  country: {
    type: String,
    default: 'India',
    trim: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalPerformances: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

artistSchema.index({ genre: 1 });
artistSchema.index({ name: 'text', stageName: 'text' });

module.exports = mongoose.model('Artist', artistSchema);
