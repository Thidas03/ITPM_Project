const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Transaction = require('../Mageepan/models/Transaction');

async function testPayout() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        
        const host = await User.findOne({role: 'Host'});
        if (!host) {
            console.log('No host found for testing.');
            process.exit(1);
        }

        console.log(`Setting balance for ${host.email} to 5000...`);
        host.walletBalance = 5000;
        await host.save();

        console.log('Sending payout request...');
        const response = await fetch('http://localhost:5000/api/payments/request-payout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: host._id })
        });

        const data = await response.json();
        console.log('Response:', data);

        const updatedHost = await User.findById(host._id);
        console.log('Updated Balance:', updatedHost.walletBalance);

        const transaction = await Transaction.findById(data.transactionId);
        console.log('Transaction Found:', transaction ? 'Yes' : 'No');
        console.log('Transaction Details:', transaction);

        if (updatedHost.walletBalance === 0 && transaction) {
            console.log('✅ TEST PASSED: Balance reset and transaction created.');
        } else {
            console.log('❌ TEST FAILED: Verification failed.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ TEST ERRORED:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

testPayout();
