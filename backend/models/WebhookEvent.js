const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    trim: true
  },
  provider: {
    type: String,
    required: true,
    trim: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  signature: {
    type: String,
    default: ''
  },
  processed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);
