const mongoose = require('mongoose');
require('dotenv').config();
const Venue = require('./models/Venue');

async function checkVenues() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    const venues = await Venue.find();
    console.log('Venues in DB:', venues.length);
    venues.forEach(v => console.log(`- ${v.name} (${v._id})` ));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkVenues();
