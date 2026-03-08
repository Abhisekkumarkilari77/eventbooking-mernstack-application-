const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Venue name is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  country: {
    type: String,
    default: 'India',
    trim: true
  },
  postalCode: {
    type: String,
    trim: true
  },
  coordinates: {
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 }
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1
  },
  seatLayoutImage: {
    type: String,
    default: ''
  },
  amenities: {
    parking: { type: Boolean, default: false },
    food: { type: Boolean, default: false },
    wheelchairAccess: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    restrooms: { type: Boolean, default: true }
  },
  images: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

venueSchema.index({ city: 1 });
venueSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

module.exports = mongoose.model('Venue', venueSchema);
