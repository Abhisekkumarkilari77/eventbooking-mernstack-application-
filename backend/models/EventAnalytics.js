const mongoose = require('mongoose');

const eventAnalyticsSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    unique: true
  },
  ticketsSold: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },
  cancellations: {
    type: Number,
    default: 0
  },
  checkIns: {
    type: Number,
    default: 0
  },
  seatUtilization: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Removed duplicate index to avoid warning

module.exports = mongoose.model('EventAnalytics', eventAnalyticsSchema);
