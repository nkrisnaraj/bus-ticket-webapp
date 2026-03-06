const mongoose = require('mongoose');

const fleetSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
  type: {
    type: String,
    enum: ['AC', 'Non-AC', 'Luxury', 'Semi-Luxury'],
    required: true,
  },
  totalSeats: { type: Number, default: 47 },
  source:      { type: String, default: '', trim: true },
  destination: { type: String, default: '', trim: true },
  routeNumber: { type: String, default: '', trim: true },
  ownerMobile:     { type: String, default: '', trim: true },
  driverMobile:    { type: String, default: '', trim: true },
  conductorMobile: { type: String, default: '', trim: true },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Fleet', fleetSchema);
