import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Shield,
  Stethoscope,
  User,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  // Demo accounts for evaluation / testing
  const demoAccounts = [
    {
      role: 'Admin',
      name: 'Dr. Arvind Swaminathan (Director)',
      email: 'admin@medixia.com',
      password: 'admin123',
      icon: Shield,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      role: 'Doctor',
      name: 'Dr. Rajesh Sharma (Cardiologist)',
      email: 'rajesh.sharma@medixia.com',
      password: 'doctor123',
      icon: Stethoscope,
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    },
    {
      role: 'Receptionist',
      name: 'Priya Sharma (OPD Desk)',
      email: 'reception@medixia.com',
      password: 'reception123',
      icon: Building2,
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    },
    {
      role: 'Patient',
      name: 'Rahul Verma (Patient)',
      email: 'rahul.verma@gmail.com',
      password: 'patient123',
      icon: User,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
  ];

  const handleSelectDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      showToast(`Welcome, ${user.name}!`);

      // Redirect to role home
      const roleHomepages = {
        admin: '/admin',
        doctor: '/doctor',
        patient: '/patient',
        receptionist: '/receptionist',
      };
      const redirectPath = location.state?.from?.pathname || roleHomepages[user.role] || '/';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-600 text-white shadow-card mb-3">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            <path d="M12 5v14"/>
            <path d="M5 12h14"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Medixia General Hospital
        </h2>
        <p className="text-xs font-semibold text-sky-700 mt-0.5">
          Advanced Clinical Healthcare &bull; EMR Portal
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Sign in to access OPD desk, patient appointments, and medical records
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Quick test accounts */}
        <div className="mb-4 bg-slate-50 rounded-xl p-3 border border-slate-200">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700">Test Accounts</span>
            <span className="text-[11px] text-slate-400">Click to autofill</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleSelectDemo(acc)}
                className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-sky-500 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-xs font-medium text-center transition-colors shadow-2xs"
                title={`${acc.name} (${acc.email})`}
              >
                {acc.role}
              </button>
            ))}
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-slate-200/80 sm:px-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Hospital Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New patient seeking consultation?{' '}
              <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700">
                Register as Patient
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
