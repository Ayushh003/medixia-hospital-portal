# Medixia General Hospital Management System

A full-stack hospital management web application built with the MERN stack (MongoDB, Express, React, Node.js). It provides role-based portals for hospital administrators, doctors, front-desk receptionists, and patients, covering the entire outpatient lifecycle from online appointment scheduling to digital medical records.

---

## Key Features

### Role-Based Access Control (RBAC)
- **Administrator**: Manage medical departments, doctor profiles, staff accounts, and view hospital-wide consultation metrics.
- **Doctor**: Manage OPD schedule, view scheduled patient queue, enter clinical observations (vitals, symptoms, diagnosis), and prescribe medications.
- **Receptionist**: Front-desk walk-in patient intake, live waiting room queue tracking, and real-time patient check-in.
- **Patient**: Search specialists by department, book appointment slots with live availability, view medical history, and view issued prescriptions.

### Appointment Booking Engine
- Dynamic 30-minute time slot generation based on doctor working hours and available days.
- Real-time double-booking prevention: slots already reserved are locked immediately.
- Patient duplicate prevention: blocks concurrent overlapping bookings for the same patient.
- Cancellation and status workflow (`Scheduled` → `In-Progress` → `Completed` / `Cancelled`).

### Electronic Medical Records (EMR)
- Structured consultation notes with ICD-compatible diagnosis and symptom tracking.
- Clinical vitals recording (blood pressure, pulse, temperature, respiration rate, SpO2, weight).
- Digital prescription builder with drug formulation, dosage, frequency, duration, and instructions.
- Centralized patient record viewer modal for fast clinical review.

### Notifications
- In-app notification system with unread badges and live updates.
- Automated email notifications via Nodemailer for booking confirmations, cancellations, and completed prescriptions.

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router 7, Axios, Lucide React
- **Backend**: Node.js, Express.js 4, Mongoose 8, JWT, bcryptjs, Nodemailer
- **Database**: MongoDB

---

## Project Structure

```
HospitalManage/
├── backend/
│   ├── config/             # Database connection setup
│   ├── controllers/        # Route controllers (auth, appointment, doctor, emr, etc.)
│   ├── middleware/         # Auth verification (JWT) and error handling
│   ├── models/             # Mongoose schemas (User, DoctorProfile, Appointment, etc.)
│   ├── routes/             # Express API route declarations
│   ├── utils/              # Email service and database seed scripts
│   ├── tests/              # End-to-end and concurrency test suites
│   ├── server.js           # Server entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/            # Axios client with request interceptors
    │   ├── components/     # Reusable UI, appointments, EMR, and layout components
    │   ├── context/        # React Auth and Notification context providers
    │   ├── pages/          # Role-specific views (Admin, Doctor, Patient, Receptionist)
    │   ├── App.jsx         # App router and protected route wrappers
    │   └── main.jsx        # React root mount
    ├── index.html
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or newer)
- MongoDB installed and running locally (`mongodb://127.0.0.1:27017`)

---

### 1. Backend Setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend/` directory (or use default configuration):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://127.0.0.1:27017/hospital_management
   JWT_SECRET=medixia_secret_key_2026
   JWT_EXPIRE=30d
   ```

4. Populate sample departments, doctors, and patients:
   ```bash
   npm run seed
   ```

5. Start the backend development server:
   ```bash
   npm start
   ```
   The backend API will run on **`http://localhost:5000`**.

---

### 2. Frontend Setup

1. Open a second terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The web application will open at **`http://localhost:5173`**.

---

## Default Test Accounts

After running `npm run seed` in the backend, you can test each role using these accounts:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@medixia.com` | `admin123` | Medical Superintendent |
| **Doctor** | `rajesh.sharma@medixia.com` | `doctor123` | Cardiologist |
| **Receptionist** | `reception@medixia.com` | `reception123` | Front Desk Counter |
| **Patient** | `rahul.verma@gmail.com` | `patient123` | Registered Patient |

*(Quick-fill buttons are also available on the login screen for local testing).*

---

## Running Automated Tests

Run the test scripts from the `backend/` directory:

```bash
# Test double-booking collision prevention under concurrent requests
node tests/doubleBookingTest.js

# Test full end-to-end flow (auth, slots, booking, collision check, EMR)
node tests/e2eFullFlowTest.js
```

---

## Deploying to Vercel (Single Full-Stack Deployment)

This repository is pre-configured to run **both the React frontend and Node.js Express backend together on Vercel** under one domain with zero CORS issues.

1. Push your code to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/) and click **"Add New Project"** > **"Import Git Repository"**.
3. In **Environment Variables**, add:
   - `MONGO_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`)
   - `JWT_SECRET`: Any secure random secret string
4. Click **Deploy**. Vercel will automatically build the frontend and deploy the backend API as serverless endpoints (`/api/*`).

---

## License

This project is open source and available under the [MIT License](LICENSE).

