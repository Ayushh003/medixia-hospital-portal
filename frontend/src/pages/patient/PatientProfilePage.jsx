import React, { useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { User, Phone, Shield, Heart, MapPin, AlertCircle, Save } from 'lucide-react';

const PatientProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useNotification();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [gender, setGender] = useState(user?.gender || 'unspecified');
  const [bloodGroup, setBloodGroup] = useState(user?.profile?.bloodGroup || 'Unknown');
  const [street, setStreet] = useState(user?.profile?.address?.street || '');
  const [city, setCity] = useState(user?.profile?.address?.city || '');
  const [emergencyName, setEmergencyName] = useState(user?.profile?.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.profile?.emergencyContact?.phone || '');
  const [allergiesInput, setAllergiesInput] = useState(user?.profile?.allergies?.join(', ') || '');
  const [notes, setNotes] = useState(user?.profile?.medicalHistoryNotes || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const allergies = allergiesInput
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      const payload = {
        name,
        phone,
        gender,
        bloodGroup,
        address: { street, city },
        emergencyContact: { name: emergencyName, phone: emergencyPhone },
        allergies,
        medicalHistoryNotes: notes,
      };

      const res = await api.put('/auth/profile', payload);
      if (res.data.success) {
        updateUser(res.data.user);
        showToast('Medical profile updated successfully');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Patient Clinical Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Maintain your personal health record, critical drug allergies, and emergency notification contacts
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Registered Email (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Biological Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
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
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-rose-700"
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

          {/* Allergies & Notes */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Known Drug / Environmental Allergies (Comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Penicillin, Sulfa, Latex, Peanuts"
              value={allergiesInput}
              onChange={(e) => setAllergiesInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-rose-700 font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Physicians will be automatically alerted to these allergies during prescription creation.
            </p>
          </div>

          {/* Address & Emergency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                City / Location
              </label>
              <input
                type="text"
                placeholder="e.g. Springfield, IL"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Emergency Contact & Phone
              </label>
              <input
                type="text"
                placeholder="e.g. Martha Wilson (+1 555-9988)"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Personal Medical History / Chronic Conditions
            </label>
            <textarea
              rows="2"
              placeholder="History of hypertension, asthma, diabetes, prior surgeries..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientProfilePage;
