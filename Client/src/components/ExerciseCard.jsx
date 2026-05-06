import React from 'react';
import { PlayCircle, CheckCircle } from 'lucide-react';

export default function ExerciseCard({ exercise, onLog }) {
  return (
    <div className="card flex flex-col p-5 animate-fade-in h-full">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20 capitalize">
            {exercise.category}
          </span>
          <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">{exercise.name}</h3>
        </div>
      </div>
      
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex-grow">
        {exercise.description || 'No description provided.'}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 dark:border-white/5">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Target Reps</p>
          <p className="font-medium text-gray-900 dark:text-white">{exercise.target_reps || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {exercise.target_duration_minutes ? `${exercise.target_duration_minutes} min` : 'N/A'}
          </p>
        </div>
      </div>

      <button
        onClick={() => onLog(exercise)}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
      >
        <PlayCircle className="h-4 w-4" />
        Log Activity
      </button>
    </div>
  );
}
