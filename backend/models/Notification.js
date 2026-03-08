const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['bookingConfirmation', 'eventReminder', 'refundProcessed', 'cancellation', 'eventUpdate', 'welcome'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  readStatus: {
    type: Boolean,
    default: false
  },
  metadata: {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
  }
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1, readStatus: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
