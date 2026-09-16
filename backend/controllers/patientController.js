const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');

// @desc    Get all patients with search & pagination
// @route   GET /api/patients
// @access  Private (Admin, Doctor, Receptionist)
const getAllPatients = async (req, res, next) => {
  try {
    const { search } = req.query;

    let query = { role: 'patient', isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const patients = await User.find(query).select('-password').sort({ createdAt: -1 });

    // Attach profile details
    const patientIds = patients.map((p) => p._id);
    const profiles = await PatientProfile.find({ user: { $in: patientIds } });
    const profileMap = new Map();
    profiles.forEach((pr) => profileMap.set(pr.user.toString(), pr));

    const combined = patients.map((p) => ({
      ...p.toObject(),
      profile: profileMap.get(p._id.toString()) || null,
    }));

    res.status(200).json({
      success: true,
      count: combined.length,
      data: combined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient details with clinical history
// @route   GET /api/patients/:id
// @access  Private (Admin, Doctor, Receptionist, or the Patient themselves)
const getPatientById = async (req, res, next) => {
  try {
    const patientId = req.params.id;

    // RBAC check: if role is patient, they can only view their own record
    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({ success: false, message: 'Access forbidden to other patient records.' });
    }

    const patient = await User.findById(patientId).select('-password');
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const profile = await PatientProfile.findOne({ user: patient._id });
    const medicalRecords = await MedicalRecord.find({ patient: patient._id })
      .populate('doctor', 'name email')
      .sort({ visitDate: -1 });

    const appointments = await Appointment.find({ patient: patient._id })
      .populate('doctor', 'name email')
      .populate('department', 'name code')
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        patient,
        profile,
        medicalRecords,
        appointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register walk-in patient by Receptionist or Admin
// @route   POST /api/patients/walk-in
// @access  Private (Receptionist, Admin)
const createWalkInPatient = async (req, res, next) => {
  try {
    const { name, email, phone, gender, bloodGroup, dateOfBirth, address, emergencyContact } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Patient name and phone number are required.' });
    }

    // If no email provided, generate an internal alias
    const patientEmail = email || `patient.${Date.now()}.${Math.floor(Math.random() * 1000)}@hospital.internal`;

    const existing = await User.findOne({ email: patientEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Patient with this email already exists.' });
    }

    // Default password for walk-in patient accounts
    const defaultPassword = 'Hospital@' + Math.floor(1000 + Math.random() * 9000);

    const user = await User.create({
      name,
      email: patientEmail,
      password: defaultPassword,
      role: 'patient',
      phone,
      gender: gender || 'unspecified',
    });

    const profile = await PatientProfile.create({
      user: user._id,
      bloodGroup: bloodGroup || 'Unknown',
      dateOfBirth: dateOfBirth || null,
      address: address || {},
      emergencyContact: emergencyContact || {},
    });

    res.status(201).json({
      success: true,
      message: 'Walk-in patient registered successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
        },
        profile,
        temporaryPassword: defaultPassword,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createWalkInPatient,
};
