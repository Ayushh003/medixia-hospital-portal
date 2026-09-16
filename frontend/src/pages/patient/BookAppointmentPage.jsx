import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import SlotPicker from '../../components/appointments/SlotPicker';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import {
  Calendar,
  Clock,
  Stethoscope,
  Building2,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';

const BookAppointmentPage = () => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
  const [selectedSlot, setSelectedSlot] = useState('');
  const [type, setType] = useState('Consultation');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { showToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const [depRes, docRes] = await Promise.all([
          api.get('/departments'),
          api.get('/doctors'),
        ]);

        if (depRes.data.success) {
          setDepartments(depRes.data.data);
          if (depRes.data.data.length > 0) {
            setSelectedDeptId(depRes.data.data[0]._id);
          }
        }
        if (docRes.data.success) {
          setDoctors(docRes.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const departmentDoctors = doctors.filter(
    (d) => !selectedDeptId || d.department?._id === selectedDeptId
  );

  useEffect(() => {
    if (departmentDoctors.length > 0 && (!selectedDoctor || !departmentDoctors.some(d => d._id === selectedDoctor._id))) {
      setSelectedDoctor(departmentDoctors[0]);
      setSelectedSlot('');
    }
  }, [selectedDeptId, departmentDoctors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) {
      setErrorMessage('Please choose an attending physician.');
      return;
    }
    if (!selectedSlot) {
      setErrorMessage('Please choose an open consultation time slot from the live scheduler.');
      return;
    }
    if (!reason.trim()) {
      setErrorMessage('Please enter your primary reason or symptoms for the appointment.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        doctorId: selectedDoctor.user?._id || selectedDoctor._id,
        departmentId: selectedDoctor.department?._id || selectedDeptId,
        appointmentDate,
        timeSlot: selectedSlot,
        type,
        reason,
        notes,
      };

      const res = await api.post('/appointments', payload);
      if (res.data.success) {
        showToast('Appointment reserved and email confirmation sent!');
        navigate('/patient/appointments');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Slot collision occurred. Please choose another slot.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  if (loading) {
    return <LoadingSpinner message="Loading hospital departments & specialist schedules..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Interactive Appointment Booking</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Select a clinical department, choose an available specialist, and reserve a verified slot with zero double-booking
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Department Navigation Pills */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-sky-600" />
          <span>Step 1: Select Clinical Specialty Department</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {departments.map((dept) => {
            const isSelected = selectedDeptId === dept._id;
            return (
              <button
                key={dept._id}
                type="button"
                onClick={() => {
                  setSelectedDeptId(dept._id);
                  setSelectedSlot('');
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-sky-50/50'
                }`}
              >
                {dept.name} ({dept.code})
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Choose Specialist in Selected Department */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Stethoscope className="w-4 h-4 text-sky-600" />
          <span>Step 2: Choose Attending Specialist ({departmentDoctors.length} available)</span>
        </label>

        {departmentDoctors.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No doctors currently registered in this department.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departmentDoctors.map((doc) => {
              const isSelected = selectedDoctor?._id === doc._id;
              return (
                <div
                  key={doc._id}
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setSelectedSlot('');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/40 ring-2 ring-sky-200 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100/60 border border-sky-200 flex items-center justify-center font-bold text-sky-700 text-xs">
                      {doc.user?.name ? doc.user.name.replace('Dr. ', '').slice(0, 2).toUpperCase() : 'DR'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{doc.user?.name}</h4>
                      <p className="text-[11px] text-sky-700 font-medium">{doc.specialization}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Days: {doc.availableDays?.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900">₹{doc.consultationFee}</span>
                    <span className="text-[10px] text-slate-400 block">{doc.roomNumber}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 3: Pick Date & Slot */}
      {selectedDoctor && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle space-y-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>Step 3: Select Date & Available Time Slot</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Consultation Date *</label>
                <input
                  type="date"
                  min={todayStr}
                  value={appointmentDate}
                  onChange={(e) => {
                    setAppointmentDate(e.target.value);
                    setSelectedSlot('');
                  }}
                  required
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Visit Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Consultation">New Consultation</option>
                  <option value="Follow-up">Follow-up Visit</option>
                  <option value="Routine Checkup">Routine Physical Checkup</option>
                  <option value="Emergency">Urgent Clinical Review</option>
                </select>
              </div>
            </div>

            {/* Live slot picker */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <SlotPicker
                doctorId={selectedDoctor.user?._id || selectedDoctor._id}
                date={appointmentDate}
                selectedSlot={selectedSlot}
                onSelectSlot={(slot) => {
                  setSelectedSlot(slot);
                  setErrorMessage('');
                }}
              />
            </div>

            {/* Reason & Notes */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Reason for Visit / Primary Symptoms *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharp pain in chest on breathing, fever for 3 days..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Patient Notes for Doctor (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Mention previous medications or allergies..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Submission Banner */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-subtle flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500">Consultation Fee:</span>
              <p className="text-base font-bold text-slate-900">
                ₹{selectedDoctor.consultationFee} <span className="text-xs font-normal text-slate-500">(Payable at clinic desk)</span>
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting || !selectedSlot}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Reserving...' : 'Confirm & Reserve Slot'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookAppointmentPage;
