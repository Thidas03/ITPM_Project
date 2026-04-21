const cron = require('node-cron');
const Booking = require('../models/Booking');
const Session = require('../models/Session');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendNotificationEmail } = require('../services/emailService');

const sendNotification = async (user, booking, session, typeLabel) => {
    try {
        const prefs = user.notificationPreferences;
        const sessionType = session.type || 'individual';

        // 1. Check if user wants notifications for this session type
        if (prefs.perType && !prefs.perType[sessionType]) return;

        // 2. Prepare message
        const title = `Upcoming Session: ${session.title}`;
        const message = `Your tutoring session "${session.title}" starts in ${typeLabel}. Don't forget to join!`;

        // 3. In-app Push
        if (prefs.push) {
            await Notification.create({
                user: user._id,
                title,
                message,
                type: typeLabel === '10 min' ? 'urgent' : 'info'
            });
        }

        // 4. Email (Real)
        if (prefs.email) {
            console.log(`[EMAIL SENDING TO ${user.email}]: ${title}`);
            try {
                await sendNotificationEmail(user.email, title, message);
            } catch (err) {
                console.error('Failed to send email inside CronJob:', err.message);
            }
        }

        // 5. SMS (Mock)
        if (prefs.sms) {
            console.log(`[SMS SENDING TO ${user.contactNumber}]: ${title} - ${message}`);
            // Logic for real SMS using a provider (e.g. Twilio) would go here
        }

        // 6. Update booking to prevent duplicate reminders
        booking.sentReminders.push(typeLabel);
        await booking.save();

    } catch (error) {
        console.error('Error in sendNotification:', error);
    }
};

const setupCronJobs = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            
            // Find all confirmed bookings
            const bookings = await Booking.find({ status: 'confirmed' })
                .populate('session')
                .populate('student');

            for (const booking of bookings) {
                const session = booking.session;
                const user = booking.student;
                if (!session || !user) continue;

                const sessionStart = new Date(session.startTime);
                const timeDiff = sessionStart - now;
                const diffMin = Math.round(timeDiff / 60000);

                const prefs = user.notificationPreferences;
                if (!prefs) continue;

                // Thresholds (allowing a small window)
                // 10m reminder
                if (diffMin > 8 && diffMin <= 10 && prefs.timing?.tenMin && !booking.sentReminders.includes('10m')) {
                    await sendNotification(user, booking, session, '10m');
                }
                // 20m reminder
                else if (diffMin > 18 && diffMin <= 20 && prefs.timing?.twentyMin && !booking.sentReminders.includes('20m')) {
                    await sendNotification(user, booking, session, '20m');
                }
                // 1h reminder
                else if (diffMin > 55 && diffMin <= 60 && prefs.timing?.oneHour && !booking.sentReminders.includes('1h')) {
                    await sendNotification(user, booking, session, '1h');
                }
                // 1d reminder
                else if (diffMin > 1430 && diffMin <= 1440 && prefs.timing?.oneDay && !booking.sentReminders.includes('1d')) {
                    await sendNotification(user, booking, session, '1d');
                }
            }
        } catch (error) {
            console.error('CRON Error:', error);
        }
    });

    console.log('Notification Cron Jobs Scheduled Successfully.');
};

module.exports = setupCronJobs;
