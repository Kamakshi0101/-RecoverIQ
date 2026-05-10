import React from 'react';
import { Star, ThumbsUp, Minus, Moon, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';

const MoodPicker = ({ value, onChange }) => {
  const options = [
    { id: 'great', label: 'Great', icon: Star, activeColor: '#8BA888' },
    { id: 'good', label: 'Good', icon: ThumbsUp, activeColor: '#5C8A5C' },
    { id: 'neutral', label: 'Neutral', icon: Minus, activeColor: '#5F6B63' },
    { id: 'tired', label: 'Tired', icon: Moon, activeColor: '#E3B062' },
    { id: 'struggling', label: 'Struggling', icon: AlertOctagon, activeColor: '#C97A7E' },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.id;
        
        return (
          <motion.button
            key={opt.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-full border transition-all duration-300 shadow-sm
              ${isActive 
                ? 'text-white border-transparent' 
                : 'bg-white border-[#E7D9C9] text-[#5F6B63] hover:bg-[#FDFBF7] hover:border-[#8BA888]/50'
              }
            `}
            style={{
              backgroundColor: isActive ? opt.activeColor : undefined,
              boxShadow: isActive ? `0 8px 20px ${opt.activeColor}40` : undefined,
            }}
          >
            <Icon size={18} className={isActive ? 'text-white' : 'text-[#A0AAB2]'} />
            <span className="font-medium">{opt.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default MoodPicker;
