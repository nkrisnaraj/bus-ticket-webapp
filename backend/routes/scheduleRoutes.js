const express = require('express');
const { searchSchedules, getSchedule } = require('../controllers/scheduleController');
const router = express.Router();

// Public routes — no auth required
router.get('/', searchSchedules);
router.get('/:id', getSchedule);

module.exports = router;
