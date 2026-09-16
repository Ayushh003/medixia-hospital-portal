import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import { Users, Shield, Stethoscope, Building2, Check, Ban } from 'lucide-react';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/staff');
      if (res.data.success) {
        setStaff(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleToggleStatus = async (user) => {
    try {
      const res = await api.put(`/admin/users/${user._id}/toggle-status`);
      if (res.data.success) {
        showToast(`Staff member status updated successfully`);
        fetchStaff();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hospital Personnel & Roles</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage system access, security roles, and user accounts for clinical staff
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching hospital staff roster..." />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Staff Member</th>
                  <th className="px-4 py-3 text-left font-semibold">Role</th>
                  <th className="px-4 py-3 text-left font-semibold">Contact</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {staff.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 uppercase">
                          {u.name.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={u.role}>{u.role.toUpperCase()}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {u.phone || 'N/A'}
                    </td>
                    <td className="px-4 py-3.5">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-medium">
                          <Ban className="w-3.5 h-3.5 text-rose-500" />
                          <span>Suspended</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1 text-[11px] font-semibold rounded-md border transition-colors ${
                          u.isActive
                            ? 'text-rose-700 border-rose-200 bg-rose-50 hover:bg-rose-100'
                            : 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {u.isActive ? 'Deactivate Access' : 'Activate Access'}
                      </button>
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

export default StaffManagement;
