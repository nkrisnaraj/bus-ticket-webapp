const Schedule = require('../models/Schedule');

// Public: search schedules by source, destination, date
exports.searchSchedules = async (req, res) => {
  try {
    const { source, destination, date } = req.query;
    const filter = { status: 'scheduled' };
    if (source) filter.source = { $regex: new RegExp(`^${source.trim()}$`, 'i') };
    if (destination) filter.destination = { $regex: new RegExp(`^${destination.trim()}$`, 'i') };
    if (date) filter.departureDate = date;

    const schedules = await Schedule.find(filter)
      .populate('busId', 'busNumber type totalSeats')
      .sort({ departureTime: 1 });

    res.json({ success: true, schedules });
  } catch (error) {
    console.error('searchSchedules error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Public: get a single schedule by ID
exports.getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('busId', 'busNumber type totalSeats');

    if (!schedule || schedule.status === 'cancelled') {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    res.json({ success: true, schedule });
  } catch (error) {
    console.error('getSchedule error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
