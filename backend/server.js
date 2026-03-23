require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const feedbackRoutes = require("./routes/feedbackRoutes");
const availabilityRoutes = require('./routes/availabilityRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/feedback", feedbackRoutes);
app.use('/api/availability', availabilityRoutes);

app.get('/', (req, res) => {
  res.send("API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});