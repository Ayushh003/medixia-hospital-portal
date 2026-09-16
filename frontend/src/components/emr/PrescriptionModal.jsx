import React, { useState } from 'react';
import Modal from '../common/Modal';
import api from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { Plus, Trash2, Stethoscope, HeartPulse, Pill, CheckCircle2 } from 'lucide-react';

const PrescriptionModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const { showToast } = useNotification();

  const [chiefComplaint, setChiefComplaint] = useState(appointment?.reason || '');
  const [symptomsInput, setSymptomsInput] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [diagnosis, setDiagnosis] = useState('');

  // Vitals
  const [vitals, setVitals] = useState({
    bloodPressure: '120/80 mmHg',
    pulseRate: '72 bpm',
    temperature: '98.6 °F',
    respiratoryRate: '16 breaths/min',
    spO2: '99%',
    weightKg: '70 kg',
  });

  // Prescriptions list
  const [prescriptions, setPrescriptions] = useState([
    { medicineName: '', dosage: '500 mg', frequency: '1-0-1 (Twice daily)', duration: '5 days', instructions: 'Take post meal' },
  ]);

  const [labTestsInput, setLabTestsInput] = useState('');
  const [labTests, setLabTests] = useState([]);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Add medicine row
  const handleAddMedicine = () => {
    setPrescriptions([
      ...prescriptions,
      { medicineName: '', dosage: '500 mg', frequency: '1-0-1 (Twice daily)', duration: '5 days', instructions: 'Take post meal' },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  // Add symptom tag
  const handleAddSymptom = (e) => {
    if (e.key === 'Enter' && symptomsInput.trim()) {
      e.preventDefault();
      if (!symptoms.includes(symptomsInput.trim())) {
        setSymptoms([...symptoms, symptomsInput.trim()]);
      }
      setSymptomsInput('');
    }
  };

  const handleRemoveSymptom = (s) => {
    setSymptoms(symptoms.filter((item) => item !== s));
  };

  // Add lab test tag
  const handleAddLabTest = (e) => {
    if (e.key === 'Enter' && labTestsInput.trim()) {
      e.preventDefault();
      if (!labTests.includes(labTestsInput.trim())) {
        setLabTests([...labTests, labTestsInput.trim()]);
      }
      setLabTestsInput('');
    }
  };

  const handleRemoveLabTest = (t) => {
    setLabTests(labTests.filter((item) => item !== t));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chiefComplaint || !diagnosis) {
      showToast('Chief complaint and clinical diagnosis are required.', 'error');
      return;
    }

    // Filter valid medicines
    const validPrescriptions = prescriptions.filter((p) => p.medicineName.trim() !== '');

    setSubmitting(true);
    try {
      const payload = {
        appointmentId: appointment._id,
        chiefComplaint,
        symptoms,
        diagnosis,
        vitals,
        prescriptions: validPrescriptions,
        labTestsRecommended: labTests,
        doctorNotes,
        followUpDate: followUpDate || null,
      };

      const res = await api.post('/emr', payload);
      if (res.data.success) {
        showToast('Clinical EMR record & prescription published successfully!');
        if (onSuccess) onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create medical record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Medical Record & Prescription"
      subtitle={`Patient: ${appointment?.patient?.name || 'Patient'} • Ref: ${appointment?.appointmentNumber}`}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Vitals Bar */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <HeartPulse className="w-4 h-4 text-rose-500" />
            <span>Clinical Vitals Screening</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">BP (mmHg)</label>
              <input
                type="text"
                value={vitals.bloodPressure}
                onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                className="w-full text-xs rounded-md border border-slate-200 px-2.5 py-1.5 bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">Pulse Rate</label>
              <input
                type="text"
                value={vitals.pulseRate}
                onChange={(e) => setVitals({ ...vitals, pulseRate: e.target.value })}
                className="w-full text-xs rounded-md border border-slate-200 px-2.5 py-1.5 bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">Temp (°F)</label>
              <input
                type="text"
                value={vitals.temperature}
                onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                className="w-full text-xs rounded-md border border-slate-200 px-2.5 py-1.5 bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">Resp. Rate</label>
              <input
                type="text"
                value={vitals.respiratoryRate}
                onChange={(e) => setVitals({ ...vitals, respiratoryRate: e.target.value })}
                className="w-full text-xs rounded-md border border-slate-200 px-2.5 py-1.5 bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">SpO2</label>
              <input
                type="text"
                value={vitals.spO2}
                onChange={(e) => setVitals({ ...vitals, spO2: e.target.value })}
                className="w-full text-xs rounded-md border border-slate-200 px-2.5 py-1.5 bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">Weight (Kg)</label>
              <input
                type="text"
                value={vitals.weightKg}
                onChange={(e) => setVitals({ ...vitals, weightKg: e.target.value })}
                className="w-full text-xs rounded-md border border-slate-200 px-2.5 py-1.5 bg-white font-medium"
              />
            </div>
          </div>
        </div>

        {/* Complaints and Diagnosis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Chief Complaint *
            </label>
            <input
              type="text"
              required
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g. Sharp epigastric pain after eating"
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Clinical Diagnosis *
            </label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute Gastroduodenitis (ICD-K29.8)"
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Symptoms Tags */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Symptoms (Type and press Enter)
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-slate-200 bg-white min-h-[38px]">
            {symptoms.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200"
              >
                {s}
                <button
                  type="button"
                  onClick={() => handleRemoveSymptom(s)}
                  className="text-sky-400 hover:text-sky-700 ml-0.5"
                >
                  &times;
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder={symptoms.length === 0 ? "Type symptom and hit Enter (e.g. Nausea, Heartburn)..." : "Add more..."}
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
              onKeyDown={handleAddSymptom}
              className="text-xs border-none focus:outline-none flex-1 min-w-[140px] px-1 py-0.5"
            />
          </div>
        </div>

        {/* Structured Prescriptions Generator */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 uppercase tracking-wider">
              <Pill className="w-4 h-4 text-sky-600" />
              <span>Prescription Drugs (Rx)</span>
            </div>
            <button
              type="button"
              onClick={handleAddMedicine}
              className="flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Drug</span>
            </button>
          </div>

          <div className="p-3 space-y-3 max-h-60 overflow-y-auto">
            {prescriptions.map((p, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50/60 border border-slate-200/80 relative space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Item #{idx + 1}</span>
                  {prescriptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Medicine (e.g. Tab. Telma 40, Pan-D, Dolo 650)"
                      value={p.medicineName}
                      onChange={(e) => handleMedicineChange(idx, 'medicineName', e.target.value)}
                      className="w-full text-xs rounded-md border border-slate-200 px-2.5 py-1.5 bg-white font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Strength (e.g. 40 mg / 650 mg)"
                      value={p.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                      className="w-full text-xs rounded-md border border-slate-200 px-2.5 py-1.5 bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Duration (e.g. 15 days / 1 month)"
                      value={p.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                      className="w-full text-xs rounded-md border border-slate-200 px-2.5 py-1.5 bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Frequency (e.g. 1-0-1 After meals / Twice daily)"
                    value={p.frequency}
                    onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                    className="w-full text-xs rounded-md border border-slate-200 px-2.5 py-1.5 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Directions (e.g. Take with warm water / Empty stomach)"
                    value={p.instructions}
                    onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                    className="w-full text-xs rounded-md border border-slate-200 px-2.5 py-1.5 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnostic Lab Tests & Follow-Up */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Recommended Lab Tests (Enter to add)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-slate-200 bg-white min-h-[38px]">
              {labTests.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveLabTest(t)}
                    className="text-purple-400 hover:text-purple-700 ml-0.5"
                  >
                    &times;
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={labTests.length === 0 ? "e.g. CBC, H. pylori antigen..." : "Add more..."}
                value={labTestsInput}
                onChange={(e) => setLabTestsInput(e.target.value)}
                onKeyDown={handleAddLabTest}
                className="text-xs border-none focus:outline-none flex-1 min-w-[120px] px-1 py-0.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Follow-Up Review Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Doctor Advice / Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Clinical Notes & Dietary Advice
          </label>
          <textarea
            rows="2"
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            placeholder="Advice on lifestyle, dietary restrictions, emergency warning signs..."
            className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Submit action */}
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
            disabled={submitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{submitting ? 'Publishing Record...' : 'Finalize & Issue Prescription'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PrescriptionModal;
