const express = require('express');
const router = express.Router();
const {
  createMedicalRecord,
  getMedicalRecordById,
  getPatientRecords,
} = require('../controllers/emrController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/', authorize('doctor', 'admin'), createMedicalRecord);
router.get('/:id', getMedicalRecordById);
router.get('/patient/:patientId', getPatientRecords);

module.exports = router;
