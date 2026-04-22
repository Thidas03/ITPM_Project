const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Availability = require('../models/Availability');
const Booking = require('../models/Booking');
const Transaction = require('../Mageepan/models/Transaction');

async function testRefundIntegration() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        
        const student = await User.findOne({role: 'Student'});
        const tutor = await User.findOne({role: 'Host'});

        if (!student || !tutor) {
            console.log('Missing test users.');
            process.exit(1);
        }

        // Setup Initial Balances
        student.walletBalance = 0;
        tutor.walletBalance = 900; // Simulated earnings from a booking
        await student.save();
        await tutor.save();

        console.log(`Step 1: Setup balances - Student: 0, Tutor: 900`);

        // Create a mock availability and booking
        const availability = await Availability.create({
            tutor: tutor._id,
            dayOfWeek: 'Monday',
            startTime: '10:00',
            endTime: '11:00',
            maxStudents: 5
        });

        const booking = await Booking.create({
            student: student._id,
            tutor: tutor._id,
            availability: availability._id,
            bookingDate: new Date(),
            status: 'upcoming',
            meetingLink: 'https://meet.jit.si/test-refund'
        });

        // Create the original payment transaction
        await Transaction.create({
            userId: student._id,
            sessionId: availability._id,
            transactionType: 'payment',
            amount: 1000,
            tutorEarnings: 900,
            tutorId: tutor._id,
            status: 'completed',
            paymentMethod: 'wallet'
        });

        console.log('Step 2: Mock booking and payment created.');

        // Simulate Cancellation Call
        // Note: I need a mock request object for the controller if I call it directly, 
        // or I can just use the API if the server is running.
        // Let's use the API.
        
        console.log('Step 3: Triggering Cancellation via API...');
        const response = await fetch(`http://localhost:5000/api/bookings/${booking._id}/cancel`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                // I need some way to authenticate if the route is protected.
                // Since I'm testing locally, I'll check bookingController for where it gets req.user
            }
        });

        const data = await response.json();
        console.log('API Response:', data);

        // Verify Balances
        const updatedStudent = await User.findById(student._id);
        const updatedTutor = await User.findById(tutor._id);
        
        console.log('Final Student Balance:', updatedStudent.walletBalance);
        console.log('Final Tutor Balance:', updatedTutor.walletBalance);

        const refundTx = await Transaction.findOne({ userId: student._id, transactionType: 'refund' });
        console.log('Refund Transaction Found:', refundTx ? 'Yes' : 'No');

        if (updatedStudent.walletBalance === 1000 && updatedTutor.walletBalance === 0 && refundTx) {
            console.log('✅ TEST PASSED: Refund processed successfully.');
        } else {
            console.log('❌ TEST FAILED: Balances or transactions incorrect.');
        }

        // Cleanup
        await Availability.findByIdAndDelete(availability._id);
        await Booking.findByIdAndDelete(booking._id);
        process.exit(0);

    } catch (error) {
        console.error('❌ TEST ERRORED:', error);
        process.exit(1);
    }
}

testRefundIntegration();
