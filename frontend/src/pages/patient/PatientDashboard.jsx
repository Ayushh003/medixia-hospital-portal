import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BookingModal from '../../components/appointments/BookingModal';
import MedicalRecordViewer from '../../components/emr/MedicalRecordViewer';
import Modal from '../../components/common/Modal';
import {
  Calendar,
  Clock,
  FileText,
  Plus,
  Stethoscope,
  Heart,
  ShieldCheck,
  AlertCircle,
  Eye,
  Phone,
} from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const [aptRes, emrRes] = await Promise.all([
        api.get('/appointments'),
        api.get(`/emr/patient/${user._id}`),
      ]);

      if (aptRes.data.success) setAppointments(aptRes.data.data);
      if (emrRes.data.success) setMedicalRecords(emrRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [user]);

  // Find next upcoming appointment
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingAppointments = appointments.filter(
    (a) => a.appointmentDate >= todayStr && a.status === 'Scheduled'
  );
  const nextAppointment = upcomingAppointments[0] || null;

  const handleCancelAppointment = async (aptId) => {
    if (!window.confirm('Are you sure you wish to cancel this scheduled appointment?')) return;
    try {
      const res = await api.put(`/appointments/${aptId}/status`, {
        status: 'Cancelled',
        cancelReason: 'Cancelled by patient via portal',
      });
      if (res.data.success) {
        showToast('Appointment cancelled successfully. Slot freed.');
        fetchPatientData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel appointment', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Patient Portal &bull; {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Patient ID: <span className="font-mono font-bold text-slate-700">{user?.profile?.patientId || 'PAT-ESTABLISHED'}</span> &bull; Blood Group: <span className="font-semibold text-rose-700">{user?.profile?.bloodGroup || 'O+'}</span>
          </p>
        </div>
        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Upcoming Consultations"
          value={upcomingAppointments.length}
          subtitle="Scheduled & Confirmed"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Past Visits"
          value={appointments.filter((a) => a.status === 'Completed').length}
          subtitle="Completed Appointments"
          icon={Clock}
          color="green"
        />
        <StatCard
          title="Digital Prescriptions"
          value={medicalRecords.length}
          subtitle="Official EMR Records"
          icon={FileText}
          color="purple"
        />
      </div>

      {/* Next Appointment Card & Allergies Notice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Scheduled Appointment */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-subtle p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>Next Upcoming Consultation</span>
            </h3>
            {nextAppointment && (
              <Badge variant={nextAppointment.status}>{nextAppointment.status}</Badge>
            )}
          </div>

          {loading ? (
            <LoadingSpinner message="Checking schedule..." />
          ) : !nextAppointment ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No upcoming appointments scheduled.</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Need to see a doctor? Book an interactive appointment slot online.
              </p>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule Now</span>
              </button>
            </div>
          ) : (
            <div className="p-4 bg-sky-50/40 rounded-xl border border-sky-100 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Dr. {nextAppointment.doctor?.name}</h4>
                    <p className="text-xs text-sky-700 font-medium mt-0.5">
                      {nextAppointment.department?.name} Specialist
                    </p>
                  </div>
                  <span className="font-mono text-xs text-slate-500 font-semibold">
                    Ref: {nextAppointment.appointmentNumber}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-600" />
                    <span><strong>Date:</strong> {nextAppointment.appointmentDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600" />
                    <span><strong>Slot:</strong> {nextAppointment.timeSlot}</span>
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700 block text-[11px]">Reason for Visit:</span>
                  <p>{nextAppointment.reason}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Fee: <strong>₹{nextAppointment.consultationFee || 0}</strong> ({nextAppointment.paymentStatus})
                </span>
                <button
                  type="button"
                  onClick={() => handleCancelAppointment(nextAppointment._id)}
                  className="px-3 py-1 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  Cancel Appointment
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Patient Health ID Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Patient Health Card</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                VERIFIED
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Full Name:</span>
                <span className="font-semibold">{user?.name}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Blood Group:</span>
                <span className="font-bold text-rose-700">{user?.profile?.bloodGroup || 'O+'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Primary Phone:</span>
                <span>{user?.phone || 'Not recorded'}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-1">Reported Allergies:</span>
                {user?.profile?.allergies?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {user.profile.allergies.map((a) => (
                      <span key={a} className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                        {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-[11px]">None reported</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <Link to="/patient/profile" className="text-xs text-sky-600 hover:text-sky-800 font-semibold">
              Edit Medical Demographics &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Medical Records and Prescriptions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-purple-600" />
            <span>My Issued Medical Records & Prescriptions</span>
          </h3>
          <Link to="/patient/records" className="text-xs text-sky-600 hover:text-sky-800 font-medium">
            View All ({medicalRecords.length})
          </Link>
        </div>

        {medicalRecords.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No medical records published yet. Once a doctor completes your consultation, digital prescriptions will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicalRecords.slice(0, 3).map((rec) => (
              <div
                key={rec._id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-semibold text-[11px] text-slate-400">{rec.recordNumber}</span>
                    <span className="text-[11px] text-slate-500">{new Date(rec.visitDate).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{rec.diagnosis}</h4>
                  <p className="text-[11px] text-slate-600 mt-1">Attending: Dr. {rec.doctor?.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Prescription: {rec.prescriptions?.length || 0} medication(s) prescribed
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRecord(rec);
                      setIsViewerOpen(true);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-800"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Prescription</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          fetchPatientData();
        }}
      />

      {/* Record Viewer Modal */}
      {selectedRecord && (
        <Modal
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setSelectedRecord(null);
          }}
          title="Digital Prescription & Consultation Record"
          subtitle="Official St. Jude EMR report"
          maxWidth="max-w-4xl"
        >
          <MedicalRecordViewer record={selectedRecord} onClose={() => setIsViewerOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default PatientDashboard;
