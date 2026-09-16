import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MedicalRecordViewer from '../../components/emr/MedicalRecordViewer';
import Modal from '../../components/common/Modal';
import { FileText, Eye, Calendar, User, Search, Activity } from 'lucide-react';

const DoctorRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // In our controller, getPatientRecords is for patient.
      // We can also fetch all appointments that are completed, or query /api/emr/:id
      const res = await api.get('/appointments?status=Completed');
      if (res.data.success) {
        // Find EMR records associated with these appointments
        const appointmentIds = res.data.data.map((a) => a._id);
        // We can fetch details on click or load
        setRecords(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleOpenRecord = async (appointment) => {
    try {
      // Fetch full appointment with details or patient history
      const res = await api.get(`/patients/${appointment.patient._id}`);
      if (res.data.success) {
        // Find record for this appointment
        const found = res.data.data.medicalRecords.find(
          (r) => r.appointment === appointment._id || r.appointment?._id === appointment._id
        );
        if (found) {
          setSelectedRecord(found);
          setIsViewerOpen(true);
        } else if (res.data.data.medicalRecords.length > 0) {
          setSelectedRecord(res.data.data.medicalRecords[0]);
          setIsViewerOpen(true);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = records.filter((apt) => {
    const s = search.toLowerCase();
    return (
      apt.appointmentNumber.toLowerCase().includes(s) ||
      apt.patient?.name.toLowerCase().includes(s) ||
      apt.reason.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Clinical EMR & Prescription Archive</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review past diagnoses, vitals readings, and pharmaceutical regimens issued by your clinic
        </p>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-subtle flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by patient name, ref number, or reason..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs border-none focus:outline-none"
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving clinical archive..." />
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-500">No completed consultations in archive.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((apt) => (
            <div
              key={apt._id}
              className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 flex flex-col justify-between hover:shadow-card transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400">{apt.appointmentNumber}</span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    Completed Visit
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{apt.patient?.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Date of Visit: {apt.appointmentDate} ({apt.timeSlot})
                </p>
                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700 block text-[11px]">Chief Complaint:</span>
                  <p className="line-clamp-2">{apt.reason}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleOpenRecord(apt)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-800"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View EMR Record</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal with MedicalRecordViewer */}
      {selectedRecord && (
        <Modal
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setSelectedRecord(null);
          }}
          title="Clinical Prescription & EMR Details"
          subtitle="Official consultation summary"
          maxWidth="max-w-4xl"
        >
          <MedicalRecordViewer record={selectedRecord} onClose={() => setIsViewerOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default DoctorRecords;
