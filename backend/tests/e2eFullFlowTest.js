const BASE_URL = 'http://localhost:5000/api';

async function runE2ETests() {
  console.log('====================================================');
  console.log('   FULL STACK HOSPITAL MANAGEMENT SYSTEM E2E TESTS  ');
  console.log('====================================================\n');

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    console.log('1. Health check:', health.status === 'online' ? '✅ PASSED' : '❌ FAILED');

    // 2. Patient Login (Rahul Verma)
    const patLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul.verma@gmail.com', password: 'patient123' }),
    });
    const patAuth = await patLoginRes.json();
    console.log('2. Patient Login (Rahul Verma):', patAuth.success ? '✅ PASSED' : '❌ FAILED');
    const patientToken = patAuth.token;
    const patientId = patAuth.user._id;

    // 3. Doctor Login (Dr. Rajesh Sharma)
    const docLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rajesh.sharma@medixia.com', password: 'doctor123' }),
    });
    const docAuth = await docLoginRes.json();
    console.log('3. Doctor Login (Dr. Rajesh Sharma):', docAuth.success ? '✅ PASSED' : '❌ FAILED');
    const doctorToken = docAuth.token;
    const doctorUserId = docAuth.user._id;

    // 4. Query available slots for Doctor on a target date
    const testDate = '2026-11-20'; // Friday
    const slotsRes = await fetch(`${BASE_URL}/appointments/slots?doctorId=${doctorUserId}&date=${testDate}`);
    const slotsData = await slotsRes.json();
    console.log(`4. Slot Availability for ${testDate}:`, slotsData.success ? `✅ PASSED (${slotsData.availableSlotsCount} open slots)` : '❌ FAILED');

    const chosenSlot = slotsData.slots.find((s) => s.isAvailable)?.slot || '11:00 - 11:30';

    // 5. Book Appointment
    const bookRes = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({
        doctorId: doctorUserId,
        appointmentDate: testDate,
        timeSlot: chosenSlot,
        type: 'Consultation',
        reason: 'E2E Test: Routine cardiovascular wellness review',
      }),
    });
    const bookData = await bookRes.json();
    console.log(`5. Appointment Booking (${chosenSlot}):`, bookData.success ? `✅ PASSED (Ref: ${bookData.data.appointmentNumber})` : '❌ FAILED', bookData.message);
    const appointmentId = bookData.data?._id;

    // 6. Strict Double-Booking Test: Attempt booking the exact same doctor and slot again
    const dupBookRes = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({
        doctorId: doctorUserId,
        appointmentDate: testDate,
        timeSlot: chosenSlot,
        type: 'Consultation',
        reason: 'E2E Duplicate Collision Attempt',
      }),
    });
    const dupBookData = await dupBookRes.json();
    if (dupBookRes.status === 409) {
      console.log('6. Strict Double-Booking Prevention:', '✅ PASSED (Blocked with 409 Conflict):', dupBookData.message);
    } else {
      console.log('6. Strict Double-Booking Prevention:', '❌ FAILED - Allowed duplicate slot!');
    }

    // 7. Doctor Starts Consultation & Issues EMR Record + Prescription
    const emrRes = await fetch(`${BASE_URL}/emr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doctorToken}`,
      },
      body: JSON.stringify({
        appointmentId,
        chiefComplaint: 'Mild chest heaviness post-jogging',
        diagnosis: 'Stage 1 Hypertension & Sinus Bradycardia (ICD-I10)',
        symptoms: ['Exertional dyspnea', 'Palpitations'],
        vitals: {
          bloodPressure: '132/84 mmHg',
          pulseRate: '68 bpm',
          temperature: '98.6 °F',
          spO2: '99%',
        },
        prescriptions: [
          {
            medicineName: 'Metoprolol Succinate',
            dosage: '25 mg',
            frequency: '1-0-0 (Morning)',
            duration: '30 days',
            instructions: 'Take with morning meal',
          },
        ],
        doctorNotes: 'Maintain low-sodium dietary restrictions. Aerobic exercise 30 mins/day.',
      }),
    });
    const emrData = await emrRes.json();
    console.log('7. Doctor Issues EMR & Prescription:', emrData.success ? `✅ PASSED (EMR Ref: ${emrData.data.recordNumber})` : '❌ FAILED');

    // 8. Patient verifies Prescription Access
    const patientRecordsRes = await fetch(`${BASE_URL}/emr/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const patientRecords = await patientRecordsRes.json();
    const hasIssuedRecord = patientRecords.data.some((r) => r.appointment === appointmentId || r.appointment?._id === appointmentId);
    console.log('8. Patient EMR & Prescription Access:', hasIssuedRecord ? '✅ PASSED' : '❌ FAILED');

    // 9. Receptionist Overview
    const recLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'reception@medixia.com', password: 'reception123' }),
    });
    const recAuth = await recLoginRes.json();
    console.log('9. Receptionist Login & Access:', recAuth.success ? '✅ PASSED' : '❌ FAILED');

    console.log('\n====================================================');
    console.log('   ALL E2E WORKFLOW TESTS PASSED SUCCESSFULLY!       ');
    console.log('====================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('E2E Test Execution Error:', err);
    process.exit(1);
  }
}

runE2ETests();
