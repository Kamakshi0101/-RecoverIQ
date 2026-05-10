import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const RecoveryTimer = ({ onStop, initialSeconds = 0 }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleToggle = () => {
    setIsRunning(!isRunning);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (onStop) {
      onStop(seconds);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // For the animated ring
  const radius = 60;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Let's pretend 60 seconds is a full circle, just for visual motion
  const strokeDashoffset = circumference - ((seconds % 60) / 60) * circumference;

  return (
    <div className="flex flex-col items-center bg-[#FDFBF7] p-8 rounded-3xl border border-[#E7D9C9] shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
      
      <div className="relative flex items-center justify-center mb-8">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          <circle
            stroke="#E7D9C9"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <motion.circle
            stroke="#8BA888"
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference + ' ' + circumference}
            animate={{ strokeDashoffset: isRunning ? strokeDashoffset : circumference }}
            transition={{ duration: 1, ease: "linear" }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={isRunning ? 'drop-shadow-[0_0_8px_rgba(139,168,136,0.6)]' : ''}
          />
        </svg>
        
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-serif font-bold text-[#2A3B2C] tracking-wider">
            {formatTime(seconds)}
          </span>
          {isRunning && (
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mt-1 flex items-center gap-1.5"
            >
              <div className="w-1.5 h-1.5 bg-[#8BA888] rounded-full"></div>
              <span className="text-[10px] uppercase tracking-widest text-[#8BA888] font-bold">Active</span>
            </motion.div>
          )}
        </div>
      </div>
      
      <div className="flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleToggle}
          className={`flex items-center justify-center w-14 h-14 rounded-full transition-colors shadow-sm ${
            isRunning 
              ? 'bg-[#E7D9C9]/50 text-[#5F6B63] hover:bg-[#E7D9C9]' 
              : 'bg-[#2D6A4F] text-white hover:bg-[#1B4332]'
          }`}
        >
          {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleStop}
          className="flex items-center justify-center w-14 h-14 bg-white text-[#5F6B63] border border-[#E7D9C9] hover:bg-[#F5F1EA] rounded-full transition-colors shadow-sm"
        >
          <Square size={20} fill="currentColor" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleReset}
          className="flex items-center justify-center w-14 h-14 bg-white text-[#5F6B63] border border-[#E7D9C9] hover:bg-[#F5F1EA] rounded-full transition-colors shadow-sm"
          title="Reset timer"
        >
          <RotateCcw size={20} />
        </motion.button>
      </div>
    </div>
  );
};

export default RecoveryTimer;
