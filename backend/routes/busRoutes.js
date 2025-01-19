const express = require('express');
const {getBusses , getBus ,putBus,updateSeats} = require('../controllers/busController');
const router = express.Router();

router.get("/getBuses",getBusses);
router.get("/getBus/:id", getBus);
router.put("/buses/:id",putBus);
router.put("/updateSeats/:busId",updateSeats)

module.exports = router;
