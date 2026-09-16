import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorsManagement from './pages/admin/DoctorsManagement';
import DepartmentsManagement from './pages/admin/DepartmentsManagement';
import StaffManagement from './pages/admin/StaffManagement';
import AllAppointments from './pages/admin/AllAppointments';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorConsultations from './pages/doctor/DoctorConsultations';
import DoctorRecords from './pages/doctor/DoctorRecords';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointmentPage from './pages/patient/BookAppointmentPage';
import MyAppointmentsPage from './pages/patient/MyAppointmentsPage';
import MyRecordsPage from './pages/patient/MyRecordsPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';

// Receptionist Pages
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import WalkInRegistrationPage from './pages/receptionist/WalkInRegistrationPage';

// Root Route Redirector
const RootRedirect = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const homepages = {
    admin: '/admin',
    doctor: '/doctor',
    patient: '/patient',
    receptionist: '/receptionist',
  };

  return <Navigate to={homepages[role] || '/login'} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Root Dispatcher */}
            <Route path="/" element={<RootRedirect />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/doctors"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <DoctorsManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/departments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <DepartmentsManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <StaffManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <AllAppointments />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Doctor Routes */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DashboardLayout>
                    <DoctorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/consultations"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DashboardLayout>
                    <DoctorConsultations />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/records"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DashboardLayout>
                    <DoctorRecords />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Patient Routes */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <DashboardLayout>
                    <PatientDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/book"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <DashboardLayout>
                    <BookAppointmentPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/appointments"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <DashboardLayout>
                    <MyAppointmentsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/records"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <DashboardLayout>
                    <MyRecordsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/profile"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <DashboardLayout>
                    <PatientProfilePage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Receptionist Routes */}
            <Route
              path="/receptionist"
              element={
                <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
                  <DashboardLayout>
                    <ReceptionistDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionist/walk-in"
              element={
                <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
                  <DashboardLayout>
                    <WalkInRegistrationPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionist/appointments"
              element={
                <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
                  <DashboardLayout>
                    <AllAppointments />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
