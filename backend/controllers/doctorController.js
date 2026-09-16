const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');

// @desc    Get all doctors with filtering
// @route   GET /api/doctors
// @access  Public
const getAllDoctors = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    let query = { isActive: true };

    if (department) {
      query.department = department;
    }

    let doctorProfiles = await DoctorProfile.find(query)
      .populate('user', 'name email phone avatar')
      .populate('department', 'name code icon');

    // Filter by name/specialization search if requested
    if (search) {
      const s = search.toLowerCase();
      doctorProfiles = doctorProfiles.filter(
        (doc) =>
          (doc.user && doc.user.name.toLowerCase().includes(s)) ||
          doc.specialization.toLowerCase().includes(s) ||
          (doc.department && doc.department.name.toLowerCase().includes(s))
      );
    }

    res.status(200).json({
      success: true,
      count: doctorProfiles.length,
      data: doctorProfiles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor by ID (profile ID or user ID)
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res, next) => {
  try {
    let doctor = await DoctorProfile.findById(req.params.id)
      .populate('user', 'name email phone avatar gender')
      .populate('department', 'name code icon description');

    if (!doctor) {
      // Check if param is user ID
      doctor = await DoctorProfile.findOne({ user: req.params.id })
        .populate('user', 'name email phone avatar gender')
        .populate('department', 'name code icon description');
    }

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new doctor (Admin only)
// @route   POST /api/doctors
// @access  Private (Admin)
const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      gender,
      department,
      specialization,
      qualifications,
      experienceYears,
      consultationFee,
      roomNumber,
      bio,
      availableDays,
      workingHours,
    } = req.body;

    if (!name || !email || !password || !department || !specialization) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, department, and specialization are required.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'doctor',
      phone: phone || '',
      gender: gender || 'unspecified',
    });

    const doctorProfile = await DoctorProfile.create({
      user: user._id,
      department,
      specialization,
      qualifications: qualifications || 'MBBS, MD',
      experienceYears: experienceYears || 5,
      consultationFee: consultationFee || 50,
      roomNumber: roomNumber || 'OPD-101',
      bio: bio || '',
      availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: workingHours || { start: '09:00', end: '17:00' },
    });

    const populated = await DoctorProfile.findById(doctorProfile._id)
      .populate('user', 'name email phone gender')
      .populate('department', 'name code');

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Private (Doctor or Admin)
const updateDoctor = async (req, res, next) => {
  try {
    let doctor = await DoctorProfile.findById(req.params.id);
    if (!doctor) {
      doctor = await DoctorProfile.findOne({ user: req.params.id });
    }

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Only admin or the doctor himself can update
    if (req.user.role !== 'admin' && doctor.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this doctor profile' });
    }

    Object.assign(doctor, req.body);
    await doctor.save();

    const updated = await DoctorProfile.findById(doctor._id)
      .populate('user', 'name email phone avatar')
      .populate('department', 'name code');

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
};
