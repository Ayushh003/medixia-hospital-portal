const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllStaff,
  toggleUserStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));
router.get('/stats', getDashboardStats);
router.get('/staff', getAllStaff);
router.put('/users/:id/toggle-status', toggleUserStatus);

module.exports = router;
