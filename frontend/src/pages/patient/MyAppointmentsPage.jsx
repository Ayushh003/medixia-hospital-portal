import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import { Calendar, Clock, Stethoscope, Plus, AlertCircle, XCircle } from 'lucide-react';

const MyAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  const fetchAppointments = async () => {
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
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    const reason = window.prompt('Please enter the reason for cancellation:');
    if (reason === null) return; // User pressed Cancel on prompt

    try {
      const res = await api.put(`/appointments/${id}/status`, {
        status: 'Cancelled',
        cancelReason: reason || 'Cancelled by patient',
      });
      if (res.data.success) {
        showToast('Appointment cancelled successfully.');
        fetchAppointments();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel appointment', 'error');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Consultation Appointments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            History of your clinical visits, upcoming bookings, and appointment status
          </p>
        </div>
        <Link
          to="/patient/book"
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your appointments..." />
      ) : appointments.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">No appointments scheduled</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            You currently have no past or active appointment bookings.
          </p>
          <Link
            to="/patient/book"
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule First Appointment</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Ref #</th>
                  <th className="px-4 py-3 text-left font-semibold">Doctor & Department</th>
                  <th className="px-4 py-3 text-left font-semibold">Date & Reserved Slot</th>
                  <th className="px-4 py-3 text-left font-semibold">Chief Reason</th>
                  <th className="px-4 py-3 text-left font-semibold">Fee Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {appointments.map((apt) => {
                  const isUpcoming =
                    apt.status === 'Scheduled' && apt.appointmentDate >= todayStr;

                  return (
                    <tr key={apt._id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono font-medium text-slate-800">
                        {apt.appointmentNumber}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">Dr. {apt.doctor?.name}</p>
                        <span className="text-[11px] text-sky-600 font-medium">
                          {apt.department?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <p className="font-medium">{apt.appointmentDate}</p>
                        <span className="text-[11px] text-slate-500 font-mono">{apt.timeSlot}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate" title={apt.reason}>
                        {apt.reason}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-slate-800">
                          ₹{apt.consultationFee || 0}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{apt.paymentStatus}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={apt.status}>{apt.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isUpcoming && (
                          <button
                            onClick={() => handleCancel(apt._id)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-medium hover:underline"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointmentsPage;
