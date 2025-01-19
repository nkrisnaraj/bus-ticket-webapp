const express = require('express');
const { createBooking, getUserBookings } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/book', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);

module.exports = router;
