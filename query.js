const mongoose = require('mongoose');
const Session = require('./backend/models/Session');
const Booking = require('./backend/models/Booking');

mongoose.connect('mongodb://127.0.0.1:27017/smartcampus')
  .then(async () => {
    const sessions = await Session.find().sort({ createdAt: -1 }).limit(5);
    console.log("RECENT SESSIONS:", JSON.stringify(sessions, null, 2));

    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(5);
    console.log("RECENT BOOKINGS:", JSON.stringify(bookings, null, 2));

    process.exit(0);
  })
  .catch(console.error);
