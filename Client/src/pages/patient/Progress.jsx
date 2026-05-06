import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { format, parseISO } from 'date-fns';

export default function Progress() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    pain_level: 5,
    mobility_score: 50,
    energy_level: 5,
    notes: ''
  });

  const fetchLogs = async () => {
    try {
      const response = await api.get('/patient/progress');
      setLogs(response.data.data.data); // Paginated data
    } catch (err) {
      setError('Failed to load progress logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/patient/progress', formData);
      setFormData({ pain_level: 5, mobility_score: 50, energy_level: 5, notes: '' });
      fetchLogs(); // Refresh list
    } catch (err) {
      alert('Failed to log progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Log Form */}
        <div className="w-full md:w-1/3">
          <div className="card p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Log Daily Progress</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pain Level (1-10) : {formData.pain_level}
                </label>
                <input 
                  type="range" min="1" max="10" 
                  value={formData.pain_level}
                  onChange={e => setFormData({...formData, pain_level: e.target.value})}
                  className="w-full mt-2 accent-indigo-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mobility Score (0-100) : {formData.mobility_score}
                </label>
                <input 
                  type="range" min="0" max="100" step="5"
                  value={formData.mobility_score}
                  onChange={e => setFormData({...formData, mobility_score: e.target.value})}
                  className="w-full mt-2 accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Energy Level (1-10) : {formData.energy_level}
                </label>
                <input 
                  type="range" min="1" max="10" 
                  value={formData.energy_level}
                  onChange={e => setFormData({...formData, energy_level: e.target.value})}
                  className="w-full mt-2 accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes (Optional)
                </label>
                <textarea 
                  rows="3"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="How are you feeling today?"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary"
              >
                {isSubmitting ? 'Saving...' : 'Save Log'}
              </button>
            </form>
          </div>
        </div>

        {/* History */}
        <div className="w-full md:w-2/3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent History</h2>
          <div className="space-y-4">
            {logs.map(log => (
              <div key={log.id} className="card p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {format(parseISO(log.logged_at), 'MMMM dd, yyyy h:mm a')}
                    </span>
                    <div className="mt-2 flex gap-4">
                      <div className="bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 px-3 py-1 rounded-md text-sm font-medium">
                        Pain: {log.pain_level}/10
                      </div>
                      <div className="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 px-3 py-1 rounded-md text-sm font-medium">
                        Mobility: {log.mobility_score}/100
                      </div>
                    </div>
                  </div>
                </div>
                {log.notes && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                    "{log.notes}"
                  </p>
                )}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-center p-8 text-gray-500">No progress logs found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
