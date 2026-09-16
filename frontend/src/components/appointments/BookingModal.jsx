import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import SlotPicker from './SlotPicker';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Calendar, User, Stethoscope, FileText, DollarSign, AlertTriangle } from 'lucide-react';

const BookingModal = ({ isOpen, onClose, onSuccess, initialDoctorId = '' }) => {
  const { role } = useAuth();
  const { showToast } = useNotification();

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
  });
  const [selectedSlot, setSelectedSlot] = useState('');
  const [type, setType] = useState('Consultation');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch doctors and patients (if receptionist/admin)
  useEffect(() => {
    if (!isOpen) return;

    const fetchPrerequisites = async () => {
      try {
        const docRes = await api.get('/doctors');
        if (docRes.data.success) {
          setDoctors(docRes.data.data);
          if (!selectedDoctorId && docRes.data.data.length > 0) {
            setSelectedDoctorId(docRes.data.data[0].user._id);
          }
        }

        if (role === 'admin' || role === 'receptionist') {
          const patRes = await api.get('/patients');
          if (patRes.data.success) {
            setPatients(patRes.data.data);
            if (patRes.data.data.length > 0) {
              setSelectedPatientId(patRes.data.data[0]._id);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching modal dependencies', err);
      }
    };

    fetchPrerequisites();
  }, [isOpen, role]);

  useEffect(() => {
    if (initialDoctorId) {
      setSelectedDoctorId(initialDoctorId);
    }
  }, [initialDoctorId]);

  // Reset selected slot when doctor or date changes
  const handleDoctorChange = (id) => {
    setSelectedDoctorId(id);
    setSelectedSlot('');
    setErrorMessage('');
  };

  const handleDateChange = (d) => {
    setAppointmentDate(d);
    setSelectedSlot('');
    setErrorMessage('');
  };

  const selectedDoctorObj = doctors.find(
    (d) => d.user?._id === selectedDoctorId || d._id === selectedDoctorId
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMessage('Please select an open consultation time slot.');
      return;
    }
    if (!reason.trim()) {
      setErrorMessage('Please provide the clinical reason for the appointment.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        doctorId: selectedDoctorId,
        appointmentDate,
        timeSlot: selectedSlot,
        type,
        reason,
        notes,
      };

      if (role === 'admin' || role === 'receptionist') {
        payload.patientId = selectedPatientId;
      }

      const res = await api.post('/appointments', payload);
      if (res.data.success) {
        showToast('Appointment confirmed and slot booked successfully!');
        if (onSuccess) onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to book appointment. The slot may have been concurrently reserved.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Min date is today
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Doctor Appointment"
      subtitle="Select a specialist, select consultation slot, and confirm booking."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Patient Selection for Receptionist / Admin */}
        {(role === 'admin' || role === 'receptionist') && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-600" />
              <span>Select Patient</span>
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.phone || p.email}) - {p.profile?.patientId || 'Patient'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Doctor and Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
              <span>Doctor / Specialist</span>
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => handleDoctorChange(e.target.value)}
              required
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {doctors.map((d) => (
                <option key={d._id} value={d.user?._id}>
                  {d.user?.name} - {d.specialization} ({d.department?.name || 'Department'})
                </option>
              ))}
            </select>
            {selectedDoctorObj && (
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>Fee: ₹{selectedDoctorObj.consultationFee}</span>
                <span>Chamber: {selectedDoctorObj.roomNumber}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>Appointment Date</span>
            </label>
            <input
              type="date"
              min={todayStr}
              value={appointmentDate}
              onChange={(e) => handleDateChange(e.target.value)}
              required
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Real-time interactive Slot Picker */}
        <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/70">
          <SlotPicker
            doctorId={selectedDoctorId}
            date={appointmentDate}
            selectedSlot={selectedSlot}
            onSelectSlot={(slot) => {
              setSelectedSlot(slot);
              setErrorMessage('');
            }}
          />
        </div>

        {/* Consultation Type & Reason */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Visit Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="Consultation">Consultation</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Routine Checkup">Routine Checkup</option>
              <option value="Emergency">Emergency Review</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" />
              <span>Chief Complaint / Reason *</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chest tightness, persistent migraine, pediatric checkup"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Additional Notes for Clinical Staff (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="Previous allergies, symptoms duration, or relevant details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Modal Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedSlot}
            className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
          >
            {submitting ? 'Reserving Slot...' : 'Confirm Appointment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BookingModal;
