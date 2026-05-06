import React from 'react';
import { Target, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';

export default function MilestoneCard({ milestone }) {
  const getStatusConfig = (status, targetDate) => {
    if (status === 'completed') {
      return { color: 'green', text: 'Completed', icon: <CheckCircle className="h-4 w-4" /> };
    }
    if (status === 'missed' || (isPast(parseISO(targetDate)) && status !== 'completed')) {
      return { color: 'red', text: 'Missed', icon: <AlertCircle className="h-4 w-4" /> };
    }
    if (status === 'in_progress') {
      return { color: 'blue', text: 'In Progress', icon: <Clock className="h-4 w-4" /> };
    }
    return { color: 'gray', text: 'Pending', icon: <Target className="h-4 w-4" /> };
  };

  const statusConfig = getStatusConfig(milestone.status, milestone.target_date);
  
  const colorClasses = {
    green: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400',
    red: 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-500/10 dark:text-red-400',
    blue: 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-500/10 dark:text-blue-400',
    gray: 'bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-500/10 dark:text-gray-400',
  };

  return (
    <div className="card p-5 flex flex-col h-full animate-fade-in border-l-4" style={{
        borderLeftColor: statusConfig.color === 'green' ? '#10b981' : statusConfig.color === 'red' ? '#ef4444' : statusConfig.color === 'blue' ? '#3b82f6' : '#9ca3af'
    }}>
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colorClasses[statusConfig.color]}`}>
          {statusConfig.icon}
          {statusConfig.text}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Target: {format(parseISO(milestone.target_date), 'MMM dd, yyyy')}
        </span>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{milestone.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 flex-grow">
        {milestone.description}
      </p>
      
      {milestone.completed_at && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-white/5 pt-3">
          Completed on: {format(parseISO(milestone.completed_at), 'MMM dd, yyyy')}
        </div>
      )}
    </div>
  );
}
