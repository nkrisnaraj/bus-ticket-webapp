const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
  seatNumbers: [{ type: String, required: true }],
  totalPrice: { type: Number, required: true },
  // Denormalized snapshot for fast dashboard display (no extra lookups needed)
  routeSnapshot: {
    source: String,
    destination: String,
    departureDate: String,
    departureTime: String,
    arrivalTime: String,
    busType: String,
    busNumber: String,
  },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  // Stripe Checkout Session ID — used for idempotency in verifyAndBook
  stripeSessionId: { type: String, unique: true, sparse: true },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
