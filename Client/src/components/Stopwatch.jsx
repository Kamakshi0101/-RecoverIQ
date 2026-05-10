import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';

const Stopwatch = ({ onStop, initialSeconds = 0 }) => {
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

  const handleStart = () => {
    setIsRunning(true);
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

  return (
    <div className="flex items-center space-x-4 bg-gray-800/50 p-4 rounded-xl border border-white/5">
      <div className="text-3xl font-mono font-medium text-white min-w-[100px] text-center tracking-wider">
        {formatTime(seconds)}
      </div>
      
      <div className="flex space-x-2">
        {!isRunning ? (
          <button
            type="button"
            onClick={handleStart}
            className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Play size={18} fill="currentColor" />
            <span>Start</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStop}
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Square size={18} fill="currentColor" />
            <span>Stop</span>
          </button>
        )}
        
        <button
          type="button"
          onClick={handleReset}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Reset timer"
        >
          <RotateCcw size={20} />
        </button>
      </div>
      {isRunning && (
        <div className="flex items-center ml-2">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default Stopwatch;
