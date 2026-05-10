import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Video, MapPin, CheckCircle, Bell, VideoIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const UpcomingSessionWidget = ({ appointment }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!appointment) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const sessionDate = new Date(appointment.scheduled_at);
      const diff = sessionDate - now;

      if (diff <= 0) return 'Session started';

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / 1000 / 60) % 60);

      if (days > 0) return `In ${days} day${days > 1 ? 's' : ''}`;
      if (hours > 0) return `In ${hours}h ${mins}m`;
      return `In ${mins} mins`;
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
    return () => clearInterval(interval);
  }, [appointment]);

  if (!appointment) {
    return (
      <div className="bg-[#FDFBF7] p-8 rounded-3xl border border-[#E7D9C9] shadow-sm flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
          <Calendar size={28} className="text-[#A0AAB2]" />
        </div>
        <h3 className="text-xl font-serif font-bold text-[#2A3B2C] mb-2">No Upcoming Sessions</h3>
        <p className="text-[#5F6B63] text-sm max-w-xs mb-6">Schedule your next rehabilitation appointment to stay on track.</p>
        <button className="bg-[#2D6A4F] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#1B4332] transition-colors">
          Book Appointment
        </button>
      </div>
    );
  }

  const d = new Date(appointment.scheduled_at);
  const isVirtual = appointment.location === 'Virtual';

  return (
    <div className="bg-[#2D6A4F] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#1B4332] rounded-full mix-blend-multiply opacity-50 -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center mb-3">
              <Clock size={12} className="mr-1.5" /> {timeLeft}
            </div>
            <h2 className="text-3xl font-serif font-bold leading-tight">Next Therapy<br/>Session</h2>
          </div>
          <div className="text-right">
            <p className="text-3xl font-serif font-bold">{d.toLocaleDateString('en-US', { day: 'numeric' })}</p>
            <p className="text-[#DCE6D8] font-medium uppercase text-sm tracking-wider">{d.toLocaleDateString('en-US', { month: 'short' })}</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3 text-[#DCE6D8]">
            <Calendar size={18} className="opacity-80" />
            <span className="font-medium">{d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} ({appointment.duration_minutes} min)</span>
          </div>
          <div className="flex items-center space-x-3 text-[#DCE6D8]">
            {isVirtual ? <Video size={18} className="opacity-80" /> : <MapPin size={18} className="opacity-80" />}
            <span className="font-medium">{appointment.location || 'Clinic'}</span>
          </div>
          <div className="flex items-center space-x-3 text-[#DCE6D8]">
            <div className="w-5 h-5 bg-[#8BA888] rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {appointment.doctor_name?.charAt(0) || 'D'}
            </div>
            <span className="font-medium">Dr. {appointment.doctor_name}</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 mb-6 backdrop-blur-md border border-white/10">
          <p className="text-xs font-bold uppercase tracking-wider text-[#DCE6D8] mb-3">Preparation Checklist</p>
          <ul className="space-y-2">
            <li className="flex items-center text-sm text-white"><CheckCircle size={14} className="text-[#8BA888] mr-2" /> Complete daily exercises</li>
            <li className="flex items-center text-sm text-white"><CheckCircle size={14} className="text-[#8BA888] mr-2" /> Wear loose, comfortable clothing</li>
          </ul>
        </div>

        <div className="flex space-x-3">
          {isVirtual ? (
            <button className="flex-1 bg-white text-[#2D6A4F] py-3 rounded-xl font-bold flex justify-center items-center hover:bg-[#FDFBF7] transition-colors">
              <VideoIcon size={18} className="mr-2" /> Join Call
            </button>
          ) : (
            <button className="flex-1 bg-white text-[#2D6A4F] py-3 rounded-xl font-bold flex justify-center items-center hover:bg-[#FDFBF7] transition-colors">
              View Details
            </button>
          )}
          <button className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors" title="Reminder Settings">
            <Bell size={20} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingSessionWidget;
