const express = require('express');
const { createBooking, getUserBookings, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/book', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);
router.put('/cancel/:id', protect, cancelBooking);

module.exports = router;
