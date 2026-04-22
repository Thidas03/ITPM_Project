const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Availability = require('../models/Availability');
const Transaction = require('../Mageepan/models/Transaction');

async function testPaymentIntegration() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        
        const student = await User.findOne({role: 'Student'});
        const tutor = await User.findOne({role: 'Host'});

        if (!student || !tutor) {
            console.log('Missing test users.');
            process.exit(1);
        }

        console.log(`Setting student (${student.email}) balance to 1000...`);
        student.walletBalance = 1000;
        await student.save();

        const initialTutorBalance = tutor.walletBalance || 0;
        console.log(`Initial Tutor (${tutor.email}) balance: ${initialTutorBalance}`);

        // Create a mock availability
        console.log('Creating mock availability...');
        const availability = await Availability.create({
            tutor: tutor._id,
            dayOfWeek: 'Monday',
            startTime: '10:00',
            endTime: '11:00',
            maxStudents: 5
        });

        console.log('Simulating Wallet Payment via API...');
        const response = await fetch('http://localhost:5000/api/payments/pay-with-wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: student._id,
                amount: 1000,
                availabilityId: availability._id,
                description: 'Integration Test Booking'
            })
        });

        const data = await response.json();
        console.log('Response:', data);

        const updatedStudent = await User.findById(student._id);
        const updatedTutor = await User.findById(tutor._id);
        const updatedAvailability = await Availability.findById(availability._id);

        console.log('Updated Student Balance:', updatedStudent.walletBalance);
        console.log('Updated Tutor Balance:', updatedTutor.walletBalance);
        console.log('Enrolled Students in Availability:', updatedAvailability.enrolledStudents.length);

        const expectedTutorBalance = initialTutorBalance + 900;

        if (updatedStudent.walletBalance === 0 && updatedTutor.walletBalance === expectedTutorBalance && updatedAvailability.enrolledStudents.includes(student._id)) {
            console.log('✅ TEST PASSED: Student charged, Tutor credited (90%), Student enrolled.');
        } else {
            console.log('❌ TEST FAILED: Discrepancy found.');
        }

        // Cleanup
        await Availability.findByIdAndDelete(availability._id);
        process.exit(0);
    } catch (error) {
        console.error('❌ TEST ERRORED:', error);
        process.exit(1);
    }
}

testPaymentIntegration();
