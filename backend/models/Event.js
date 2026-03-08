const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: 300
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: 10000
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Pop Singing', 'DJ Night', 'Live Band', 'Acoustic Session', 'College Fest', 'Comedy Night', 'Music Festival', 'Concert', 'Other']
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  venueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  bannerImages: [String],
  tags: [String],
  totalSeats: {
    type: Number,
    required: true,
    min: 1
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  seatMapEnabled: {
    type: Boolean,
    default: true
  },
  ticketPriceRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  performers: [{
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist'
    }
  }],
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

eventSchema.index({ venueId: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Event', eventSchema);
