const Bus = require("../models/Bus");

// Get all buses (with optional source, destination, date filtering)
const getBusses = async (req, res) => {
  try {
    const { source, destination, date } = req.query;
    const filter = {};
    if (source) filter.source = { $regex: new RegExp(`^${source}$`, 'i') };
    if (destination) filter.destination = { $regex: new RegExp(`^${destination}$`, 'i') };
    if (date) filter.Depart_date = date;

    const buses = await Bus.find(filter);
    res.status(200).json({ success: true, buses });
  } catch (error) {
    console.error("Error fetching buses:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get a single bus by ID
const getBus = async (req, res) => {
  try {
    const bus = await Bus.findOne({ id: req.params.id });
    if (!bus) {
      return res.status(404).json({ success: false, message: "Bus not found" });
    }
    res.status(200).json({ success: true, bus });
  } catch (error) {
    console.error("Error fetching bus:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a bus by ID
const putBus = async (req, res) => {
  try {
    const updatedBus = await Bus.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedBus) {
      return res.status(404).json({ success: false, message: "Bus not found" });
    }
    res.status(200).json({ success: true, message: "Bus updated successfully", bus: updatedBus });
  } catch (error) {
    console.error("Error updating bus:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Populate seats for a bus if not already populated
const updateSeats = async (req, res) => {
  try {
    const bus = await Bus.findOne({ id: req.params.busId });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    if (bus.seats.length === 0) {
      const seats = [];
      for (let col = 1; col <= 12; col++) {
        for (let row = 1; row <= 5; row++) {
          if ((row === 3 && col !== 12) || (col === 11 && row > 2)) continue;
          seats.push({ seatNumber: `${row}-${col}`, isBooked: false, bookedBy: null });
        }
      }
      bus.seats = seats;
      await bus.save();
      res.status(200).json({ message: 'Seats updated successfully' });
    } else {
      res.status(400).json({ message: 'Seats already populated' });
    }
  } catch (error) {
    console.error('Error updating seats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getBusses, getBus, putBus, updateSeats };
