import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function FeedbackBanner({ feedback }) {
  const colorConfig = {
    warning: {
      bg: 'bg-red-50 dark:bg-red-500/10',
      border: 'border-red-200 dark:border-red-500/20',
      text: 'text-red-800 dark:text-red-200',
      icon: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-500/10',
      border: 'border-green-200 dark:border-green-500/20',
      text: 'text-green-800 dark:text-green-200',
      icon: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-blue-200 dark:border-blue-500/20',
      text: 'text-blue-800 dark:text-blue-200',
      icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    }
  };

  const config = colorConfig[feedback.type] || colorConfig.info;

  return (
    <div className={`mb-4 flex items-center rounded-lg border p-4 animate-fade-in ${config.bg} ${config.border}`}>
      <div className="mr-3 shrink-0">{config.icon}</div>
      <p className={`text-sm font-medium ${config.text}`}>{feedback.message}</p>
    </div>
  );
}
