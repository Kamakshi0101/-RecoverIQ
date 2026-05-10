import React, { useEffect, useState, useRef } from 'react';
import { X, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import AchievementCard from './AchievementCard';
import { useAuth } from '../context/AuthContext';

const ConfettiCelebration = ({ milestone, badge, onDismiss }) => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (!badge || !milestone) return null;

  // Generate elegant sage green and gold CSS particles
  const particles = Array.from({ length: 40 }).map((_, i) => {
    const left = Math.random() * 100;
    const animationDuration = 2 + Math.random() * 3;
    const animationDelay = Math.random() * 1.5;
    const colors = ['#8BA888', '#DCE6D8', '#CBB26A', '#E7D9C9']; // Sage, light sage, soft gold, cream
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 6 + Math.random() * 8;
    const isCircle = Math.random() > 0.5;
    
    return (
      <div 
        key={i}
        className={`absolute top-[-10%] ${isCircle ? 'rounded-full' : 'rounded-sm'}`}
        style={{
          left: `${left}%`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          opacity: 0.8,
          animation: `therapeutic-fall ${animationDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${animationDelay}s forwards`,
          transform: `rotate(${Math.random() * 360}deg)`
        }}
      />
    );
  });

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // higher resolution
        backgroundColor: '#FDFBF7',
        logging: false,
        useCORS: true
      });
      
      const image = canvas.toDataURL("image/png");
      
      const link = document.createElement('a');
      link.href = image;
      link.download = `RecoverIQ-Achievement-${badge.badge_name.replace(/\s+/g, '-')}.png`;
      link.click();
      
    } catch (err) {
      console.error('Error generating image', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-700 ${show ? 'opacity-100' : 'opacity-0'}`}>
      {/* Blurred cream overlay */}
      <div 
        className="absolute inset-0 bg-[#FDFBF7]/80 backdrop-blur-md cursor-pointer transition-all duration-700" 
        onClick={onDismiss}
      />
      
      {/* Confetti container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes therapeutic-fall {
            0% { transform: translateY(0vh) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
          }
          @keyframes gentle-pop {
            0% { transform: scale(0.95) translateY(10px); opacity: 0; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
        `}} />
      </div>

      {/* Main Content Area */}
      <div 
        className="relative flex flex-col items-center"
        style={{ animation: 'gentle-pop 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <button 
          onClick={onDismiss}
          className="absolute -top-12 right-0 text-[#8BA888] hover:text-[#2A3B2C] transition-colors p-2 bg-white rounded-full shadow-sm"
        >
          <X size={20} />
        </button>

        {/* The Card Component to be rendered and captured */}
        <div className="shadow-2xl rounded-sm overflow-hidden border border-[#E7D9C9]/50 transition-transform duration-500 hover:scale-[1.02]">
          <AchievementCard 
            ref={cardRef} 
            badge={badge} 
            milestone={milestone} 
            patientName={user?.name?.split(' ')[0] || 'Patient'} 
          />
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center space-y-4">
          <button 
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center space-x-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-8 py-3.5 rounded-full font-serif text-lg tracking-wide shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-wait"
          >
            {isExporting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download size={20} />
            )}
            <span>{isExporting ? 'Generating...' : 'Save Achievement'}</span>
          </button>
          
          <button 
            onClick={onDismiss}
            className="text-[#5F6B63] hover:text-[#2A3B2C] font-sans text-sm font-medium transition-colors"
          >
            Continue Journey
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfettiCelebration;
