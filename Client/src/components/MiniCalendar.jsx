import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MiniCalendar = ({ month, year, markedDates = [], onDaySelect, onMonthChange, selectedDate }) => {
  // markedDates array of { date: 'YYYY-MM-DD', status: 'confirmed'|'pending'|'cancelled' }
  
  const getDaysInMonth = (m, y) => new Date(y, m, 0).getDate();
  const getFirstDayOfMonth = (m, y) => new Date(y, m - 1, 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  
  // Adjust first day to start on Monday (1) to Sunday (7=0)
  const emptyDays = firstDay === 0 ? 6 : firstDay - 1; 

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrev = () => {
    if (month === 1) onMonthChange(12, year - 1);
    else onMonthChange(month - 1, year);
  };

  const handleNext = () => {
    if (month === 12) onMonthChange(1, year + 1);
    else onMonthChange(month + 1, year);
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const renderCells = () => {
    const cells = [];
    
    // Empty cells
    for (let i = 0; i < emptyDays; i++) {
      cells.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const isSelected = selectedDate === dateStr;
      
      const dayMarks = markedDates.filter(md => md.date === dateStr);
      
      cells.push(
        <div 
          key={d} 
          onClick={() => onDaySelect(dateStr)}
          className={`
            relative h-10 flex flex-col items-center justify-center cursor-pointer rounded-lg transition-colors
            ${isSelected ? 'bg-indigo-500 text-white font-bold' : 'hover:bg-gray-800 text-gray-300'}
            ${isToday && !isSelected ? 'text-indigo-400 font-bold border border-indigo-500/30' : ''}
          `}
        >
          <span className="text-sm">{d}</span>
          
          {/* Dots */}
          {dayMarks.length > 0 && (
            <div className="absolute bottom-1 flex space-x-0.5">
              {dayMarks.slice(0, 3).map((mark, idx) => {
                let bg = 'bg-gray-400';
                if (mark.status === 'confirmed') bg = 'bg-green-500';
                if (mark.status === 'pending') bg = 'bg-amber-500';
                if (mark.status === 'cancelled') bg = 'bg-red-500';
                return <div key={idx} className={`w-1 h-1 rounded-full ${bg}`}></div>;
              })}
            </div>
          )}
        </div>
      );
    }
    
    return cells;
  };

  return (
    <div className="bg-[#1a1d27] border border-white/5 rounded-xl p-4 w-full max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrev} className="p-1 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <span className="font-medium text-white">{monthNames[month - 1]} {year}</span>
        <button onClick={handleNext} className="p-1 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white">
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
          <div key={day} className="text-xs font-medium text-gray-500">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {renderCells()}
      </div>
    </div>
  );
};

export default MiniCalendar;
