import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PrescriptionModal from '../../components/emr/PrescriptionModal';
import Modal from '../../components/common/Modal';
import {
  Calendar,
  Clock,
  User,
  Activity,
  FileText,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ChevronRight,
  ClipboardCheck,
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

  // Patient History Inspection modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [patientHistory, setPatientHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchDoctorAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments');
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.appointmentDate === todayStr);
  const scheduledCount = todayAppointments.filter((a) => a.status === 'Scheduled').length;
  const completedCount = todayAppointments.filter((a) => a.status === 'Completed').length;
  const inProgressCount = todayAppointments.filter((a) => a.status === 'In-Progress').length;

  const handleStartConsultation = async (apt) => {
    try {
      if (apt.status === 'Scheduled') {
        await api.put(`/appointments/${apt._id}/status`, { status: 'In-Progress' });
        showToast('Consultation session started (Status: In-Progress)');
        fetchDoctorAppointments();
      }
      setSelectedAppointment(apt);
      setIsPrescriptionModalOpen(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to start consultation', 'error');
    }
  };

  const handleViewPatientHistory = async (patientId) => {
    setHistoryLoading(true);
    setHistoryModalOpen(true);
    try {
      const res = await api.get(`/patients/${patientId}`);
      if (res.data.success) {
        setPatientHistory(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load patient history', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Consultation Desk &bull; Dr. {user?.name?.replace('Dr. ', '')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Specialist Clinic: {user?.profile?.department?.name || 'Department'} ({user?.profile?.roomNumber || 'OPD Desk'})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span>Today: {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Today's Total Queue"
          value={todayAppointments.length}
          subtitle="Registered for consultation"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Waiting / Scheduled"
          value={scheduledCount}
          subtitle="Ready for intake"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="In Consultation"
          value={inProgressCount}
          subtitle="Currently with doctor"
          icon={Stethoscope}
          color="purple"
        />
        <StatCard
          title="Completed Today"
          value={completedCount}
          subtitle="Prescriptions published"
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* Today's Queue Desk */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Today's Live Patient Consultation Queue ({todayAppointments.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Ordered chronologically</span>
        </div>

        {loading ? (
          <LoadingSpinner message="Querying live patient queue..." />
        ) : todayAppointments.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200">
            <Stethoscope className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No scheduled consultations for today</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Appointments booked by patients or front desk will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="text-slate-500 text-left">
                <tr>
                  <th className="pb-2.5 font-semibold">Slot Time</th>
                  <th className="pb-2.5 font-semibold">Patient Name</th>
                  <th className="pb-2.5 font-semibold">Contact</th>
                  <th className="pb-2.5 font-semibold">Chief Complaint / Reason</th>
                  <th className="pb-2.5 font-semibold">Status</th>
                  <th className="pb-2.5 text-right font-semibold">Clinical Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayAppointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-semibold text-slate-800">
                      <span className="px-2 py-1 bg-sky-50 text-sky-700 rounded border border-sky-100 font-mono">
                        {apt.timeSlot}
                      </span>
                    </td>
                    <td className="py-3">
                      <p className="font-bold text-slate-900">{apt.patient?.name}</p>
                      <button
                        type="button"
                        onClick={() => handleViewPatientHistory(apt.patient?._id)}
                        className="text-[11px] text-sky-600 hover:text-sky-800 font-medium underline inline-block mt-0.5"
                      >
                        View History & Allergies
                      </button>
                    </td>
                    <td className="py-3 text-slate-600">
                      {apt.patient?.phone || apt.patient?.email}
                    </td>
                    <td className="py-3 text-slate-700 max-w-[240px] truncate" title={apt.reason}>
                      {apt.reason}
                    </td>
                    <td className="py-3">
                      <Badge variant={apt.status}>{apt.status}</Badge>
                    </td>
                    <td className="py-3 text-right">
                      {apt.status === 'Completed' ? (
                        <span className="text-emerald-700 text-[11px] font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Prescription Issued</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartConsultation(apt)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
                        >
                          {apt.status === 'In-Progress' ? 'Resume Consultation (Rx)' : 'Consult & Prescribe'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* All Upcoming & Recent Appointments for Doctor */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            All Assigned Appointments ({appointments.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead className="text-slate-500 text-left">
              <tr>
                <th className="pb-2 font-semibold">Ref #</th>
                <th className="pb-2 font-semibold">Date</th>
                <th className="pb-2 font-semibold">Time Slot</th>
                <th className="pb-2 font-semibold">Patient</th>
                <th className="pb-2 font-semibold">Reason</th>
                <th className="pb-2 font-semibold">Status</th>
                <th className="pb-2 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.slice(0, 10).map((apt) => (
                <tr key={apt._id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 font-mono text-slate-500">{apt.appointmentNumber}</td>
                  <td className="py-2.5 font-medium text-slate-800">{apt.appointmentDate}</td>
                  <td className="py-2.5 text-slate-600 font-mono">{apt.timeSlot}</td>
                  <td className="py-2.5 font-semibold text-slate-900">{apt.patient?.name}</td>
                  <td className="py-2.5 text-slate-600 max-w-[200px] truncate">{apt.reason}</td>
                  <td className="py-2.5">
                    <Badge variant={apt.status}>{apt.status}</Badge>
                  </td>
                  <td className="py-2.5 text-right">
                    {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleStartConsultation(apt)}
                        className="text-xs text-sky-600 hover:text-sky-800 font-medium"
                      >
                        Consult
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prescription & EMR Creation Modal */}
      {selectedAppointment && (
        <PrescriptionModal
          isOpen={isPrescriptionModalOpen}
          onClose={() => {
            setIsPrescriptionModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onSuccess={() => {
            fetchDoctorAppointments();
          }}
        />
      )}

      {/* Patient Clinical History Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => {
          setHistoryModalOpen(false);
          setPatientHistory(null);
        }}
        title="Patient Medical Profile & EMR History"
        subtitle={patientHistory?.patient?.name ? `File: ${patientHistory.patient.name} (${patientHistory.profile?.patientId || 'ID'})` : 'Loading profile...'}
        maxWidth="max-w-2xl"
      >
        {historyLoading ? (
          <LoadingSpinner size="sm" message="Loading medical file..." />
        ) : patientHistory ? (
          <div className="space-y-4 text-xs">
            {/* Allergies & Blood Group Banner */}
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-rose-900 block">Known Allergies:</span>
                <span className="text-rose-700 font-medium">
                  {patientHistory.profile?.allergies?.length > 0
                    ? patientHistory.profile.allergies.join(', ')
                    : 'No known drug allergies reported.'}
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-rose-900 block">Blood Group:</span>
                <span className="px-2 py-0.5 rounded bg-white text-rose-800 font-bold border border-rose-200">
                  {patientHistory.profile?.bloodGroup || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Chronic Conditions & Notes */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="font-semibold text-slate-700 block">Chronic Conditions & Baseline Notes:</span>
              <p className="text-slate-600">
                {patientHistory.profile?.medicalHistoryNotes || 'No ongoing chronic conditions recorded.'}
              </p>
            </div>

            {/* Prior Consultation Summaries */}
            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-700 mb-2">
                Prior Visits & Diagnoses ({patientHistory.medicalRecords?.length || 0})
              </h4>
              {patientHistory.medicalRecords?.length === 0 ? (
                <p className="text-slate-400 italic">No previous EMR records on file.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {patientHistory.medicalRecords.map((rec) => (
                    <div key={rec._id} className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-slate-900">{rec.diagnosis}</span>
                        <span className="text-slate-400 text-[11px]">{new Date(rec.visitDate).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-500">Complaint: {rec.chiefComplaint}</p>
                      <p className="text-sky-700 font-medium text-[11px]">Attending: Dr. {rec.doctor?.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
