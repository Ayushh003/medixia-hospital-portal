const express = require('express');
const router = express.Router();
const {
  getAvailableSlots,
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

// Public or authenticated slot lookup
router.get('/slots', getAvailableSlots);

router.use(protect);
router.post('/', bookAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id/status', updateAppointmentStatus);

module.exports = router;
