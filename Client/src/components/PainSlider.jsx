import React from 'react';
import { AlertCircle, Frown, Meh, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PainSlider = ({ value, onChange }) => {
  
  const getTrackColor = (val) => {
    if (val <= 3) return 'from-[#8BA888] to-[#5C8A5C]'; // Green
    if (val <= 6) return 'from-[#E3B062] to-[#D08C3F]'; // Amber
    return 'from-[#C97A7E] to-[#A3434A]'; // Red
  };

  const isHighPain = value >= 7;

  return (
    <div className="w-full bg-[#FDFBF7] p-8 rounded-3xl border border-[#E7D9C9] shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h3 className="text-sm uppercase tracking-widest font-bold text-[#8BA888] mb-1">Pain Level</h3>
          <p className="text-3xl font-serif font-bold text-[#2A3B2C]">{value} <span className="text-[#5F6B63] text-lg font-sans">/ 10</span></p>
        </div>
        <div className="flex space-x-2 text-[#A0AAB2]">
          {value <= 3 ? <Smile size={28} className="text-[#8BA888]" /> :
           value <= 6 ? <Meh size={28} className="text-[#E3B062]" /> :
           <Frown size={28} className="text-[#C97A7E]" />}
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex-1 relative">
          {/* Custom Slider Track Background */}
          <div className="absolute top-1/2 left-0 w-full h-3 -translate-y-1/2 bg-[#E7D9C9]/50 rounded-full overflow-hidden">
            {/* Fill */}
            <motion.div 
              className={`h-full bg-gradient-to-r ${getTrackColor(value)}`}
              animate={{ width: `${(value / 10) * 100}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
          </div>
          
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full absolute top-1/2 -translate-y-1/2 opacity-0 cursor-pointer h-12 z-20"
          />
          
          {/* Custom Thumb - visual only */}
          <motion.div 
            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md border-2 pointer-events-none z-10"
            animate={{ left: `calc(${(value / 10) * 100}% - 12px)` }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{ 
              borderColor: value <= 3 ? '#8BA888' : value <= 6 ? '#E3B062' : '#C97A7E' 
            }}
          />
        </div>
      </div>

      <div className="flex justify-between mt-6 text-xs font-medium text-[#5F6B63] px-2">
        <span>No Pain</span>
        <span>Moderate</span>
        <span>Worst Pain</span>
      </div>

      <AnimatePresence>
        {isHighPain && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="bg-[#C97A7E]/10 border border-[#C97A7E]/20 rounded-2xl p-5 flex items-start space-x-4 overflow-hidden"
          >
            <AlertCircle className="text-[#A3434A] mt-0.5 shrink-0" size={24} />
            <div>
              <h4 className="text-[#A3434A] font-serif font-bold text-lg mb-1">High pain detected</h4>
              <p className="text-[#A3434A]/80 text-sm leading-relaxed">
                Please consider stopping this exercise and contacting your therapist if the pain persists. Your well-being is our top priority. You can still save this log.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PainSlider;
