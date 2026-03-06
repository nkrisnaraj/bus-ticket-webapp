const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fleet', required: true },
  source: { type: String, required: true, trim: true },
  destination: { type: String, required: true, trim: true },
  departureDate: { type: String, required: true },   // 'YYYY-MM-DD'
  departureTime: { type: String, required: true },   // 'HH:MM'
  arrivalDate:   { type: String, default: '' },       // 'YYYY-MM-DD' (may differ for overnight trips)
  arrivalTime:   { type: String, required: true },   // 'HH:MM'
  price: { type: Number, required: true },
  totalSeats: { type: Number, default: 47 },
  isRecurring: { type: Boolean, default: false },
  recurringGroupId: { type: String, default: '' },
  bookedSeats: [{
    seatNumber: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  }],
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled',
  },
}, { timestamps: true });

scheduleSchema.index({ source: 1, destination: 1, departureDate: 1, status: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);
