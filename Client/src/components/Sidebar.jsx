import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Activity, Dumbbell, Flag, Users, BarChart3, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const { user } = useAuth();
  const isPatient = user?.role === 'patient';

  const patientLinks = [
    { to: '/patient/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { to: '/patient/progress', icon: <Activity />, label: 'Progress' },
    { to: '/patient/exercise-logger', icon: <Dumbbell />, label: 'Exercise Logger' },
    { to: '/patient/milestones', icon: <Flag />, label: 'Milestones' },
    { to: '/patient/calendar', icon: <CalendarIcon />, label: 'Calendar' },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { to: '/doctor/patients', icon: <Users />, label: 'Patients' },
    { to: '/doctor/appointments', icon: <CalendarIcon />, label: 'Appointments' },
    { to: '/doctor/availability', icon: <Clock />, label: 'Availability' },
  ];

  const links = isPatient ? patientLinks : doctorLinks;

  return (
    <motion.aside 
      className="fixed left-0 top-24 z-20 h-[calc(100vh-6rem)] w-64 hidden lg:flex flex-col px-6 py-8"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <nav className="flex-1 space-y-1">
        {links.map((link, index) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `group relative flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-[#2D6A4F]/10 to-[#DCE6D8] text-[#2D6A4F] border-l-4 border-[#2D6A4F]'
                  : 'text-[#5F6B63] hover:bg-[#F5F1EA] hover:text-[#233127]'
              }`
            }
          >
            <motion.div 
              className="h-5 w-5 shrink-0"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {link.icon}
            </motion.div>
            <span className="font-medium tracking-wide">{link.label}</span>
            <motion.div 
              className={`absolute right-0 top-1/2 -translate-y-1/2 h-1 w-1 rounded-full bg-[#2D6A4F] opacity-0 group-hover:opacity-100 transition-opacity`}
              layoutId="indicator"
            />
          </NavLink>
        ))}
      </nav>

      {/* Footer Info */}
      <motion.div 
        className="border-t border-[#E7D9C9]/30 pt-6 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-xs text-[#5F6B63] leading-relaxed font-serif">
          {isPatient ? 'Track your recovery journey with precision and care.' : 'Manage patient progress with insight and compassion.'}
        </p>
      </motion.div>
    </motion.aside>
  );
}
