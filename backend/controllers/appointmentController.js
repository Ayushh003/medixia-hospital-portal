const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const Department = require('../models/Department');
const Notification = require('../models/Notification');
const {
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
} = require('../utils/emailService');

// Helper to format 24h time to 12h or standard string
const generateSlotsFromHours = (startStr, endStr, durationMins) => {
  const slots = [];
  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);

  let currentTotalMins = startH * 60 + startM;
  const endTotalMins = endH * 60 + endM;

  while (currentTotalMins + durationMins <= endTotalMins) {
    const slotStartH = Math.floor(currentTotalMins / 60);
    const slotStartM = currentTotalMins % 60;
    const slotEndMins = currentTotalMins + durationMins;
    const slotEndH = Math.floor(slotEndMins / 60);
    const slotEndM = slotEndMins % 60;

    const pad = (n) => (n < 10 ? '0' + n : n);
    const formattedSlot = `${pad(slotStartH)}:${pad(slotStartM)} - ${pad(slotEndH)}:${pad(slotEndM)}`;

    slots.push(formattedSlot);
    currentTotalMins += durationMins;
  }
  return slots;
};

// @desc    Get dynamic time slots for a doctor on a specific date (Double Booking check)
// @route   GET /api/appointments/slots?doctorId=...&date=YYYY-MM-DD
// @access  Public
const getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: 'Both doctorId and date (YYYY-MM-DD) are required.' });
    }

    // Find doctor profile (by user or profile id)
    let doctorProfile = await DoctorProfile.findById(doctorId).populate('user', 'name');
    let doctorUserId = doctorProfile ? doctorProfile.user._id : null;

    if (!doctorProfile) {
      doctorProfile = await DoctorProfile.findOne({ user: doctorId }).populate('user', 'name');
      doctorUserId = doctorId;
    }

    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    // Check if the doctor practices on the requested day of week
    const targetDate = new Date(`${date}T00:00:00Z`);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[targetDate.getUTCDay()];

    const isAvailableDay = doctorProfile.availableDays.includes(dayOfWeek);
    if (!isAvailableDay) {
      return res.status(200).json({
        success: true,
        isDoctorAvailableDay: false,
        message: `Dr. ${doctorProfile.user?.name || 'Doctor'} is not available on ${dayOfWeek}s. Available days: ${doctorProfile.availableDays.join(', ')}`,
        slots: [],
      });
    }

    // Generate full slots based on working hours
    const startHour = doctorProfile.workingHours?.start || '09:00';
    const endHour = doctorProfile.workingHours?.end || '17:00';
    const slotDuration = doctorProfile.slotDurationMinutes || 30;

    const allSlots = generateSlotsFromHours(startHour, endHour, slotDuration);

    // Query active booked appointments for this doctor on the date
    const bookedAppointments = await Appointment.find({
      doctor: doctorUserId,
      appointmentDate: date,
      status: { $in: ['Scheduled', 'In-Progress'] },
    }).select('timeSlot appointmentNumber status');

    const bookedSlotSet = new Set(bookedAppointments.map((a) => a.timeSlot));

    // Map slot items with availability status
    const resultSlots = allSlots.map((slot) => {
      const isBooked = bookedSlotSet.has(slot);
      return {
        slot,
        isAvailable: !isBooked,
      };
    });

    res.status(200).json({
      success: true,
      doctor: {
        id: doctorUserId,
        name: doctorProfile.user?.name,
        specialization: doctorProfile.specialization,
        fee: doctorProfile.consultationFee,
      },
      date,
      dayOfWeek,
      totalSlots: resultSlots.length,
      availableSlotsCount: resultSlots.filter((s) => s.isAvailable).length,
      slots: resultSlots,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Book a new appointment (Strict double-booking prevention)
// @route   POST /api/appointments
// @access  Private (Patient, Receptionist, Admin)
const bookAppointment = async (req, res, next) => {
  try {
    let { patientId, doctorId, departmentId, appointmentDate, timeSlot, type, reason, notes } = req.body;

    // If patient is booking, use req.user._id
    if (req.user.role === 'patient') {
      patientId = req.user._id;
    } else if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID is required.' });
    }

    if (!doctorId || !appointmentDate || !timeSlot || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, appointment date, time slot, and reason are required.',
      });
    }

    // Resolve doctor user id and profile
    let doctorProfile = await DoctorProfile.findById(doctorId).populate('user', 'name email');
    let doctorUserId = doctorProfile ? doctorProfile.user._id : null;

    if (!doctorProfile) {
      doctorProfile = await DoctorProfile.findOne({ user: doctorId }).populate('user', 'name email');
      doctorUserId = doctorId;
    }

    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // Auto-resolve department if missing
    if (!departmentId) {
      departmentId = doctorProfile.department;
    }

    // Validate that appointment date is today or in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosenDate = new Date(`${appointmentDate}T00:00:00`);
    if (chosenDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Appointments cannot be booked in the past.',
      });
    }

    // =========================================================================
    // STRICT DOUBLE-BOOKING PREVENTION ENGINE
    // 1. Atomic lookup for active appointment on identical doctor + date + slot
    // =========================================================================
    const existingConflict = await Appointment.findOne({
      doctor: doctorUserId,
      appointmentDate,
      timeSlot,
      status: { $in: ['Scheduled', 'In-Progress'] },
    });

    const formatDocName = (name) => (name?.startsWith('Dr.') ? name : `Dr. ${name}`);

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        code: 'SLOT_ALREADY_BOOKED',
        message: `Conflict: ${formatDocName(doctorProfile.user?.name)} is already booked for ${timeSlot} on ${appointmentDate}. Please choose an open slot.`,
      });
    }

    // 2. Prevent patient from double-booking themselves for the exact same slot with multiple doctors
    const patientConflict = await Appointment.findOne({
      patient: patientId,
      appointmentDate,
      timeSlot,
      status: { $in: ['Scheduled', 'In-Progress'] },
    });

    if (patientConflict) {
      return res.status(409).json({
        success: false,
        message: `You already have an appointment scheduled at ${timeSlot} on ${appointmentDate}.`,
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorUserId,
      department: departmentId,
      appointmentDate,
      timeSlot,
      type: type || 'Consultation',
      reason,
      notes: notes || '',
      bookedBy: req.user._id,
      consultationFee: doctorProfile.consultationFee || 0,
      paymentStatus: 'Pending',
      status: 'Scheduled',
    });

    // Populate for response and notification
    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone')
      .populate('department', 'name code');

    // Create in-app notifications
    await Notification.create([
      {
        recipient: doctorUserId,
        title: 'New Appointment Scheduled',
        message: `${populated.patient?.name} booked an appointment for ${appointmentDate} at ${timeSlot}.`,
        type: 'appointment_booked',
        link: `/doctor/appointments`,
      },
      {
        recipient: patientId,
        title: 'Appointment Confirmed',
        message: `Your appointment #${populated.appointmentNumber} with Dr. ${populated.doctor?.name} on ${appointmentDate} is confirmed.`,
        type: 'appointment_booked',
        link: `/patient/appointments`,
      },
    ]);

    // Send automated email notification via Nodemailer asynchronously
    if (populated.patient?.email) {
      sendAppointmentConfirmation({
        patientEmail: populated.patient.email,
        patientName: populated.patient.name,
        doctorName: populated.doctor?.name,
        departmentName: populated.department?.name,
        appointmentDate,
        timeSlot,
        appointmentNumber: populated.appointmentNumber,
      }).catch((e) => console.warn('[Email confirmation background error]:', e.message));
    }

    res.status(201).json({
      success: true,
      message: 'Appointment successfully booked and confirmed.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments list (Role-filtered)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res, next) => {
  try {
    const { doctorId, patientId, departmentId, date, status } = req.query;
    let query = {};

    // Role-based restrictions
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    } else {
      // Admin or Receptionist can query by specific doctor or patient
      if (doctorId) query.doctor = doctorId;
      if (patientId) query.patient = patientId;
    }

    if (departmentId) query.department = departmentId;
    if (date) query.appointmentDate = date;
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone gender')
      .populate('doctor', 'name email phone avatar')
      .populate('department', 'name code')
      .populate('bookedBy', 'name role')
      .sort({ appointmentDate: -1, timeSlot: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone gender')
      .populate('doctor', 'name email phone avatar')
      .populate('department', 'name code description')
      .populate('bookedBy', 'name role');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // RBAC check: Patient can only view their appointment, doctor only theirs
    if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (e.g. In-Progress, Completed, Cancelled)
// @route   PUT /api/appointments/:id/status
// @access  Private
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, cancelReason } = req.body;

    const validStatuses = ['Scheduled', 'In-Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('doctor', 'name email');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Permissions check:
    // Patient can only cancel their own appointment
    if (req.user.role === 'patient') {
      if (appointment.patient._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      if (status !== 'Cancelled') {
        return res.status(403).json({ success: false, message: 'Patients are only permitted to cancel appointments.' });
      }
    }

    appointment.status = status;
    if (status === 'Cancelled') {
      appointment.cancelReason = cancelReason || 'Cancelled by user/hospital';
    }

    await appointment.save();

    // Trigger cancellation notification if cancelled
    if (status === 'Cancelled') {
      await Notification.create({
        recipient: req.user.role === 'patient' ? appointment.doctor._id : appointment.patient._id,
        title: 'Appointment Cancelled',
        message: `Appointment #${appointment.appointmentNumber} on ${appointment.appointmentDate} (${appointment.timeSlot}) has been cancelled.`,
        type: 'appointment_cancelled',
      });

      if (appointment.patient?.email) {
        sendAppointmentCancellation({
          patientEmail: appointment.patient.email,
          patientName: appointment.patient.name,
          doctorName: appointment.doctor?.name,
          appointmentDate: appointment.appointmentDate,
          timeSlot: appointment.timeSlot,
          appointmentNumber: appointment.appointmentNumber,
          reason: appointment.cancelReason,
        }).catch((e) => console.warn('[Email cancel error]:', e.message));
      }
    }

    res.status(200).json({
      success: true,
      message: `Appointment status changed to ${status}`,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableSlots,
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
};
