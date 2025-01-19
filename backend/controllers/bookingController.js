const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
  const { busRoute, seatNumber, passengerDetails } = req.body;
  try {
    const newBooking = new Booking({
      userId: req.user.id,
      busRoute,
      seatNumber,
      passengerDetails,
    });

    await newBooking.save();
    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
