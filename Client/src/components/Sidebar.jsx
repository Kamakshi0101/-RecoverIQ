import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Activity, Dumbbell, Flag, Users } from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const isPatient = user?.role === 'patient';

  const patientLinks = [
    { to: '/patient/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { to: '/patient/progress', icon: <Activity />, label: 'My Progress' },
    { to: '/patient/exercises', icon: <Dumbbell />, label: 'Exercises' },
    { to: '/patient/milestones', icon: <Flag />, label: 'Milestones' },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { to: '/doctor/patients', icon: <Users />, label: 'My Patients' },
  ];

  const links = isPatient ? patientLinks : doctorLinks;

  return (
    <aside className="fixed left-0 top-16 z-20 h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-white dark:border-white/10 dark:bg-[#0f1117] transition-colors hidden md:block">
      <div className="flex h-full flex-col px-3 py-6">
        <nav className="flex-1 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                }`
              }
            >
              <div className="mr-3 h-5 w-5 shrink-0">{link.icon}</div>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
