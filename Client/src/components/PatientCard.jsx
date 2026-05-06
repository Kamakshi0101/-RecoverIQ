import React from 'react';
import { User, Activity, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PatientCard({ patient }) {
  const navigate = useNavigate();

  return (
    <div className="card p-5 animate-fade-in hover:border-indigo-200 dark:hover:border-indigo-500/30 cursor-pointer" onClick={() => navigate(`/doctor/patients/${patient.user_id}`)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{patient.user?.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{patient.injury_type}</p>
          </div>
        </div>
        
        {patient.current_pain_level >= 8 && (
          <span title="High Pain Alert" className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 dark:border-white/5">
        <div>
          <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Activity className="h-3 w-3" /> Pain Level
          </p>
          <p className="mt-1 font-medium text-gray-900 dark:text-white">
            {patient.current_pain_level}/10
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Mobility</p>
          <p className="mt-1 font-medium text-gray-900 dark:text-white">
            {patient.mobility_score}/100
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Streak</p>
          <p className="mt-1 font-medium text-gray-900 dark:text-white">
            {patient.streak_count} Days
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
          <p className="mt-1 font-medium capitalize text-green-600 dark:text-green-400">
            {patient.status}
          </p>
        </div>
      </div>
    </div>
  );
}
