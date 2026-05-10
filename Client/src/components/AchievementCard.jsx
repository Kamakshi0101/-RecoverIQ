import React, { forwardRef } from 'react';
import { Star, Trophy, Heart, Shield, Bolt, Activity } from 'lucide-react';

const ICONS = {
  mobility: Star,
  strength: Bolt,
  daily_task: Heart,
  pain: Shield,
  endurance: Trophy,
  star: Star,
};

const AchievementCard = forwardRef(({ badge, milestone, patientName }, ref) => {
  if (!badge || !milestone) return null;

  const Icon = ICONS[badge.badge_icon] || Star;

  return (
    <div 
      ref={ref}
      className="bg-[#FDFBF7] border border-[#E7D9C9] p-8 w-[400px] h-[500px] flex flex-col justify-between items-center text-center relative overflow-hidden"
      style={{
        boxShadow: '0 20px 40px rgba(45, 106, 79, 0.05)',
        fontFamily: 'serif'
      }}
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#8BA888] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#2D6A4F] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      {/* Header */}
      <div className="z-10 w-full pt-4">
        <div className="flex justify-center items-center space-x-2 text-[#8BA888] mb-2">
          <Activity size={18} />
          <span className="text-xs font-sans font-semibold tracking-widest uppercase">RecoverIQ</span>
        </div>
        <h2 className="text-sm font-sans text-[#5F6B63] tracking-wide uppercase mt-6">
          {patientName}'s Journey
        </h2>
      </div>

      {/* Center content */}
      <div className="z-10 flex flex-col items-center flex-1 justify-center w-full">
        <div 
          className="w-28 h-28 rounded-full flex items-center justify-center mb-8 relative shadow-lg"
          style={{ backgroundColor: badge.badge_color || '#8BA888' }}
        >
          {/* Subtle inner glow */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.4)]"></div>
          <Icon size={48} className="text-white drop-shadow-md" />
        </div>

        <h1 className="text-3xl font-bold text-[#2A3B2C] mb-3 leading-tight font-serif px-4">
          {badge.badge_name}
        </h1>
        
        <p className="text-[#5F6B63] text-base font-sans font-medium px-6 leading-relaxed">
          Completed: {milestone.title}
        </p>
      </div>

      {/* Footer */}
      <div className="z-10 w-full pb-4 border-t border-[#E7D9C9]/50 pt-6">
        <p className="text-[#8BA888] font-serif italic text-lg">
          "Every step forward is a victory."
        </p>
      </div>
    </div>
  );
});

export default AchievementCard;
