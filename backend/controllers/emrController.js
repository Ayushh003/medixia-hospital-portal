const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendPrescriptionReadyEmail } = require('../utils/emailService');

// @desc    Create EMR record & Prescription for an appointment
// @route   POST /api/emr
// @access  Private (Doctor only)
const createMedicalRecord = async (req, res, next) => {
  try {
    const {
      appointmentId,
      chiefComplaint,
      symptoms,
      diagnosis,
      vitals,
      prescriptions,
      labTestsRecommended,
      doctorNotes,
      followUpDate,
    } = req.body;

    if (!appointmentId || !chiefComplaint || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID, chief complaint, and diagnosis are required.',
      });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name email')
      .populate('doctor', 'name email');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify that the doctor issuing the record is the assigned doctor or admin
    if (req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned consultation doctor can create this medical record.',
      });
    }

    const medicalRecord = await MedicalRecord.create({
      appointment: appointment._id,
      patient: appointment.patient._id,
      doctor: appointment.doctor._id,
      chiefComplaint,
      symptoms: symptoms || [],
      diagnosis,
      vitals: vitals || {},
      prescriptions: prescriptions || [],
      labTestsRecommended: labTestsRecommended || [],
      doctorNotes: doctorNotes || '',
      followUpDate: followUpDate || null,
      visitDate: new Date(),
    });

    // Mark the appointment as Completed
    appointment.status = 'Completed';
    await appointment.save();

    // In-app notification for the patient
    await Notification.create({
      recipient: appointment.patient._id,
      title: 'Prescription & EMR Ready',
      message: `Dr. ${appointment.doctor?.name} has issued your medical consultation summary and prescription.`,
      type: 'emr_added',
      link: `/patient/records/${medicalRecord._id}`,
    });

    // Send email notification
    if (appointment.patient?.email) {
      sendPrescriptionReadyEmail({
        patientEmail: appointment.patient.email,
        patientName: appointment.patient.name,
        doctorName: appointment.doctor?.name,
        recordNumber: medicalRecord.recordNumber,
        visitDate: medicalRecord.visitDate,
      }).catch((e) => console.warn('[Email EMR notification error]:', e.message));
    }

    const populatedRecord = await MedicalRecord.findById(medicalRecord._id)
      .populate('patient', 'name email phone gender')
      .populate('doctor', 'name email phone avatar')
      .populate('appointment');

    res.status(201).json({
      success: true,
      message: 'Medical Record and Prescription created successfully.',
      data: populatedRecord,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single medical record by ID
// @route   GET /api/emr/:id
// @access  Private
const getMedicalRecordById = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'name email phone gender')
      .populate('doctor', 'name email phone avatar')
      .populate({
        path: 'appointment',
        populate: { path: 'department', select: 'name code' },
      });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    // RBAC check: Patient can only view their own
    if (req.user.role === 'patient' && record.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access forbidden' });
    }

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient EMR records list
// @route   GET /api/emr/patient/:patientId
// @access  Private
const getPatientRecords = async (req, res, next) => {
  try {
    const targetPatientId = req.params.patientId || req.user._id;

    // Patients cannot inspect other patients
    if (req.user.role === 'patient' && req.user._id.toString() !== targetPatientId.toString()) {
      return res.status(403).json({ success: false, message: 'Access forbidden' });
    }

    const records = await MedicalRecord.find({ patient: targetPatientId })
      .populate('doctor', 'name email phone')
      .populate({
        path: 'appointment',
        populate: { path: 'department', select: 'name code' },
      })
      .sort({ visitDate: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMedicalRecord,
  getMedicalRecordById,
  getPatientRecords,
};
