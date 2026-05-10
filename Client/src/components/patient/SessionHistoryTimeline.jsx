import React from 'react';
import { FileText, Calendar, ChevronRight } from 'lucide-react';

const SessionHistoryTimeline = ({ appointments }) => {
  const pastAppointments = appointments
    .filter(a => a.status === 'completed' && a.session_notes)
    .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));

  if (pastAppointments.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-[#E7D9C9] rounded-3xl">
        <FileText size={32} className="mx-auto text-[#A0AAB2] mb-4" />
        <h3 className="text-lg font-serif font-bold text-[#2A3B2C] mb-2">No Clinical Notes Yet</h3>
        <p className="text-[#5F6B63] text-sm">Notes from your therapist will appear here 24 hours after each session.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pastAppointments.map((apt, index) => {
        const d = new Date(apt.scheduled_at);
        return (
          <div key={apt.id} className="relative pl-6 md:pl-8 border-l-2 border-[#E7D9C9]/60">
            {/* Timeline Dot */}
            <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-[#FDFBF7] border-[3px] border-[#8BA888]"></div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E7D9C9] hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#F5F1EA] text-[#5F6B63] p-2 rounded-lg">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2A3B2C]">{d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h4>
                    <p className="text-xs text-[#8BA888] font-bold uppercase tracking-wide">Dr. {apt.doctor_name}</p>
                  </div>
                </div>
                <button className="text-[#8BA888] opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="bg-[#FDFBF7] p-5 rounded-xl border border-[#E7D9C9]/50">
                <p className="text-[#5F6B63] leading-relaxed font-serif text-sm">
                  {apt.session_notes}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SessionHistoryTimeline;
