const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
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
  seatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seat',
    required: true
  },
  ticketNumber: {
    type: String,
    unique: true
  },
  qrCode: {
    type: String,
    default: ''
  },
  ticketStatus: {
    type: String,
    enum: ['valid', 'cancelled', 'used', 'expired'],
    default: 'valid'
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  checkedInAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Removed duplicate ticketNumber index
ticketSchema.index({ eventId: 1 });
ticketSchema.index({ userId: 1 });
ticketSchema.index({ bookingId: 1 });

// Generate ticket number
ticketSchema.pre('save', async function() {
  if (!this.ticketNumber) {
    this.ticketNumber = 'TK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);
