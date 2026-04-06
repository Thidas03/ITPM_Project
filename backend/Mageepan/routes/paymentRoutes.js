const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Wallet Payments
router.post('/pay-with-wallet', paymentController.payWithWallet);
router.post('/mock-card-pay', paymentController.processMockCardPayment);
router.get('/balance/:userId', paymentController.getWalletBalance);
router.post('/buy-slot', paymentController.buyExtraSlot);

// Escrow Operations
router.patch('/release/:transactionId', paymentController.releaseFunds);
router.patch('/dispute/:transactionId', paymentController.disputeTransaction);
router.get('/session-transaction/:sessionId', paymentController.getTransactionBySessionId);


module.exports = router;
