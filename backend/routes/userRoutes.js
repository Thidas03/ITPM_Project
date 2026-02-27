const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Get purchase history for a specific user
router.get('/purchases/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });

        // Mock session details since we don't have a real Session model yet
        // In a real app, you'd use .populate('sessionId')
        const SESSION_DATA = {
            'session_math_101': { name: 'Mathematics 101', tutor: 'Dr. Smith', password: 'MATH_PASS_2026' },
            'session_ai_intro': { name: 'Intro to AI', tutor: 'Prof. J. Doe', password: 'AI_MASTER_99' },
            'bundle_stem_pack': { name: 'STEM Mastery Bundle', tutor: 'Multiple', password: 'BUNDLE_VIBES_101' }
        };

        const purchases = transactions.map(t => ({
            ...t._doc,
            sessionDetails: SESSION_DATA[t.sessionId] || SESSION_DATA[t.bundleId] || { name: 'Unknown Session', tutor: 'Unknown', password: 'N/A' }
        }));

        res.json(purchases);
    } catch (error) {
        console.error('Error fetching purchases:', error);
        res.status(500).json({ error: 'Failed to fetch purchase history' });
    }
});

module.exports = router;
