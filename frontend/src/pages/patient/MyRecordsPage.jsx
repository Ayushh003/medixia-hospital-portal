import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MedicalRecordViewer from '../../components/emr/MedicalRecordViewer';
import Modal from '../../components/common/Modal';
import { FileText, Eye, Activity, Calendar, Stethoscope } from 'lucide-react';

const MyRecordsPage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/emr/patient/${user._id}`);
        if (res.data.success) {
          setRecords(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchRecords();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Electronic Medical Records & Prescriptions</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Access your complete clinical consultation notes, prescribed medications, and vitals
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving your clinical files..." />
      ) : records.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">No medical records or prescriptions found</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Once you attend a consultation with a hospital specialist, your official EMR summary will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {records.map((rec) => (
            <div
              key={rec._id}
              className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 flex flex-col justify-between hover:shadow-card transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-400">{rec.recordNumber}</span>
                  <span className="text-[11px] text-slate-500">{new Date(rec.visitDate).toLocaleDateString()}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{rec.diagnosis}</h3>
                <p className="text-xs text-sky-700 font-medium mt-0.5">
                  Attending: Dr. {rec.doctor?.name}
                </p>

                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700 block text-[11px]">Chief Complaint:</span>
                  <p className="line-clamp-2">{rec.chiefComplaint}</p>
                </div>

                {rec.vitals && (
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span>BP: <strong>{rec.vitals.bloodPressure || 'N/A'}</strong></span>
                    <span>Pulse: <strong>{rec.vitals.pulseRate || 'N/A'}</strong></span>
                    <span>SpO2: <strong>{rec.vitals.spO2 || 'N/A'}</strong></span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">
                  {rec.prescriptions?.length || 0} Prescribed Med(s)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRecord(rec);
                    setIsViewerOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Prescription</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Viewer Modal */}
      {selectedRecord && (
        <Modal
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setSelectedRecord(null);
          }}
          title="Digital Prescription & Consultation Record"
          subtitle="Official St. Jude EMR report"
          maxWidth="max-w-4xl"
        >
          <MedicalRecordViewer record={selectedRecord} onClose={() => setIsViewerOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default MyRecordsPage;
