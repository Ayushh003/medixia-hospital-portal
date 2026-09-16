const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const Department = require('../models/Department');
const MedicalRecord = require('../models/MedicalRecord');

// @desc    Get aggregated admin KPI metrics & system overview
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const [
      totalDoctors,
      totalPatients,
      totalReceptionists,
      totalDepartments,
      totalAppointments,
      todayAppointments,
      completedAppointments,
      cancelledAppointments,
      totalMedicalRecords,
    ] = await Promise.all([
      User.countDocuments({ role: 'doctor', isActive: true }),
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'receptionist', isActive: true }),
      Department.countDocuments({ isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ appointmentDate: todayStr }),
      Appointment.countDocuments({ status: 'Completed' }),
      Appointment.countDocuments({ status: 'Cancelled' }),
      MedicalRecord.countDocuments(),
    ]);

    // Calculate revenue from completed appointments
    const revenueAgg = await Appointment.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$consultationFee' } } },
    ]);
    const estimatedRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Recent 5 appointments
    const recentAppointments = await Appointment.find()
      .populate('patient', 'name email phone')
      .populate('doctor', 'name')
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .limit(6);

    // Department breakdown
    const departmentBreakdown = await Department.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'appointments',
          localField: '_id',
          foreignField: 'department',
          as: 'appointments',
        },
      },
      {
        $project: {
          name: 1,
          code: 1,
          appointmentCount: { $size: '$appointments' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        totalPatients,
        totalReceptionists,
        totalDepartments,
        totalAppointments,
        todayAppointments,
        completedAppointments,
        cancelledAppointments,
        totalMedicalRecords,
        estimatedRevenue,
        recentAppointments,
        departmentBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all staff accounts (Admin, Doctor, Receptionist)
// @route   GET /api/admin/staff
// @access  Private (Admin)
const getAllStaff = async (req, res, next) => {
  try {
    const staff = await User.find({ role: { $in: ['doctor', 'receptionist', 'admin'] } })
      .select('-password')
      .sort({ role: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own admin account.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.name} is now ${user.isActive ? 'Active' : 'Deactivated'}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllStaff,
  toggleUserStatus,
};
