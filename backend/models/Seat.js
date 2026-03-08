const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SeatSection',
    required: true
  },
  row: {
    type: String,
    required: [true, 'Row is required'],
    trim: true
  },
  seatNumber: {
    type: Number,
    required: [true, 'Seat number is required'],
    min: 1
  },
  seatLabel: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'booked', 'blocked'],
    default: 'available'
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reservedUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

seatSchema.index({ eventId: 1 });
seatSchema.index({ sectionId: 1 });
seatSchema.index({ status: 1 });
seatSchema.index({ eventId: 1, sectionId: 1, row: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
