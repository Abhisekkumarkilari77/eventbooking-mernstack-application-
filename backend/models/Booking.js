const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  seatIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seat'
  }],
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'expired'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  reservationExpiresAt: {
    type: Date
  },
  bookingNumber: {
    type: String,
    unique: true
  },
  cancellationReason: String,
  cancelledAt: Date
}, {
  timestamps: true
});

bookingSchema.index({ userId: 1 });
bookingSchema.index({ eventId: 1 });
bookingSchema.index({ bookingStatus: 1 });
// Removed duplicate unique index declaration

// Generate booking number before saving
bookingSchema.pre('save', async function() {
  if (!this.bookingNumber) {
    this.bookingNumber = 'BK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
