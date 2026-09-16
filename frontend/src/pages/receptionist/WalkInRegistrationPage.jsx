import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import BookingModal from '../../components/appointments/BookingModal';
import { UserPlus, User, Phone, Mail, Heart, Calendar, CheckCircle, ArrowRight } from 'lucide-react';

const WalkInRegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'unspecified',
    bloodGroup: 'Unknown',
    dateOfBirth: '',
    city: '',
    emergencyName: '',
    emergencyPhone: '',
  });

  const [loading, setLoading] = useState(false);
  const [newlyCreatedPatient, setNewlyCreatedPatient] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        dateOfBirth: formData.dateOfBirth || null,
        address: { city: formData.city },
        emergencyContact: { name: formData.emergencyName, phone: formData.emergencyPhone },
      };

      const res = await api.post('/patients/walk-in', payload);
      if (res.data.success) {
        showToast(`Walk-in patient ${formData.name} registered successfully!`);
        setNewlyCreatedPatient(res.data.data.user);
        setIsBookingModalOpen(true);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Walk-in registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Front Desk Walk-In Patient Intake</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Fast-track registration for non-prebooked patients arriving directly at the hospital reception
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Patient Full Name *
              </label>
              <input
                type="text"
                required
                name="name"
                placeholder="e.g. Ramesh Verma / Sunita Rao"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Primary Phone Number *
              </label>
              <input
                type="tel"
                required
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Patient Email (Optional)
              </label>
              <input
                type="email"
                name="email"
                placeholder="ramesh.verma@gmail.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Biological Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="unspecified">Unspecified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Blood Group
              </label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Unknown">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                City / Locality
              </label>
              <input
                type="text"
                name="city"
                placeholder="e.g. New Delhi / Noida / Gurugram"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Emergency Contact (Name & Phone)
              </label>
              <input
                type="text"
                name="emergencyName"
                placeholder="e.g. Priya Verma (+91 98112 34567)"
                value={formData.emergencyName}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/receptionist')}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creating Record...' : 'Register & Assign Consultation Slot'}</span>
            </button>
          </div>
        </form>
      </div>

      {newlyCreatedPatient && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            navigate('/receptionist');
          }}
          onSuccess={() => {
            navigate('/receptionist');
          }}
        />
      )}
    </div>
  );
};

export default WalkInRegistrationPage;
