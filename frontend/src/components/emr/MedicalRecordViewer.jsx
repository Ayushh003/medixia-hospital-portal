import React from 'react';
import { Calendar, User, FileText, Pill, Activity, ShieldCheck, Heart } from 'lucide-react';
import Badge from '../common/Badge';

const MedicalRecordViewer = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
      {/* Top action toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <FileText className="w-4 h-4 text-sky-600" />
          <span>Electronic Medical Record &bull; {record.recordNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-medium transition-colors"
            >
              Close Record
            </button>
          )}
        </div>
      </div>

      {/* Printable Clinical Sheet Container */}
      <div id="printable-prescription" className="p-8 max-w-4xl mx-auto bg-white">
        {/* Hospital Letterhead Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-base">
                +
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                MEDIXIA GENERAL HOSPITAL
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sector 18, Institutional Area, New Delhi - 110001 &bull; Helpline: +91 (011) 2658-8500 &bull; NABH & NABL Accredited
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 text-xs font-bold rounded bg-slate-100 text-slate-800 border border-slate-200">
              OFFICIAL EMR
            </span>
            <p className="text-xs font-semibold text-slate-900 mt-1">{record.recordNumber}</p>
            <p className="text-[11px] text-slate-500">
              Date: {new Date(record.visitDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Patient & Doctor Meta Grid */}
        <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              PATIENT INFORMATION
            </span>
            <p className="text-sm font-bold text-slate-900">{record.patient?.name || 'Patient'}</p>
            <p className="text-slate-600 mt-0.5">
              Contact: {record.patient?.phone || 'N/A'} &bull; Gender: <span className="capitalize">{record.patient?.gender || 'Unspecified'}</span>
            </p>
            <p className="text-slate-600 mt-0.5">
              Appointment Ref: <span className="font-semibold">{record.appointment?.appointmentNumber || 'N/A'}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              ATTENDING CONSULTANT
            </span>
            <p className="text-sm font-bold text-slate-900">Dr. {record.doctor?.name || 'Physician'}</p>
            <p className="text-slate-600 mt-0.5">
              Department: <span className="font-medium">{record.appointment?.department?.name || 'General Medicine'}</span>
            </p>
            <p className="text-slate-500 mt-0.5">{record.doctor?.email || ''}</p>
          </div>
        </div>

        {/* Clinical Vitals Section */}
        {record.vitals && (
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              <span>Vitals & Clinical Measurements</span>
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-3 bg-white border border-slate-200 rounded-lg text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">BP</span>
                <span className="font-semibold text-slate-800">{record.vitals.bloodPressure || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Pulse</span>
                <span className="font-semibold text-slate-800">{record.vitals.pulseRate || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Temp</span>
                <span className="font-semibold text-slate-800">{record.vitals.temperature || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Resp. Rate</span>
                <span className="font-semibold text-slate-800">{record.vitals.respiratoryRate || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">SpO2</span>
                <span className="font-semibold text-slate-800">{record.vitals.spO2 || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Weight</span>
                <span className="font-semibold text-slate-800">{record.vitals.weightKg || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Chief Complaint & Diagnosis */}
        <div className="mb-6 space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
              Chief Complaint
            </span>
            <p className="text-slate-800 font-medium">{record.chiefComplaint}</p>
          </div>

          <div className="p-3 bg-sky-50/50 rounded-lg border border-sky-200">
            <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block mb-0.5">
              Clinical Assessment & Diagnosis
            </span>
            <p className="text-slate-900 font-semibold text-sm">{record.diagnosis}</p>
          </div>
        </div>

        {/* Symptoms Observed */}
        {record.symptoms && record.symptoms.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Symptoms Reported / Observed
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {record.symptoms.map((symp, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {symp}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Prescribed Medications (Rx) */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-serif italic font-bold text-slate-900">Rx</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Prescribed Medications & Posology
            </h4>
          </div>

          {record.prescriptions && record.prescriptions.length > 0 ? (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">#</th>
                    <th className="px-3 py-2 text-left font-semibold">Medicine</th>
                    <th className="px-3 py-2 text-left font-semibold">Strength</th>
                    <th className="px-3 py-2 text-left font-semibold">Frequency</th>
                    <th className="px-3 py-2 text-left font-semibold">Duration</th>
                    <th className="px-3 py-2 text-left font-semibold">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {record.prescriptions.map((med, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">{med.medicineName}</td>
                      <td className="px-3 py-2.5 text-slate-700">{med.dosage}</td>
                      <td className="px-3 py-2.5 font-medium text-sky-700">{med.frequency}</td>
                      <td className="px-3 py-2.5 text-slate-600">{med.duration}</td>
                      <td className="px-3 py-2.5 text-slate-500 italic">{med.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No prescription medications required for this consultation.</p>
          )}
        </div>

        {/* Diagnostic Lab Tests & Clinical Advice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
          {record.labTestsRecommended && record.labTestsRecommended.length > 0 && (
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Recommended Lab Investigations
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                {record.labTestsRecommended.map((test, idx) => (
                  <li key={idx}>{test}</li>
                ))}
              </ul>
            </div>
          )}

          {record.doctorNotes && (
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Doctor's Special Instructions
              </span>
              <p className="text-slate-700 leading-relaxed">{record.doctorNotes}</p>
            </div>
          )}
        </div>

        {/* Follow-up Date and Sign-off */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
          <div>
            {record.followUpDate && (
              <p className="text-slate-700">
                <strong>Recommended Follow-up:</strong> {new Date(record.followUpDate).toLocaleDateString()}
              </p>
            )}
            <p className="text-slate-400 text-[11px] mt-1">
              Digitally verified &bull; Valid without physical signature under EMR regulations.
            </p>
          </div>

          <div className="text-center">
            <div className="w-36 h-10 border-b border-slate-400 flex items-end justify-center pb-1">
              <span className="text-[11px] font-serif italic text-sky-800 font-bold">
                Dr. {record.doctor?.name?.split(' ').slice(-1)[0] || 'Physician'}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-700 mt-1">
              Dr. {record.doctor?.name?.replace('Dr. ', '') || 'Physician'}
            </p>
            <p className="text-[10px] text-slate-400">Reg. Medical Practitioner &bull; Delhi Medical Council</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordViewer;
