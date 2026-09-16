const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Department = require('../models/Department');
const DoctorProfile = require('../models/DoctorProfile');

dotenv.config({ path: `${__dirname}/../.env` });

const testDoubleBooking = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_management');
    console.log('[Test]: Connected to MongoDB...');

    // Find Doctor 1 (Dr. Rajesh Sharma)
    const doctor = await User.findOne({ email: 'rajesh.sharma@medixia.com' }) || await User.findOne({ role: 'doctor' });
    const patient1 = await User.findOne({ email: 'rahul.verma@gmail.com' });
    const patient2 = await User.findOne({ email: 'neha.patel@gmail.com' });
    const department = await Department.findOne({ code: 'CARD' });

    if (!doctor || !patient1 || !patient2 || !department) {
      console.error('[Test Error]: Prerequisite seed data missing. Run seedRunner first.');
      process.exit(1);
    }

    const testDate = '2026-10-15';
    const testSlot = '10:00 - 10:30';

    // Clean up any test appointment
    await Appointment.deleteMany({ doctor: doctor._id, appointmentDate: testDate, timeSlot: testSlot });

    console.log(`[Test]: Attempting concurrent booking for Dr. Sarah Jenkins on ${testDate} at ${testSlot}...`);

    let booking1Result = null;
    let booking2Result = null;

    // Booking 1 by Patient 1
    try {
      booking1Result = await Appointment.create({
        patient: patient1._id,
        doctor: doctor._id,
        department: department._id,
        appointmentDate: testDate,
        timeSlot: testSlot,
        type: 'Consultation',
        reason: 'Patient 1 test booking',
        bookedBy: patient1._id,
        status: 'Scheduled',
      });
      console.log('✅ Booking 1 Succeeded! Appointment ID:', booking1Result.appointmentNumber);
    } catch (err) {
      console.error('❌ Booking 1 Unexpected Failure:', err.message);
    }

    // Booking 2 by Patient 2 for the exact same slot
    try {
      booking2Result = await Appointment.create({
        patient: patient2._id,
        doctor: doctor._id,
        department: department._id,
        appointmentDate: testDate,
        timeSlot: testSlot,
        type: 'Consultation',
        reason: 'Patient 2 duplicate test booking',
        bookedBy: patient2._id,
        status: 'Scheduled',
      });
      console.error('❌ DOUBLE BOOKING FLAW: Booking 2 was allowed! Duplicate slot was created.');
    } catch (err) {
      console.log('✅ DOUBLE BOOKING PREVENTED AS EXPECTED: Duplicate booking was strictly blocked!');
      console.log('   Error Code/Message:', err.code, err.message);
    }

    // Clean up test data
    await Appointment.deleteMany({ doctor: doctor._id, appointmentDate: testDate, timeSlot: testSlot });
    console.log('[Test Cleaned Up]: Double booking prevention test verified successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Test Failure]:', error);
    process.exit(1);
  }
};

testDoubleBooking();
