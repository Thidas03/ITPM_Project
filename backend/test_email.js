require('dotenv').config();
const { sendNotificationEmail } = require('./services/emailService');

async function testEmail() {
    try {
        console.log("Attempting to send test email using credentials from .env...");
        const response = await sendNotificationEmail(
            'test_student@example.com', 
            'Test Email Integration', 
            'Hello! If you see this in Mailtrap, the nodemailer integration is perfectly successful!'
        );
        console.log("✅ Success! Check your Mailtrap inbox.");
    } catch(e) {
        console.error("❌ Failed to send email:", e.message);
    }
}

testEmail();
