const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: String,
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: String, default: null }, // user ID or name
});

const busSchema = new mongoose.Schema({
    id: String, // Changed from Number to String
    source: String,
    destination: String,
    Depart_date: String,
    Arrive_date: String,
    closing_Date: String,
    Closing_time: String,
    Depart_time: String,
    Arrive_time: String,
    price: Number,
    type: String,
    seats: [seatSchema], // Array of seat objects
  });
  

module.exports = mongoose.model('Bus', busSchema);
