import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import { Building2, Plus, Users, HeartPulse, Brain, Baby, Bone, Stethoscope } from 'lucide-react';

const DepartmentsManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useNotification();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/departments', { name, code, description });
      if (res.data.success) {
        showToast('Clinical Department added successfully');
        setIsModalOpen(false);
        setName('');
        setCode('');
        setDescription('');
        fetchDepartments();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create department', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getDeptIcon = (deptName) => {
    const lower = deptName.toLowerCase();
    if (lower.includes('cardio')) return HeartPulse;
    if (lower.includes('neuro')) return Brain;
    if (lower.includes('pediat')) return Baby;
    if (lower.includes('ortho')) return Bone;
    return Stethoscope;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Departments & Centers</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage hospital medical units, specialty codes, and leadership
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Department</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading departments..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => {
            const Icon = getDeptIcon(dept.name);
            return (
              <div
                key={dept._id}
                className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{dept.name}</h3>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {dept.code}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                      Active Unit
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {dept.description || 'Specialized clinical care and diagnostic facilities.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs flex items-center justify-between text-slate-500">
                  <span>Head Physician:</span>
                  <span className="font-semibold text-slate-800">
                    {dept.headDoctor?.name || 'Assigned via Admin'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Clinical Department"
        subtitle="Establish a new medical wing or specialty division."
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Department Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Oncology & Hematology"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Department Code (Unique 3-4 letters) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ONCO"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white uppercase font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Clinical Description
            </label>
            <textarea
              rows="3"
              placeholder="Primary treatments, surgical procedures, and specialty care provided..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              {submitting ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentsManagement;
