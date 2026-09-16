import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import {
  Stethoscope,
  Plus,
  Search,
  Building2,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
} from 'lucide-react';

const DoctorsManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useNotification();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: 'male',
    department: '',
    specialization: '',
    qualifications: 'MBBS, MD',
    experienceYears: 5,
    consultationFee: 75,
    roomNumber: 'OPD-105',
    bio: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, depRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/departments'),
      ]);

      if (docRes.data.success) setDoctors(docRes.data.data);
      if (depRes.data.success) {
        setDepartments(depRes.data.data);
        if (depRes.data.data.length > 0 && !formData.department) {
          setFormData((prev) => ({ ...prev, department: depRes.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Error fetching doctors data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/doctors', formData);
      if (res.data.success) {
        showToast('Doctor profile created successfully!');
        setIsModalOpen(false);
        fetchData();
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          gender: 'male',
          department: departments[0]?._id || '',
          specialization: '',
          qualifications: 'MBBS, MD',
          experienceYears: 5,
          consultationFee: 75,
          roomNumber: 'OPD-105',
          bio: '',
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create doctor', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.user?.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(search.toLowerCase()) ||
      doc.department?.name.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDept ? doc.department?._id === selectedDept : true;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Physicians & Specialists Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage hospital medical staff, departments, schedules, and clinical consultation fees
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-subtle">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search doctors by name, specialization, or clinic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
          />
        </div>
        <div className="sm:w-64">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
          >
            <option value="">All Departments</option>
            {departments.map((dep) => (
              <option key={dep._id} value={dep._id}>
                {dep.name} ({dep.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <LoadingSpinner message="Retrieving certified medical staff..." />
      ) : filteredDoctors.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <Stethoscope className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-500">No doctors match your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-xl border border-slate-200 shadow-subtle hover:shadow-card transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 font-bold text-sm">
                      {doc.user?.name ? doc.user.name.replace('Dr. ', '').slice(0, 2).toUpperCase() : 'DR'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{doc.user?.name}</h3>
                      <p className="text-xs text-sky-600 font-medium">{doc.specialization}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.department?.name} Department ({doc.roomNumber})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.availableDays?.join(', ') || 'Mon-Fri'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{doc.user?.email}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-3 line-clamp-2 italic">"{doc.bio}"</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Consult Fee</span>
                  <p className="font-bold text-slate-900">₹{doc.consultationFee}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Experience</span>
                  <p className="font-semibold text-slate-700">{doc.experienceYears} Years</p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {doc.qualifications}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Doctor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Hospital Physician"
        subtitle="Onboard a licensed doctor to an active clinical department."
      >
        <form onSubmit={handleCreateDoctor} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Doctor Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Dr. Rohan Mehra"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Official Hospital Email *
              </label>
              <input
                type="email"
                required
                placeholder="rohan.mehra@medixia.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Temporary Password *
              </label>
              <input
                type="password"
                required
                minLength="6"
                placeholder="min 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Department *
              </label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Specialization *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Consultant Physician"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Consultation Fee (₹ INR) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                OPD Room #
              </label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Professional Biography
            </label>
            <textarea
              rows="2"
              placeholder="Clinical experience, academic background, research interests..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Register Physician'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorsManagement;
