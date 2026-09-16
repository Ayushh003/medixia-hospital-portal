import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  Building2,
  FileText,
  UserPlus,
  Clock,
  ShieldAlert,
  ClipboardList,
  UserCheck,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { role } = useAuth();

  const getNavLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Analytics & KPIs', to: '/admin', icon: LayoutDashboard },
          { name: 'Doctors & Specialties', to: '/admin/doctors', icon: Stethoscope },
          { name: 'Clinical Departments', to: '/admin/departments', icon: Building2 },
          { name: 'Staff Management', to: '/admin/staff', icon: Users },
          { name: 'All Appointments', to: '/admin/appointments', icon: Calendar },
        ];
      case 'doctor':
        return [
          { name: "Today's Schedule", to: '/doctor', icon: LayoutDashboard },
          { name: 'Patient Consultations', to: '/doctor/consultations', icon: UserCheck },
          { name: 'EMR & Prescriptions', to: '/doctor/records', icon: FileText },
        ];
      case 'patient':
        return [
          { name: 'My Health Portal', to: '/patient', icon: LayoutDashboard },
          { name: 'Book Appointment', to: '/patient/book', icon: Calendar },
          { name: 'My Appointments', to: '/patient/appointments', icon: Clock },
          { name: 'Prescriptions & Records', to: '/patient/records', icon: FileText },
          { name: 'Medical Profile', to: '/patient/profile', icon: ClipboardList },
        ];
      case 'receptionist':
        return [
          { name: 'Front Desk Overview', to: '/receptionist', icon: LayoutDashboard },
          { name: 'Walk-In Registration', to: '/receptionist/walk-in', icon: UserPlus },
          { name: 'Patient Appointments', to: '/receptionist/appointments', icon: Calendar },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden no-print"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out no-print ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between lg:hidden">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Navigation</span>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-5 overflow-y-auto space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {role ? `${role.toUpperCase()} PORTAL` : 'MENU'}
          </p>

          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin' || item.to === '/doctor' || item.to === '/patient' || item.to === '/receptionist'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-sky-600' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Hospital Helpline Banner */}
        <div className="p-3 m-3 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
          <p className="text-[11px] font-semibold text-slate-700">24/7 Medixia Helpline</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Emergency: 108 &bull; 011-26588500</p>
          <p className="text-[10px] text-sky-600 font-medium mt-1">NABH Accredited &bull; New Delhi</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
