const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Department = require('../models/Department');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Notification = require('../models/Notification');

dotenv.config({ path: `${__dirname}/../.env` });

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_management');
    console.log('[Seed]: Connected to MongoDB...');

    // Clear existing collections
    await User.deleteMany();
    await Department.deleteMany();
    await DoctorProfile.deleteMany();
    await PatientProfile.deleteMany();
    await Appointment.deleteMany();
    await MedicalRecord.deleteMany();
    await Notification.deleteMany();

    console.log('[Seed]: Cleared existing hospital data...');

    // 1. Create Departments
    const departments = await Department.create([
      {
        name: 'Cardiology & Cardiovascular Sciences',
        code: 'CARD',
        description: 'Comprehensive diagnosis and advanced treatment of coronary artery disease, heart failure, and angioplasty.',
        icon: 'HeartPulse',
      },
      {
        name: 'Neurology & Neurosciences',
        code: 'NEUR',
        description: 'Specialized care for neurological disorders, stroke rehabilitation, epilepsy, and migraine treatment.',
        icon: 'Brain',
      },
      {
        name: 'Pediatrics & Neonatal Care',
        code: 'PEDI',
        description: 'Compassionate child healthcare, newborn neonatal care, immunization schedules, and growth monitoring.',
        icon: 'Baby',
      },
      {
        name: 'Orthopedics & Joint Reconstruction',
        code: 'ORTH',
        description: 'Joint replacement, arthroscopy, spine care, sports injury management, and fracture trauma.',
        icon: 'Bone',
      },
      {
        name: 'Internal Medicine & Critical Care',
        code: 'GMED',
        description: 'Primary health consultations, viral fever management, diabetes & hypertension control, and lifestyle wellness.',
        icon: 'Stethoscope',
      },
    ]);

    console.log(`[Seed]: Created ${departments.length} clinical departments.`);

    // 2. Create Admin User (Medical Superintendent)
    const adminUser = await User.create({
      name: 'Dr. Arvind Swaminathan (Medical Superintendent)',
      email: 'admin@medixia.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 98110 54321',
      gender: 'male',
    });

    // 3. Create Receptionist User
    const receptionistUser = await User.create({
      name: 'Priya Sharma',
      email: 'reception@medixia.com',
      password: 'reception123',
      role: 'receptionist',
      phone: '+91 98712 34560',
      gender: 'female',
    });

    // 4. Create Indian Doctors & Profiles
    const doctor1User = await User.create({
      name: 'Dr. Rajesh Sharma',
      email: 'rajesh.sharma@medixia.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+91 98230 11223',
      gender: 'male',
    });
    const doctor1Profile = await DoctorProfile.create({
      user: doctor1User._id,
      department: departments[0]._id, // Cardiology
      specialization: 'Senior Interventional Cardiologist',
      qualifications: 'MBBS, MD (Medicine), DM (Cardiology), FACC',
      experienceYears: 16,
      consultationFee: 800, // INR ₹800
      roomNumber: 'OPD Chamber 102 (A-Wing)',
      bio: 'Leading cardiologist with over 16 years of expertise in coronary angioplasty, hypertension, and preventive cardiovascular healthcare.',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: { start: '09:00', end: '16:00' },
      slotDurationMinutes: 30,
    });
    departments[0].headDoctor = doctor1User._id;
    await departments[0].save();

    const doctor2User = await User.create({
      name: 'Dr. Ananya Iyer',
      email: 'ananya.iyer@medixia.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+91 98341 22334',
      gender: 'female',
    });
    const doctor2Profile = await DoctorProfile.create({
      user: doctor2User._id,
      department: departments[1]._id, // Neurology
      specialization: 'Senior Consultant Neurologist',
      qualifications: 'MBBS, MD, DM (Neurology) AIIMS New Delhi',
      experienceYears: 12,
      consultationFee: 900, // INR ₹900
      roomNumber: 'OPD Chamber 204 (B-Wing)',
      bio: 'Trained at AIIMS New Delhi, specializing in chronic migraines, epilepsy, neuropathy, and post-stroke rehabilitation.',
      availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: { start: '09:30', end: '16:30' },
      slotDurationMinutes: 30,
    });
    departments[1].headDoctor = doctor2User._id;
    await departments[1].save();

    const doctor3User = await User.create({
      name: 'Dr. Vikram Malhotra',
      email: 'vikram.malhotra@medixia.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+91 98452 33445',
      gender: 'male',
    });
    await DoctorProfile.create({
      user: doctor3User._id,
      department: departments[2]._id, // Pediatrics
      specialization: 'Senior Pediatrician & Neonatologist',
      qualifications: 'MBBS, MD (Pediatrics), DNB',
      experienceYears: 10,
      consultationFee: 600, // INR ₹600
      roomNumber: 'OPD Chamber 108 (Child Pavilion)',
      bio: 'Compassionate pediatric care for infants and children, expert in national immunization schedules and seasonal infections.',
      availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      workingHours: { start: '10:00', end: '17:00' },
      slotDurationMinutes: 30,
    });

    const doctor4User = await User.create({
      name: 'Dr. Sunita Kulkarni',
      email: 'sunita.kulkarni@medixia.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+91 98563 44556',
      gender: 'female',
    });
    await DoctorProfile.create({
      user: doctor4User._id,
      department: departments[3]._id, // Orthopedics
      specialization: 'Joint Replacement & Spine Specialist',
      qualifications: 'MBBS, MS (Orthopedics), Fellowship (Arthroplasty UK)',
      experienceYears: 15,
      consultationFee: 850, // INR ₹850
      roomNumber: 'OPD Chamber 210 (B-Wing)',
      bio: 'Expert in knee and hip joint replacements, complex fracture management, and minimally invasive spine surgeries.',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Saturday'],
      workingHours: { start: '09:00', end: '15:00' },
      slotDurationMinutes: 30,
    });

    console.log('[Seed]: Created Indian Doctors and Profiles.');

    // 5. Create Indian Patients & Profiles
    const patient1User = await User.create({
      name: 'Rahul Verma',
      email: 'rahul.verma@gmail.com',
      password: 'patient123',
      role: 'patient',
      phone: '+91 98101 23456',
      gender: 'male',
    });
    await PatientProfile.create({
      user: patient1User._id,
      patientId: 'ABHA-DEL-89210',
      dateOfBirth: new Date('1990-06-15'),
      bloodGroup: 'B+',
      address: {
        street: 'B-42, Sector 62',
        city: 'Noida',
        state: 'Uttar Pradesh',
        zipCode: '201301',
      },
      emergencyContact: {
        name: 'Pooja Verma',
        relationship: 'Wife',
        phone: '+91 98101 99887',
      },
      allergies: ['Penicillin'],
      chronicConditions: ['Hypertension'],
      medicalHistoryNotes: 'Mild hypertensive history for 2 years, monitoring blood pressure regularly.',
    });

    const patient2User = await User.create({
      name: 'Neha Patel',
      email: 'neha.patel@gmail.com',
      password: 'patient123',
      role: 'patient',
      phone: '+91 98220 87654',
      gender: 'female',
    });
    await PatientProfile.create({
      user: patient2User._id,
      patientId: 'ABHA-MAH-44391',
      dateOfBirth: new Date('1996-03-22'),
      bloodGroup: 'O+',
      address: {
        street: 'Flat 402, Shivam Enclave, Andheri West',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400058',
      },
      emergencyContact: {
        name: 'Rohan Patel',
        relationship: 'Brother',
        phone: '+91 98220 11223',
      },
      allergies: ['Sulfa drugs'],
      chronicConditions: [],
      medicalHistoryNotes: 'Periodic tension headaches and cervical strain due to software work.',
    });

    console.log('[Seed]: Created Indian Patients and Profiles.');

    // 6. Create Seed Appointments
    const today = new Date();
    const pad = (n) => (n < 10 ? '0' + n : n);
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;

    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - 3);
    const pastStr = `${pastDate.getFullYear()}-${pad(pastDate.getMonth() + 1)}-${pad(pastDate.getDate())}`;

    // Completed past appointment with Prescription
    const apt1 = await Appointment.create({
      appointmentNumber: 'APT-DEL-901234',
      patient: patient1User._id,
      doctor: doctor1User._id,
      department: departments[0]._id,
      appointmentDate: pastStr,
      timeSlot: '09:30 - 10:00',
      type: 'Consultation',
      status: 'Completed',
      reason: 'Routine BP review and occasional chest heaviness after stairs climbing.',
      notes: 'Patient advised to bring recent lipid profile & ECG.',
      bookedBy: patient1User._id,
      consultationFee: 800,
      paymentStatus: 'Paid',
    });

    // Medical Record with prescription medicines
    await MedicalRecord.create({
      recordNumber: 'EMR-MEDX-883019',
      appointment: apt1._id,
      patient: patient1User._id,
      doctor: doctor1User._id,
      visitDate: pastDate,
      chiefComplaint: 'Mild exertional dyspnea and blood pressure fluctuation in evening hours.',
      symptoms: ['Exertional breathlessness', 'Mild morning headache', 'Fatigue'],
      diagnosis: 'Essential Hypertension (Stage 1) with normal cardiac rhythm (ICD-I10)',
      vitals: {
        bloodPressure: '136/86 mmHg',
        pulseRate: '76 bpm',
        temperature: '98.4 °F',
        respiratoryRate: '16 breaths/min',
        spO2: '99%',
        weightKg: '74 kg',
      },
      prescriptions: [
        {
          medicineName: 'Tab. Telma 40 (Telmisartan)',
          dosage: '40 mg',
          frequency: '1-0-0 (Morning post breakfast)',
          duration: '30 days',
          instructions: 'Take once daily in the morning with fresh water.',
        },
        {
          medicineName: 'Tab. Atorva 10 (Atorvastatin)',
          dosage: '10 mg',
          frequency: '0-0-1 (Bedtime after dinner)',
          duration: '30 days',
          instructions: 'Take at night after food.',
        },
        {
          medicineName: 'Tab. Pan 40 (Pantoprazole)',
          dosage: '40 mg',
          frequency: '1-0-0 (Empty stomach)',
          duration: '14 days',
          instructions: 'Take 30 minutes before morning tea/breakfast.',
        },
      ],
      labTestsRecommended: [
        'Lipid Profile Fasting',
        'Kidney Function Test / Serum Creatinine',
        'Standard 12-Lead ECG',
      ],
      doctorNotes: 'Maintain low dietary sodium (< 2.5g/day). 30 minutes brisk walking daily. Avoid fried and packaged snacks. Follow up after 4 weeks.',
      followUpDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    });

    // Appointment 2: Scheduled upcoming appointment
    await Appointment.create({
      appointmentNumber: 'APT-DEL-901235',
      patient: patient1User._id,
      doctor: doctor2User._id,
      department: departments[1]._id,
      appointmentDate: tomorrowStr,
      timeSlot: '11:00 - 11:30',
      type: 'Consultation',
      status: 'Scheduled',
      reason: 'Cervical pain and throbbing headache during prolonged screen hours.',
      bookedBy: receptionistUser._id,
      consultationFee: 900,
      paymentStatus: 'Paid',
    });

    // Appointment 3: Scheduled today appointment
    await Appointment.create({
      appointmentNumber: 'APT-DEL-901236',
      patient: patient2User._id,
      doctor: doctor1User._id,
      department: departments[0]._id,
      appointmentDate: todayStr,
      timeSlot: '14:00 - 14:30',
      type: 'Consultation',
      status: 'Scheduled',
      reason: 'Heart palpitations after tea/coffee intake and mild giddiness.',
      bookedBy: patient2User._id,
      consultationFee: 800,
      paymentStatus: 'Pending',
    });

    // Notifications
    await Notification.create([
      {
        recipient: adminUser._id,
        title: 'Medixia Clinical Portal Live',
        message: 'Medixia General Hospital ERP system is active and accepting patient admissions.',
        type: 'system_alert',
      },
      {
        recipient: doctor1User._id,
        title: 'OPD Schedule Ready',
        message: 'Dr. Rajesh Sharma, you have confirmed patient consultations for today.',
        type: 'appointment_booked',
      },
      {
        recipient: patient1User._id,
        title: 'Digital EMR & Prescription Available',
        message: 'Dr. Rajesh Sharma has issued your digital prescription for consultation #APT-DEL-901234.',
        type: 'emr_added',
      },
    ]);

    console.log('[Seed]: Successfully created Appointments, EMRs, and Notifications.');
    console.log('\n======================================================');
    console.log('   MEDIXIA GENERAL HOSPITAL - DEMO CREDENTIALS        ');
    console.log('======================================================');
    console.log('1. Medical Director (Admin): admin@medixia.com    / admin123');
    console.log('2. Cardiologist (Doctor):    rajesh.sharma@medixia.com / doctor123');
    console.log('3. Receptionist:             reception@medixia.com / reception123');
    console.log('4. Patient (Rahul Verma):    rahul.verma@gmail.com / patient123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDB();
