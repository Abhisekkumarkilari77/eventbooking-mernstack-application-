const mongoose = require('mongoose');

const eventScheduleSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true
  },
  stageName: {
    type: String,
    required: [true, 'Stage name is required'],
    trim: true,
    maxlength: 200
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  performanceType: {
    type: String,
    enum: ['Opening Act', 'Main Act', 'Closing Act', 'Guest Performance', 'DJ Set'],
    default: 'Main Act'
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

eventScheduleSchema.index({ eventId: 1 });
eventScheduleSchema.index({ artistId: 1 });

module.exports = mongoose.model('EventSchedule', eventScheduleSchema);
