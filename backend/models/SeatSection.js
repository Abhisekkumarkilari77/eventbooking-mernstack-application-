const mongoose = require('mongoose');

const seatSectionSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Section name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  rowCount: {
    type: Number,
    required: true,
    min: 1
  },
  seatsPerRow: {
    type: Number,
    required: true,
    min: 1
  },
  colorCode: {
    type: String,
    default: '#7C3AED'
  }
}, {
  timestamps: true
});

seatSectionSchema.index({ eventId: 1 });

module.exports = mongoose.model('SeatSection', seatSectionSchema);
