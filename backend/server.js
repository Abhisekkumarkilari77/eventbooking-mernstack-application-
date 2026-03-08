const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const startSeatReservationCleaner = require('./workers/seatReservationCleaner');
const seedDatabase = require('./utils/seed');

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const venueRoutes = require('./routes/venues');
const artistRoutes = require('./routes/artists');
const seatRoutes = require('./routes/seats');
const bookingRoutes = require('./routes/bookings');
const ticketRoutes = require('./routes/tickets');
const scheduleRoutes = require('./routes/schedules');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Make io accessible in routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join event room for real-time seat updates
  socket.on('join:event', (eventId) => {
    socket.join(eventId);
    console.log(`👤 ${socket.id} joined event room: ${eventId}`);
  });

  socket.on('leave:event', (eventId) => {
    socket.leave(eventId);
    console.log(`👤 ${socket.id} left event room: ${eventId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Security & Global middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS - Must be before routes AND limiter to ensure error responses have proper headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Increased for development
  message: { success: false, message: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'EventHub API is running! 🎉',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Seed database with sample data
    await seedDatabase();

    // Start background workers
    startSeatReservationCleaner();

    server.listen(PORT, () => {
      console.log('');
      console.log('╔═══════════════════════════════════════════════╗');
      console.log('║       🎫 EventHub API Server Started 🎫       ║');
      console.log('╠═══════════════════════════════════════════════╣');
      console.log(`║  🌐 Server:    http://localhost:${PORT}          ║`);
      console.log(`║  📊 API:       http://localhost:${PORT}/api      ║`);
      console.log(`║  🔌 WebSocket: ws://localhost:${PORT}            ║`);
      console.log(`║  🌍 Environment: ${(process.env.NODE_ENV || 'development').padEnd(22)}    ║`);
      console.log('╚═══════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
