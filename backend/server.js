require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Enable CORS
const cors = require('cors');
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send("API Running...");
});

// ✅ Import and mount availability routes
const availabilityRoutes = require('./routes/availabilityRoutes');
app.use('/api/availability', availabilityRoutes);

// ✅ Import and mount session routes
const sessionRoutes = require('./routes/sessionRoutes');
app.use('/api/sessions', sessionRoutes);

// ✅ Import and mount booking routes
const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

// ✅ Import and mount notification routes
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

});
