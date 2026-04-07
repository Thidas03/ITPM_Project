require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('./models/Notification');

async function testCreate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log("Creating test notification...");
        const notif = await Notification.create({
            recipient: new mongoose.Types.ObjectId(), // Fake tutor ID
            message: "Test booked a session.",
            relatedBooking: new mongoose.Types.ObjectId(), // Fake booking ID
            type: 'booking'
        });
        
        console.log("Success:", notif);
    } catch (e) {
        console.error("Error creating notification:", e.message);
    } finally {
        mongoose.connection.close();
    }
}

testCreate();
