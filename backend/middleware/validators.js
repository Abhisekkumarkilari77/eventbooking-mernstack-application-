const { validationResult, body, param, query } = require('express-validator');

// Check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// Auth validations
const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['attendee', 'organizer']).withMessage('Invalid role'),
  validate
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// Event validations
const eventValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['Pop Singing', 'DJ Night', 'Live Band', 'Acoustic Session', 'College Fest', 'Comedy Night', 'Music Festival', 'Concert', 'Other']).withMessage('Invalid category'),
  body('venueId').isMongoId().withMessage('Valid venue ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('totalSeats').isInt({ min: 1 }).withMessage('Total seats must be at least 1'),
  validate
];

// Venue validations
const venueValidator = [
  body('name').trim().notEmpty().withMessage('Venue name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  validate
];

// Artist validations
const artistValidator = [
  body('name').trim().notEmpty().withMessage('Artist name is required'),
  body('genre').isIn(['Pop', 'Rock', 'Jazz', 'Classical', 'Hip-Hop', 'EDM', 'Bollywood', 'Indie', 'Folk', 'R&B', 'Country', 'Metal', 'Comedy', 'Other']).withMessage('Invalid genre'),
  validate
];

// Booking validations
const bookingValidator = [
  body('eventId').isMongoId().withMessage('Valid event ID is required'),
  body('seatIds').isArray({ min: 1 }).withMessage('At least one seat must be selected'),
  body('seatIds.*').isMongoId().withMessage('Valid seat IDs required'),
  validate
];

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  eventValidator,
  venueValidator,
  artistValidator,
  bookingValidator
};
