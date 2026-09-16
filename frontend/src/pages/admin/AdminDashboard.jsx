import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  Stethoscope,
  Calendar,
  DollarSign,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  PlusCircle,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch admin metrics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Compiling executive clinical & operational metrics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hospital Operational Intelligence</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Executive oversight of doctors, departments, clinical appointments, and consultations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/doctors"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Manage Doctors</span>
          </Link>
          <Link
            to="/admin/departments"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Departments</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Doctors"
          value={stats?.totalDoctors || 0}
          subtitle="Practicing Specialists"
          icon={Stethoscope}
          color="blue"
        />
        <StatCard
          title="Registered Patients"
          value={stats?.totalPatients || 0}
          subtitle="Hospital EMR Profiles"
          icon={Users}
          color="green"
        />
        <StatCard
          title="Total Consultations"
          value={stats?.totalAppointments || 0}
          subtitle={`${stats?.todayAppointments || 0} scheduled today`}
          icon={Calendar}
          color="purple"
        />
        <StatCard
          title="OPD Collection (Revenue)"
          value={`₹${stats?.estimatedRevenue?.toLocaleString('en-IN') || 0}`}
          subtitle={`${stats?.completedAppointments || 0} completed consultations`}
          icon={DollarSign}
          color="amber"
        />
      </div>

      {/* Clinical Operations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Department Activity
            </h3>
            <Link to="/admin/departments" className="text-xs text-sky-600 hover:text-sky-800 font-medium">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.departmentBreakdown?.map((dep) => (
              <div
                key={dep._id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900">{dep.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Code: {dep.code}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800">{dep.appointmentCount}</span>
                  <span className="text-[10px] text-slate-400 block">consults</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Appointment Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-subtle p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Recent Consultations & Bookings
            </h3>
            <Link to="/admin/appointments" className="text-xs text-sky-600 hover:text-sky-800 font-medium">
              Browse All ({stats?.totalAppointments || 0})
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead>
                <tr className="text-slate-500 text-left">
                  <th className="pb-2 font-semibold">Ref #</th>
                  <th className="pb-2 font-semibold">Patient</th>
                  <th className="pb-2 font-semibold">Doctor</th>
                  <th className="pb-2 font-semibold">Date & Slot</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.recentAppointments?.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 font-mono text-slate-500">{apt.appointmentNumber}</td>
                    <td className="py-2.5 font-medium text-slate-900">{apt.patient?.name}</td>
                    <td className="py-2.5 text-slate-700">Dr. {apt.doctor?.name}</td>
                    <td className="py-2.5 text-slate-600">
                      <span>{apt.appointmentDate}</span>
                      <span className="text-[10px] text-slate-400 block">{apt.timeSlot}</span>
                    </td>
                    <td className="py-2.5">
                      <Badge variant={apt.status}>{apt.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
