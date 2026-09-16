import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BookingModal from '../../components/appointments/BookingModal';
import { useNotification } from '../../context/NotificationContext';
import {
  Users,
  Calendar,
  UserPlus,
  Clock,
  CheckCircle2,
  Stethoscope,
  Search,
  Filter,
  Activity,
  Plus,
} from 'lucide-react';

const ReceptionistDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { showToast } = useNotification();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aptRes, docRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/doctors'),
      ]);

      if (aptRes.data.success) setAppointments(aptRes.data.data);
      if (docRes.data.success) setDoctors(docRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.appointmentDate === todayStr);

  const handleCheckIn = async (aptId) => {
    try {
      const res = await api.put(`/appointments/${aptId}/status`, { status: 'In-Progress' });
      if (res.data.success) {
        showToast('Patient checked in and moved to doctor queue!');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Check-in failed', 'error');
    }
  };

  const filtered = todayAppointments.filter((apt) => {
    const s = search.toLowerCase();
    return (
      apt.appointmentNumber.toLowerCase().includes(s) ||
      apt.patient?.name.toLowerCase().includes(s) ||
      apt.doctor?.name.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hospital Reception & Front Desk</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Live patient check-in counter, walk-in intake, and doctor OPD room queue management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/receptionist/walk-in"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Walk-In Patient</span>
          </Link>
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Today's Total Queue"
          value={todayAppointments.length}
          subtitle="All Scheduled Visits"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Awaiting Check-in"
          value={todayAppointments.filter((a) => a.status === 'Scheduled').length}
          subtitle="Patients in lobby"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Currently with Doctor"
          value={todayAppointments.filter((a) => a.status === 'In-Progress').length}
          subtitle="In consultation room"
          icon={Stethoscope}
          color="purple"
        />
        <StatCard
          title="Completed Consults"
          value={todayAppointments.filter((a) => a.status === 'Completed').length}
          subtitle="Checked out today"
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* Active OPD Doctors Room Roster */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-sky-600" />
            <span>Active OPD Physician Chambers ({doctors.length})</span>
          </h3>
          <span className="text-[11px] text-slate-400">Current Clinic Rooms</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {doctors.map((doc) => (
            <div key={doc._id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">{doc.user?.name}</span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-sky-100 text-sky-800 rounded">
                  {doc.roomNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{doc.department?.name}</p>
              <p className="text-[10px] text-emerald-700 font-medium mt-1">Available: {doc.workingHours?.start} - {doc.workingHours?.end}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Front Desk Patient Check-In Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-sky-600" />
            <span>Live Patient Check-In & Arrivals Desk</span>
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search today's queue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Querying live arrivals..." />
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No appointments scheduled for today</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Use the Walk-in Registration button for immediate patient intake.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="text-slate-500 text-left">
                <tr>
                  <th className="pb-2.5 font-semibold">Slot Time</th>
                  <th className="pb-2.5 font-semibold">Ref #</th>
                  <th className="pb-2.5 font-semibold">Patient Name</th>
                  <th className="pb-2.5 font-semibold">Attending Doctor</th>
                  <th className="pb-2.5 font-semibold">Clinic Room</th>
                  <th className="pb-2.5 font-semibold">Status</th>
                  <th className="pb-2.5 text-right font-semibold">Check-in Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-semibold text-slate-800 font-mono">
                      {apt.timeSlot}
                    </td>
                    <td className="py-3 font-mono text-slate-500">
                      {apt.appointmentNumber}
                    </td>
                    <td className="py-3">
                      <p className="font-bold text-slate-900">{apt.patient?.name}</p>
                      <span className="text-[11px] text-slate-400">{apt.patient?.phone}</span>
                    </td>
                    <td className="py-3 text-slate-700">
                      Dr. {apt.doctor?.name}
                    </td>
                    <td className="py-3 font-mono text-slate-600">
                      {apt.department?.code} &bull; Room 101
                    </td>
                    <td className="py-3">
                      <Badge variant={apt.status}>{apt.status}</Badge>
                    </td>
                    <td className="py-3 text-right">
                      {apt.status === 'Scheduled' && (
                        <button
                          onClick={() => handleCheckIn(apt._id)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
                        >
                          Check In Patient
                        </button>
                      )}
                      {apt.status === 'In-Progress' && (
                        <span className="text-amber-700 font-medium text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          In Chamber
                        </span>
                      )}
                      {apt.status === 'Completed' && (
                        <span className="text-emerald-700 font-medium text-[11px] flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Departed</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          fetchData();
        }}
      />
    </div>
  );
};

export default ReceptionistDashboard;
