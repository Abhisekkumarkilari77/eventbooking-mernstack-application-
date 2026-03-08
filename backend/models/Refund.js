const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
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
  refundAmount: {
    type: Number,
    required: true,
    min: 0
  },
  refundReason: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  refundStatus: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending'
  },
  processedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

refundSchema.index({ paymentId: 1 });
refundSchema.index({ bookingId: 1 });

module.exports = mongoose.model('Refund', refundSchema);
