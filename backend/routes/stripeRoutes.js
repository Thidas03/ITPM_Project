const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.argv[2] || process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { sendSessionConfirmation } = require('../services/emailService');

// MOCK: In a real app, these would come from a Session/Class model in the database
const SESSION_DATA = {
    'session_math_101': {
        courseName: 'Mathematics 101',
        tutorName: 'Dr. Smith',
        tutorId: 'tutor_smith_001',
        password: 'MATH_PASS_2026',
        price: 10
    },
    'session_ai_intro': {
        courseName: 'Intro to AI',
        tutorName: 'Prof. J. Doe',
        tutorId: 'tutor_doe_002',
        password: 'AI_MASTER_99',
        price: 25
    },
    'bundle_stem_pack': {
        courseName: 'STEM Mastery Bundle',
        tutorName: 'Multiple Tutors',
        tutorId: 'multiple',
        password: 'BUNDLE_VIBES_101',
        price: 40,
        isBundle: true
    }
};

// Create a Checkout Session for a single session/class or bundle
router.post('/create-checkout-session', async (req, res) => {
    const { userId, priceId, sessionId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            customer: user.stripeCustomerId || undefined,
            payment_method_types: ['card'],
            allow_promotion_codes: true, // Key Feature 1: Coupons
            invoice_creation: { enabled: true }, // Key Feature 3: Invoices
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
            metadata: {
                userId: userId,
                sessionId: sessionId,
            },
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Stripe Webhook Endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            if (session.mode === 'payment') {
                await handleSessionPaymentSuccess(session);
            } else if (session.mode === 'subscription') {
                await handleSubscriptionSuccess(session);
            }
            break;
        case 'customer.subscription.deleted':
            const subscription = event.data.object;
            await handleSubscriptionDeleted(subscription);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

async function handleSessionPaymentSuccess(session) {
    const userId = session.metadata.userId;
    const sessionId = session.metadata.sessionId;
    const stripeCustomerId = session.customer;

    try {
        const user = await User.findById(userId);
        if (!user) {
            console.error(`User ${userId} not found for email confirmation.`);
            return;
        }

        await User.findByIdAndUpdate(userId, {
            stripeCustomerId: stripeCustomerId,
            $addToSet: { paidSessions: sessionId }
        });

        // Send Email Notification
        const sessionInfo = SESSION_DATA[sessionId] || {
            courseName: 'Your Enrolled Class',
            tutorName: 'Our Expert Tutor',
            tutorId: 'unknown',
            password: 'See dashboard for details',
        };

        const amountTotal = session.amount_total / 100;
        const platformFee = amountTotal * 0.2; // 20% commission
        const tutorEarnings = amountTotal * 0.8; // 80% to tutor

        // Key Feature 5: Tutor Commission Tracking & Key Feature 2 & 3: Transaction logging & Invoices
        const transaction = new Transaction({
            userId: userId,
            sessionId: sessionId,
            stripeSessionId: session.id,
            amount: amountTotal,
            platformFee: platformFee,
            tutorEarnings: tutorEarnings,
            tutorId: sessionInfo.tutorId,
            status: 'completed'
        });

        await transaction.save();

        await sendSessionConfirmation(user.email, {
            ...sessionInfo,
            price: amountTotal.toFixed(2),
        });

        console.log(`Payment success, transaction logged, and email sent for session ${sessionId} for user ${userId}`);
    } catch (error) {
        console.error(`Error handling session success for ${userId}:`, error);
    }
}

async function handleSubscriptionSuccess(session) {
    const userId = session.metadata.userId;
    const stripeCustomerId = session.customer;
    const subscriptionId = session.subscription;

    try {
        await User.findByIdAndUpdate(userId, {
            stripeCustomerId: stripeCustomerId,
            subscriptionStatus: 'active',
            subscriptionTier: 'premium',
        });
        console.log(`Subscription success for user ${userId}`);
    } catch (error) {
        console.error(`Error updating user status for ${userId}:`, error);
    }
}

async function handleSubscriptionDeleted(subscription) {
    try {
        const user = await User.findOne({ stripeCustomerId: subscription.customer });
        if (user) {
            user.subscriptionStatus = 'none';
            user.subscriptionTier = 'free';
            await user.save();
            console.log(`Subscription deleted for customer ${subscription.customer}`);
        }
    } catch (error) {
        console.error(`Error handling subscription deletion:`, error);
    }
}

module.exports = router;
