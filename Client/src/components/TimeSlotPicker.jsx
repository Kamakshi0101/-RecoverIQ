import React from 'react';
import { Clock } from 'lucide-react';

const TimeSlotPicker = ({ slots, onSelect, selectedSlotId }) => {
  if (!slots || slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-800/20 border border-dashed border-gray-700 rounded-xl text-gray-400">
        <Clock size={24} className="mb-2 opacity-50" />
        <p className="text-sm">No available slots for this date.</p>
      </div>
    );
  }

  const formatTime = (timeStr) => {
    // "09:00:00" -> "9:00 AM"
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {slots.map(slot => {
        const isSelected = selectedSlotId === slot.id;
        
        return (
          <button
            key={slot.id}
            type="button"
            onClick={() => onSelect(slot)}
            className={`
              flex items-center justify-center py-3 px-4 rounded-xl border text-sm font-medium transition-all
              ${isSelected 
                ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                : 'bg-gray-800/50 border-white/10 text-gray-300 hover:border-indigo-400/50 hover:bg-gray-800'
              }
            `}
          >
            {formatTime(slot.slot_time)}
          </button>
        );
      })}
    </div>
  );
};

export default TimeSlotPicker;
