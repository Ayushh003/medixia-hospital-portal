const mongoose = require('mongoose');

const prescriptionItemSchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
  },
  dosage: {
    type: String, // e.g. "500 mg"
    required: [true, 'Dosage is required'],
  },
  frequency: {
    type: String, // e.g. "1-0-1 (Morning & Night)"
    required: [true, 'Frequency is required'],
  },
  duration: {
    type: String, // e.g. "5 days", "2 weeks"
    required: [true, 'Duration is required'],
  },
  instructions: {
    type: String, // e.g. "Take after food with warm water"
    default: 'Take as directed',
  },
});

const medicalRecordSchema = new mongoose.Schema(
  {
    recordNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    visitDate: {
      type: Date,
      default: Date.now,
    },
    chiefComplaint: {
      type: String,
      required: [true, 'Chief complaint is required'],
      trim: true,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true,
    },
    vitals: {
      bloodPressure: { type: String, default: '120/80 mmHg' },
      pulseRate: { type: String, default: '72 bpm' },
      temperature: { type: String, default: '98.6 °F' },
      respiratoryRate: { type: String, default: '16 breaths/min' },
      spO2: { type: String, default: '98%' },
      weightKg: { type: String, default: '' },
    },
    prescriptions: {
      type: [prescriptionItemSchema],
      default: [],
    },
    labTestsRecommended: {
      type: [String],
      default: [],
    },
    doctorNotes: {
      type: String,
      default: '',
    },
    followUpDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate recordNumber
medicalRecordSchema.pre('save', function (next) {
  if (!this.recordNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 900);
    this.recordNumber = `EMR-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
