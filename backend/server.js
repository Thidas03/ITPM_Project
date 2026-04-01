require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

// Route files
const stripeRoutes = require('./routes/stripeRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

connectDB();

const app = express();
app.use(express.json());

// Mount routers
app.use('/api/stripe', stripeRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
  res.send("API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});