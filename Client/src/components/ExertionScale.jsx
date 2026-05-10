import React from 'react';
import { motion } from 'framer-motion';

const ExertionScale = ({ value, onChange }) => {
  // RPE Scale 1-10
  const points = [
    { val: 1, label: 'Rest', color: '#E7D9C9' },
    { val: 2, label: '', color: '#DCE6D8' },
    { val: 3, label: 'Light', color: '#8BA888' },
    { val: 4, label: '', color: '#7A9A77' },
    { val: 5, label: 'Moderate', color: '#5C8A5C' },
    { val: 6, label: '', color: '#4D7A4D' },
    { val: 7, label: 'Hard', color: '#2D6A4F' },
    { val: 8, label: '', color: '#1B4332' },
    { val: 9, label: '', color: '#143024' },
    { val: 10, label: 'Max', color: '#0A1812' },
  ];

  const activePoint = points.find(p => p.val === value);

  return (
    <div className="w-full bg-[#FDFBF7] p-8 rounded-3xl border border-[#E7D9C9] shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h3 className="text-sm uppercase tracking-widest font-bold text-[#8BA888] mb-1">RPE Level</h3>
          <p className="text-3xl font-serif font-bold text-[#2A3B2C]">{value} <span className="text-[#5F6B63] text-lg font-sans">/ 10</span></p>
        </div>
        <div className="text-right">
          <motion.div 
            key={value}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-serif font-bold text-[#2D6A4F]"
          >
            {activePoint?.label || 'Active'}
          </motion.div>
        </div>
      </div>

      <div className="relative">
        {/* Background Track */}
        <div className="absolute top-1/2 left-0 w-full h-3 -translate-y-1/2 bg-[#E7D9C9]/50 rounded-full overflow-hidden flex">
          {/* Fill based on value */}
          <motion.div 
            className="h-full bg-gradient-to-r from-[#8BA888] to-[#2D6A4F]"
            animate={{ width: `${(value / 10) * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>
        
        {/* Invisible range input for accessibility and dragging */}
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full absolute top-1/2 -translate-y-1/2 opacity-0 cursor-pointer h-12 z-20"
        />

        {/* Visual points */}
        <div className="flex justify-between relative z-10 pointer-events-none px-[2px]">
          {points.map((p) => {
            const isActive = value >= p.val;
            const isSelected = value === p.val;
            
            return (
              <div key={p.val} className="flex flex-col items-center">
                <motion.div 
                  animate={{ 
                    scale: isSelected ? 1.5 : 1,
                    backgroundColor: isActive ? p.color : '#FFFFFF',
                    borderColor: isActive ? 'transparent' : '#E7D9C9'
                  }}
                  className={`w-4 h-4 rounded-full border-2 shadow-sm transition-colors duration-300 ${isSelected ? 'ring-4 ring-white shadow-md z-20' : ''}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between mt-6 px-1">
        <span className="text-xs font-medium text-[#5F6B63]">Resting</span>
        <span className="text-xs font-medium text-[#5F6B63]">Max Effort</span>
      </div>
    </div>
  );
};

export default ExertionScale;
