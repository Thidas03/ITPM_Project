const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const stripe = require('stripe')(process.argv[2] || process.env.STRIPE_SECRET_KEY);
const User = require('../../models/User');
const Transaction = require('../models/Transaction');
const Availability = require('../../models/Availability');
const Discount = require('../models/Discount');
const { sendSessionConfirmation } = require('../../services/emailService');
const { generatePaymentReceiptPDF } = require('../../utils/pdfGenerator');

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

// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

// Create a Checkout Session for a single session/class (Held in Escrow)
router.post(
    '/create-checkout-session',
    [
        check('userId', 'User ID is required').not().isEmpty(),
        check('priceId', 'Price ID is required').not().isEmpty(),
        check('sessionId', 'Session ID is required').not().isEmpty(),
        check('availabilityId', 'Availability ID is required').not().isEmpty(),
        validate
    ],
    async (req, res) => {
    const { userId, priceId, sessionId, availabilityId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const availability = await Availability.findById(availabilityId);
        if (!availability) return res.status(404).json({ message: 'Availability slot not found' });

        if (availability.enrolledStudents.length >= availability.maxStudents) {
            return res.status(400).json({ message: 'This session is already full' });
        }

        const tutorId = availability.tutor || req.body.tutorId; // Compatibility check
        const discount = await Discount.findOne({ student: userId, tutor: tutorId, isUsed: false });
        let amount = req.body.amount || 1000; // Fallback for testing
        let finalAmount = amount;
        let discountId = null;

        if (discount) {
            finalAmount = amount * (1 - discount.percentage);
            discountId = discount._id;
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            customer: user.stripeCustomerId || undefined,
            payment_method_types: ['card'],
            allow_promotion_codes: true,
            invoice_creation: { enabled: true },
            line_items: [{ 
                price_data: {
                    currency: 'lkr',
                    product_data: {
                        name: `Session Booking: ${availability.startTime} - ${availability.endTime}`,
                        description: `Tutor Session with Discount Applied: ${discount ? (discount.percentage * 100) + '%' : 'None'}`
                    },
                    unit_amount: Math.round(finalAmount * 100)
                },
                quantity: 1 
            }],
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
            metadata: {
                type: 'session_payment',
                userId: userId,
                sessionId: sessionId,
                availabilityId: availabilityId,
                discountId: discountId ? discountId.toString() : null
            },
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create a Checkout Session for Wallet Recharge
router.post(
    '/create-recharge-session',
    [
        check('userId', 'User ID is required').not().isEmpty(),
        check('amount', 'Amount is required').isNumeric(),
        validate
    ],
    async (req, res) => {
        const { userId, amount } = req.body;

        try {
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: 'User not found' });

            const session = await stripe.checkout.sessions.create({
                mode: 'payment',
                customer: user.stripeCustomerId || undefined,
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'lkr',
                        product_data: {
                            name: 'StuEdu Wallet Recharge',
                            description: `Adding Rs. ${amount} to your virtual wallet`,
                        },
                        unit_amount: amount * 100,
                    },
                    quantity: 1,
                }],
                success_url: `${process.env.FRONTEND_URL}/dashboard/student?recharge=success`,
                cancel_url: `${process.env.FRONTEND_URL}/dashboard/student?recharge=cancel`,
                metadata: {
                    type: 'wallet_recharge',
                    userId: userId,
                    amount: amount
                },
            });

            res.json({ url: session.url });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

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
            if (session.metadata.type === 'session_payment') {
                await handleSessionPaymentSuccess(session);
            } else if (session.metadata.type === 'wallet_recharge') {
                await handleWalletRechargeSuccess(session);
            }
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
        if (!user) return;

        const availabilityId = session.metadata.availabilityId;

        // Register student in the Availability slot
        const availability = await Availability.findByIdAndUpdate(availabilityId, {
            $addToSet: { enrolledStudents: userId }
        }, {new: true});

        const sessionInfo = SESSION_DATA[sessionId] || {
            courseName: 'Peer Tutoring Session',
            tutorName: 'Platform Tutor',
            tutorId: 'tutor_generic',
        };

        const amountTotal = session.amount_total / 100;
        const platformCommission = amountTotal * 0.1; // 10% Platform Commission
        const tutorEarnings = amountTotal * 0.9; // 90% Tutor Earnings

        // Mark discount as used if applicable
        if (session.metadata.discountId) {
            await Discount.findByIdAndUpdate(session.metadata.discountId, { isUsed: true });
        }

        // Save Transaction as COMPLETED and credit Tutor
        const transaction = new Transaction({
            userId: userId,
            sessionId: sessionId,
            stripeSessionId: session.id,
            paymentMethod: 'stripe',
            amount: amountTotal,
            platformCommission,
            tutorEarnings: tutorEarnings,
            tutorId: availability ? availability.tutor : sessionInfo.tutorId,
            status: 'completed' // Money is now live in the tutor's wallet
        });

        await transaction.save();

        // Credit the Tutor's wallet balance
        if (availability && availability.tutor) {
            await User.findByIdAndUpdate(availability.tutor, {
                $inc: { walletBalance: tutorEarnings }
            });
            console.log(`Tutor ${availability.tutor} credited with Rs ${tutorEarnings} (90% of Rs ${amountTotal})`);
        }

        const paymentDetails = {
            ...sessionInfo,
            price: amountTotal.toFixed(2),
            studentName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Student',
            date: new Date().toDateString(),
            time: availability ? `${availability.startTime} - ${availability.endTime}` : 'N/A'
        };

        let pdfBuffer = null;
        try {
            pdfBuffer = await generatePaymentReceiptPDF(paymentDetails);
        } catch(pdfErr) {
            console.error('Error generating PDF receipt:', pdfErr);
        }

        await sendSessionConfirmation(user.email, paymentDetails, pdfBuffer);

        console.log(`Payment confirmed and tutor credited for user ${userId}`);
    } catch (error) {
        console.error(`Error handling session payment:`, error);
    }
}

async function handleWalletRechargeSuccess(session) {
    const userId = session.metadata.userId;
    const amount = parseFloat(session.metadata.amount);

    try {
        await User.findByIdAndUpdate(userId, {
            $inc: { walletBalance: amount },
            stripeCustomerId: session.customer
        });
        console.log(`Wallet recharged with Rs ${amount} for user ${userId}`);
    } catch (error) {
        console.error(`Error recharging wallet:`, error);
    }
}

module.exports = router;
