const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Doctor must be assigned to a department'],
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    qualifications: {
      type: String,
      default: 'MBBS, MD',
      trim: true,
    },
    experienceYears: {
      type: Number,
      default: 5,
      min: 0,
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      default: 50,
      min: 0,
    },
    roomNumber: {
      type: String,
      default: 'OPD-101',
    },
    bio: {
      type: String,
      default: 'Experienced healthcare professional committed to patient-centered care.',
    },
    availableDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    workingHours: {
      start: {
        type: String,
        default: '09:00', // 24hr format HH:mm
      },
      end: {
        type: String,
        default: '17:00',
      },
    },
    slotDurationMinutes: {
      type: Number,
      default: 30, // 30 minutes slot
      min: 15,
      max: 120,
    },
    maxPatientsPerDay: {
      type: Number,
      default: 20,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
