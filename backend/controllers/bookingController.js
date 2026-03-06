const Booking = require('../models/Booking');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const { sendBookingConfirmation } = require('../utils/emailService');

exports.createBooking = async (req, res) => {
  const { scheduleId, seatNumbers } = req.body;

  if (!scheduleId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    return res.status(400).json({ success: false, message: 'scheduleId and seatNumbers are required' });
  }

  try {
    const schedule = await Schedule.findById(scheduleId).populate('busId', 'busNumber type');
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    if (schedule.status !== 'scheduled') {
      return res.status(400).json({ success: false, message: 'This trip is no longer available for booking' });
    }

    const alreadyBooked = schedule.bookedSeats.map((s) => s.seatNumber);
    const conflicts = seatNumbers.filter((s) => alreadyBooked.includes(s));
    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seats already booked: ${conflicts.join(', ')}`,
      });
    }

    // Mark seats in Schedule
    seatNumbers.forEach((sn) => {
      schedule.bookedSeats.push({ seatNumber: sn, userId: req.user.id });
    });
    await schedule.save();

    const totalPrice = schedule.price * seatNumbers.length;
    const routeSnapshot = {
      source: schedule.source,
      destination: schedule.destination,
      departureDate: schedule.departureDate,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      busType: schedule.busId?.type || '',
      busNumber: schedule.busId?.busNumber || '',
    };

    const newBooking = new Booking({
      userId: req.user.id,
      scheduleId,
      seatNumbers,
      totalPrice,
      routeSnapshot,
      status: 'confirmed',
    });
    await newBooking.save();

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
    console.error('createBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('getUserBookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (String(booking.userId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }

    // Free seats in Schedule
    const schedule = await Schedule.findById(booking.scheduleId);
    if (schedule) {
      schedule.bookedSeats = schedule.bookedSeats.filter(
        (s) => !booking.seatNumbers.includes(s.seatNumber)
      );
      await schedule.save();
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (error) {
    console.error('cancelBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
