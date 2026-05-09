import React from 'react';
import { motion } from 'framer-motion';

export default function PremiumStatCard({ title, value, subtitle, icon, color = 'primary', trend = null }) {
  const colorMap = {
    primary: { bg: 'bg-[#DCE6D8]', text: 'text-[#2D6A4F]' },
    lavender: { bg: 'bg-[#D8D1F0]', text: 'text-[#2D6A4F]' },
    beige: { bg: 'bg-[#E7D9C9]', text: 'text-[#2D6A4F]' },
    soft: { bg: 'bg-[#F5F1EA]', text: 'text-[#233127]' }
  };

  const colors = colorMap[color] || colorMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      className="bg-white rounded-3xl border border-[#E7D9C9]/40 p-8 shadow-md shadow-black/5 hover:shadow-lg hover:shadow-black/8 transition-all"
    >
      {/* Icon */}
      <motion.div
        className={`${colors.bg} ${colors.text} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        {icon}
      </motion.div>

      {/* Label */}
      <p className="text-xs uppercase tracking-widest font-semibold text-[#5F6B63] mb-3">
        {title}
      </p>

      {/* Value */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h3 className="text-4xl lg:text-5xl font-serif font-bold text-[#233127] leading-tight">
          {value}
        </h3>
      </motion.div>

      {/* Subtitle & Trend */}
      <div className="flex items-center justify-between mt-4">
        {subtitle && (
          <p className="text-sm text-[#5F6B63]">{subtitle}</p>
        )}
        {trend && (
          <motion.div
            className={`text-sm font-medium flex items-center gap-1 ${
              trend.type === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span>{trend.value}%</span>
            <span>{trend.type === 'up' ? '↑' : '↓'}</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
