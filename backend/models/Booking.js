const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  busRoute: { type: String, required: true },
  seatNumber: { type: String, required: true },
  passengerDetails: [
    {
      name: { type: String, required: true },
      age: { type: Number, required: true },
      contact: { type: String, required: true },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
