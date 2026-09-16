import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Clock, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const SlotPicker = ({ doctorId, date, selectedSlot, onSelectSlot }) => {
  const [loading, setLoading] = useState(false);
  const [slotsData, setSlotsData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!doctorId || !date) {
      setSlotsData(null);
      return;
    }

    const fetchSlots = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/appointments/slots?doctorId=${doctorId}&date=${date}`);
        if (res.data.success) {
          setSlotsData(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch doctor slot availability.');
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [doctorId, date]);

  if (!doctorId || !date) {
    return (
      <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">
          Select a doctor and preferred appointment date to preview available consultation slots.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-8">
        <LoadingSpinner size="sm" message="Querying live doctor calendar & checking slot conflicts..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
        <span>{error}</span>
      </div>
    );
  }

  if (slotsData && !slotsData.isDoctorAvailableDay && slotsData.message) {
    return (
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900">Doctor Not Available On This Day</p>
          <p className="mt-0.5">{slotsData.message}</p>
        </div>
      </div>
    );
  }

  const slots = slotsData?.slots || [];

  if (slots.length === 0) {
    return (
      <div className="p-4 text-center border border-slate-200 rounded-xl bg-slate-50 text-xs text-slate-500">
        No consultation slots available on this date.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          <span>Available Consultation Slots ({slotsData.availableSlotsCount} open)</span>
        </label>
        <span className="text-[11px] text-slate-400">Strict real-time reservation</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {slots.map(({ slot, isAvailable }) => {
          const isSelected = selectedSlot === slot;

          if (!isAvailable) {
            return (
              <button
                key={slot}
                type="button"
                disabled
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-between opacity-60"
                title="This slot is already reserved"
              >
                <span>{slot}</span>
                <span className="text-[10px] uppercase font-bold text-rose-400">Booked</span>
              </button>
            );
          }

          return (
            <button
              key={slot}
              type="button"
              onClick={() => onSelectSlot(slot)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all flex items-center justify-between ${
                isSelected
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm ring-2 ring-sky-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-sky-50/50'
              }`}
            >
              <span>{slot}</span>
              <span className={`text-[10px] font-semibold ${isSelected ? 'text-sky-100' : 'text-emerald-600'}`}>
                Open
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SlotPicker;
