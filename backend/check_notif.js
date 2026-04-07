require('dotenv').config();
const mongoose = require('mongoose');

const Notification = require('./models/Notification');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");
        const notifs = await Notification.find().sort({ createdAt: -1 }).limit(5);
        console.log("Latest 5 Notifications:", JSON.stringify(notifs, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
}

check();
