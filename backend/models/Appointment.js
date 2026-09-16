const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor reference is required'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
    },
    appointmentDate: {
      type: String, // Stored as ISO date string 'YYYY-MM-DD' for exact day matching
      required: [true, 'Appointment date is required (YYYY-MM-DD)'],
    },
    timeSlot: {
      type: String, // e.g. "09:00 - 09:30"
      required: [true, 'Time slot is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Consultation', 'Follow-up', 'Emergency', 'Routine Checkup'],
      default: 'Consultation',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In-Progress', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    reason: {
      type: String,
      required: [true, 'Reason for consultation is required'],
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    cancelReason: {
      type: String,
      default: '',
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate appointmentNumber
appointmentSchema.pre('save', function (next) {
  if (!this.appointmentNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 900);
    this.appointmentNumber = `APT-${timestamp}-${random}`;
  }
  next();
});

// Compound index to guarantee no double bookings for active appointments
// Any non-cancelled appointment occupies the slot uniquely
appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['Scheduled', 'In-Progress'] } },
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
