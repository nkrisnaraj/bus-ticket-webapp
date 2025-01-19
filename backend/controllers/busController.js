const express = require("express");
const Bus = require("../models/Bus");
const router = express.Router();

// // Add a new bus
// router.post("/buses", async (req, res) => {
//   const {
//     id,
//     source,
//     destination,
//     depart_date,
//     arrive_date,
//     closing_date,
//     closing_time,
//     depart_time,
//     arrive_time,
//     price,
//     type,
//   } = req.body;

//   try {
//     // Create a new bus document
//     const newBus = new Bus({
//       id,
//       source,
//       destination,
//       depart_date,
//       arrive_date,
//       closing_date,
//       closing_time,
//       depart_time,
//       arrive_time,
//       price,
//       type,
//     });

//     await newBus.save();
//     res.status(201).json({ success: true, message: "Bus added successfully", bus: newBus });
//   } catch (error) {
//     console.error("Error adding bus:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// Get all buses
// router.get("/buses", async (req, res) => {
router.getBusses = async (req, res) => {
  try {
    const buses = await Bus.find();
    res.status(200).json({ success: true, buses });
  } catch (error) {
    console.error("Error fetching buses:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get a single bus by ID

router.getBus = async (req, res) => {
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
const updateSeats = async (req, res) => {
    try {
      const bus = await Bus.findOne({ id: req.params.busId });  // Ensure busId is passed correctly
      if (!bus) {
        return res.status(404).json({ message: 'Bus not found' });
      }
  
      if (bus.seats.length === 0) {
        let seats = [];
        for (let col = 1; col <= 12; col++) {
          for (let row = 1; row <= 5; row++) {
            if ((row === 3 && col !== 12) || (col === 11 && row > 2)) {
              continue;
            }
            seats.push({
              seatNumber: `${row}-${col}`,
              isBooked: false,
              bookedBy: null,
            });
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
  
// Update a bus by ID
router.putBus = async (req, res) => {
  try {
    const updatedBus = await Bus.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true } // Return the updated document
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



// Delete a bus by ID
router.delete("/buses/:id", async (req, res) => {
  try {
    const deletedBus = await Bus.findOneAndDelete({ id: req.params.id });

    if (!deletedBus) {
      return res.status(404).json({ success: false, message: "Bus not found" });
    }

    res.status(200).json({ success: true, message: "Bus deleted successfully" });
  } catch (error) {
    console.error("Error deleting bus:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
