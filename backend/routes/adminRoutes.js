const express = require('express');
const {
  getAllBookings,
  getAllFleet, createFleet, updateFleet, deleteFleet,
  getAllSchedules, createSchedule, deleteSchedule,
  getAllUsers,
  updateAdminPassword,
} = require('../controllers/adminController');
const { adminProtect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/bookings', adminProtect, getAllBookings);

router.get('/fleet', adminProtect, getAllFleet);
router.post('/fleet', adminProtect, createFleet);
router.put('/fleet/:id', adminProtect, updateFleet);
router.delete('/fleet/:id', adminProtect, deleteFleet);

router.get('/schedules', adminProtect, getAllSchedules);
router.post('/schedules', adminProtect, createSchedule);
router.delete('/schedules/:id', adminProtect, deleteSchedule);

router.get('/users', adminProtect, getAllUsers);

router.put('/settings/password', adminProtect, updateAdminPassword);

module.exports = router;
