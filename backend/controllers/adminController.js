const Booking = require('../models/Booking');
const Fleet = require('../models/Fleet');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ── Bookings ──────────────────────────────────────────────────────────────────
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Fleet Management ──────────────────────────────────────────────────────────
exports.getAllFleet = async (req, res) => {
  try {
    const fleet = await Fleet.find().sort({ busNumber: 1 });
    res.json({ success: true, fleet });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createFleet = async (req, res) => {
  const { busNumber, type, source, destination, routeNumber, ownerMobile, driverMobile, conductorMobile, description } = req.body;
  if (!busNumber || !type || !source || !destination) {
    return res.status(400).json({ success: false, message: 'busNumber, type, source and destination are required' });
  }
  try {
    const existing = await Fleet.findOne({ busNumber: busNumber.trim().toUpperCase() });
    if (existing) return res.status(409).json({ success: false, message: 'Bus number already exists' });
    const fleet = await Fleet.create({
      busNumber, type,
      source: source.trim(),
      destination: destination.trim(),
      totalSeats: 47,
      routeNumber: routeNumber || '',
      ownerMobile: ownerMobile || '',
      driverMobile: driverMobile || '',
      conductorMobile: conductorMobile || '',
      description: description || '',
    });
    res.status(201).json({ success: true, message: 'Fleet vehicle created', fleet });
  } catch (error) {
    console.error('createFleet error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateFleet = async (req, res) => {
  const { busNumber, type, source, destination, routeNumber, ownerMobile, driverMobile, conductorMobile, description } = req.body;
  if (!busNumber || !type || !source || !destination) {
    return res.status(400).json({ success: false, message: 'busNumber, type, source and destination are required' });
  }
  try {
    const existing = await Fleet.findOne({ busNumber: busNumber.trim().toUpperCase(), _id: { $ne: req.params.id } });
    if (existing) return res.status(409).json({ success: false, message: 'Bus number already in use by another vehicle' });
    const fleet = await Fleet.findByIdAndUpdate(
      req.params.id,
      { busNumber, type, source: source.trim(), destination: destination.trim(), routeNumber: routeNumber || '', ownerMobile: ownerMobile || '', driverMobile: driverMobile || '', conductorMobile: conductorMobile || '', description: description || '' },
      { new: true, runValidators: true }
    );
    if (!fleet) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, message: 'Vehicle updated', fleet });
  } catch (error) {
    console.error('updateFleet error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.deleteFleet = async (req, res) => {
  try {
    const deleted = await Fleet.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, message: 'Vehicle removed' });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Trip Scheduling ───────────────────────────────────────────────────────────
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('busId', 'busNumber type')
      .sort({ departureDate: -1, departureTime: -1 });
    res.json({ success: true, schedules });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createSchedule = async (req, res) => {
  const { busId, source, destination, departureDate, departureTime, arrivalDate, arrivalTime, price,
          isRecurring, recurringDays, recurringEndDate } = req.body;
  if (!busId || !source || !destination || !departureDate || !departureTime || !arrivalTime || !price) {
    return res.status(400).json({ success: false, message: 'All trip fields are required' });
  }
  try {
    const bus = await Fleet.findById(busId);
    if (!bus) return res.status(404).json({ success: false, message: 'Fleet vehicle not found' });

    // Validate source/destination against bus registered route
    if (bus.source && bus.destination) {
      const s = source.trim().toLowerCase();
      const d = destination.trim().toLowerCase();
      const bs = bus.source.toLowerCase();
      const bd = bus.destination.toLowerCase();
      if (!((s === bs && d === bd) || (s === bd && d === bs))) {
        return res.status(400).json({
          success: false,
          message: `This bus only operates between ${bus.source} and ${bus.destination}`,
        });
      }
    }

    const totalSeats = bus.totalSeats || 47;

    // Helper to compute arrival date when overnight (arrivalTime < departureTime)
    const computeArrDate = (depDate, depTime, arrTime, explicitArrDate) => {
      if (explicitArrDate) return explicitArrDate;
      if (!depTime || !arrTime || arrTime >= depTime) return depDate;
      const next = new Date(depDate + 'T00:00:00');
      next.setDate(next.getDate() + 1);
      return next.toISOString().split('T')[0];
    };

    const baseData = {
      busId, source, destination, departureTime, arrivalTime, price: Number(price),
      totalSeats, bookedSeats: [],
    };

    // ── Recurring: create one Schedule per matching weekday in date range ────
    if (isRecurring && Array.isArray(recurringDays) && recurringDays.length > 0 && recurringEndDate) {
      const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      const validDayNums = recurringDays.filter(d => dayMap[d] !== undefined).map(d => dayMap[d]);
      if (validDayNums.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid recurring days' });
      }
      const recurringGroupId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const start = new Date(departureDate + 'T00:00:00');
      const end   = new Date(recurringEndDate + 'T00:00:00');
      const schedulesToCreate = [];
      const current = new Date(start);
      while (current <= end) {
        if (validDayNums.includes(current.getDay())) {
          const depDateStr = current.toISOString().split('T')[0];
          schedulesToCreate.push({
            ...baseData,
            departureDate: depDateStr,
            arrivalDate: computeArrDate(depDateStr, departureTime, arrivalTime, null),
            isRecurring: true,
            recurringGroupId,
          });
        }
        current.setDate(current.getDate() + 1);
      }
      if (schedulesToCreate.length === 0) {
        return res.status(400).json({ success: false, message: 'No matching dates in the selected range' });
      }
      const created = await Schedule.insertMany(schedulesToCreate);
      const first = await Schedule.findById(created[0]._id).populate('busId', 'busNumber type');
      return res.status(201).json({
        success: true,
        message: `${created.length} recurring trip${created.length !== 1 ? 's' : ''} scheduled`,
        schedule: first,
        count: created.length,
      });
    }

    // ── Single schedule ──────────────────────────────────────────────────────
    const computedArrivalDate = computeArrDate(departureDate, departureTime, arrivalTime, arrivalDate);
    const schedule = await Schedule.create({
      ...baseData,
      departureDate,
      arrivalDate: computedArrivalDate,
      isRecurring: false,
    });
    const populated = await schedule.populate('busId', 'busNumber type');
    res.status(201).json({ success: true, message: 'Schedule created', schedule: populated });
  } catch (error) {
    console.error('createSchedule error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const deleted = await Schedule.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Schedule not found' });
    res.json({ success: true, message: 'Schedule deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Users ─────────────────────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Admin Settings ────────────────────────────────────────────────────────────
exports.updateAdminPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('updateAdminPassword error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
