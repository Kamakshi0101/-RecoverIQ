import React, { useEffect, useState } from 'react';

const ProgressRing = ({ radius, stroke, progress, color = '#2D6A4F' }) => {
  const [offset, setOffset] = useState(0);
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  useEffect(() => {
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    // Add slight delay for animation
    const timeout = setTimeout(() => {
      setOffset(strokeDashoffset);
    }, 100);
    return () => clearTimeout(timeout);
  }, [progress, circumference]);

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      className="transform -rotate-90"
    >
      {/* Background Ring */}
      <circle
        stroke="#E7D9C9"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      {/* Progress Ring */}
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset: offset }}
        className="transition-all duration-1000 ease-out"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
};

export default ProgressRing;
