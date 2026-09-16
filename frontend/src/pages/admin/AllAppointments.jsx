import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Calendar, Search, Filter, Clock, Stethoscope, User, AlertCircle } from 'lucide-react';

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let url = '/appointments';
      if (statusFilter) url += `?status=${statusFilter}`;
      const res = await api.get(url);
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
  }, [statusFilter]);

  const filteredAppointments = appointments.filter((apt) => {
    const s = search.toLowerCase();
    return (
      apt.appointmentNumber.toLowerCase().includes(s) ||
      apt.patient?.name.toLowerCase().includes(s) ||
      apt.doctor?.name.toLowerCase().includes(s) ||
      apt.department?.name.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Central Appointment Schedule</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit and monitor clinical reservations across all departments in real time
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-subtle">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by patient, doctor, department, or appointment ref #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      {loading ? (
        <LoadingSpinner message="Querying master schedule..." />
      ) : filteredAppointments.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-500">No appointments found matching this criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Ref #</th>
                  <th className="px-4 py-3 text-left font-semibold">Patient</th>
                  <th className="px-4 py-3 text-left font-semibold">Doctor & Department</th>
                  <th className="px-4 py-3 text-left font-semibold">Date & Reserved Slot</th>
                  <th className="px-4 py-3 text-left font-semibold">Chief Reason</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredAppointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-medium text-slate-800">
                      {apt.appointmentNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{apt.patient?.name}</p>
                      <p className="text-[11px] text-slate-400">{apt.patient?.phone || apt.patient?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">Dr. {apt.doctor?.name}</p>
                      <span className="text-[11px] text-sky-600 font-medium">{apt.department?.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <p className="font-medium">{apt.appointmentDate}</p>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{apt.timeSlot}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate" title={apt.reason}>
                      {apt.reason}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={apt.status}>{apt.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAppointments;
