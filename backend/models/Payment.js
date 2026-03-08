const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'UPI', 'wallet', 'netbanking', 'simulated'],
    default: 'simulated'
  },
  transactionId: {
    type: String,
    unique: true
  },
  paymentGateway: {
    type: String,
    default: 'simulated'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Removed duplicate transactionId index
paymentSchema.index({ bookingId: 1 });

// Generate transaction ID
paymentSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
