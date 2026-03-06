const express = require('express');
const { createCheckoutSession, verifyAndBook } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Create a Stripe Checkout Session for seat booking
router.post('/create-checkout-session', protect, createCheckoutSession);

// Verify payment and finalise booking (called by BookingSuccess page)
router.post('/verify-and-book', protect, verifyAndBook);

module.exports = router;
