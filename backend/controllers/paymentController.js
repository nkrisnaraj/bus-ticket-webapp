const Stripe = require('stripe');
const Schedule = require('../models/Schedule');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { sendBookingConfirmation } = require('../utils/emailService');

// Lazy initializer — reads the env var at call time, not at module load
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

/**
 * POST /api/payment/create-checkout-session
 * Creates a Stripe Checkout Session from scheduleId + seatNumbers.
 */
exports.createCheckoutSession = async (req, res) => {
  const { scheduleId, seatNumbers } = req.body;

  if (!scheduleId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    return res.status(400).json({ success: false, message: 'scheduleId and seatNumbers are required' });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return res.status(503).json({ success: false, message: 'Payment service is not configured. Please contact support.' });
  }

  try {
    const schedule = await Schedule.findById(scheduleId).populate('busId', 'busNumber type');
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });

    // Pre-flight seat availability check
    const alreadyBooked = schedule.bookedSeats.map((s) => s.seatNumber);
    const conflicts = seatNumbers.filter((s) => alreadyBooked.includes(s));
    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seats already booked: ${conflicts.join(', ')}`,
      });
    }

    const totalAmountLKR = schedule.price * seatNumbers.length;
    const currency = process.env.STRIPE_CURRENCY || 'lkr';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency,
          product_data: {
            name: `QBus Ticket — ${schedule.source} → ${schedule.destination}`,
            description: `${schedule.departureDate} | Dep: ${schedule.departureTime} | Seats: ${seatNumbers.join(', ')}`,
          },
          unit_amount: Math.round(totalAmountLKR * 100),
        },
        quantity: 1,
      }],
      metadata: {
        userId: String(req.user.id),
        scheduleId: String(scheduleId),
        seatNumbers: JSON.stringify(seatNumbers),
        totalPriceLKR: String(totalAmountLKR),
      },
      success_url: `${process.env.FRONTEND_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/seat`,
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment session' });
  }
};

/**
 * POST /api/payment/verify-and-book
 * Called from BookingSuccess page. Verifies payment and creates the booking.
 * Idempotent: returns existing booking if already processed.
 */
exports.verifyAndBook = async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'sessionId is required' });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return res.status(503).json({ success: false, message: 'Payment service is not configured. Please contact support.' });
  }

  try {
    // Idempotency — return existing booking if this session was already processed
    const existingBooking = await Booking.findOne({ stripeSessionId: sessionId });
    if (existingBooking) {
      return res.json({ success: true, booking: existingBooking });
    }

    // Verify payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(402).json({ success: false, message: 'Payment not completed' });
    }

    if (session.metadata.userId !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { scheduleId, seatNumbers: seatNumbersJson, totalPriceLKR } = session.metadata;
    const seatNumbers = JSON.parse(seatNumbersJson);
    const totalPrice = totalPriceLKR ? parseFloat(totalPriceLKR) : 0;

    const schedule = await Schedule.findById(scheduleId).populate('busId', 'busNumber type');
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });

    // Re-check seat availability (race condition guard)
    const alreadyBooked = schedule.bookedSeats.map((s) => s.seatNumber);
    const conflicts = seatNumbers.filter((s) => alreadyBooked.includes(s));
    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seats already taken: ${conflicts.join(', ')}. Please contact support for a refund.`,
      });
    }

    const routeSnapshot = {
      source: schedule.source,
      destination: schedule.destination,
      departureDate: schedule.departureDate,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      busType: schedule.busId?.type || '',
      busNumber: schedule.busId?.busNumber || '',
    };

    // Save booking FIRST so that if schedule.save() fails, we can detect idempotency next time
    const newBooking = new Booking({
      userId: req.user.id,
      scheduleId,
      seatNumbers,
      totalPrice,
      routeSnapshot,
      status: 'confirmed',
      stripeSessionId: sessionId,
    });
    try {
      await newBooking.save();
    } catch (saveErr) {
      // Handle race condition: another request already created the booking
      if (saveErr.code === 11000) {
        const existing = await Booking.findOne({ stripeSessionId: sessionId });
        if (existing) return res.json({ success: true, booking: existing });
      }
      throw saveErr;
    }

    // Mark seats as booked in Schedule (after booking is persisted)
    seatNumbers.forEach((sn) => {
      schedule.bookedSeats.push({ seatNumber: sn, userId: req.user.id });
    });
    await schedule.save();

    // Non-blocking email
    User.findById(req.user.id).select('name email').then((u) => {
      if (u) {
        sendBookingConfirmation({
          to: u.email,
          userName: u.name,
          booking: newBooking,
          bus: { source: schedule.source, destination: schedule.destination, price: schedule.price },
        }).catch((err) => console.error('Email send error:', err));
      }
    }).catch((err) => console.error('Email user lookup error:', err));

    res.status(201).json({ success: true, message: 'Booking confirmed', booking: newBooking });
  } catch (error) {
    console.error('verifyAndBook error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

