const express = require('express');
const router = express.Router();
const {
  getAllPatients,
  getPatientById,
  createWalkInPatient,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin', 'doctor', 'receptionist'), getAllPatients);
router.post('/walk-in', protect, authorize('admin', 'receptionist'), createWalkInPatient);
router.get('/:id', protect, getPatientById);

module.exports = router;
