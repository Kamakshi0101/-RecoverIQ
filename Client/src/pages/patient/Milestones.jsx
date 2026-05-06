import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import MilestoneCard from '../../components/MilestoneCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';

export default function Milestones() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await api.get('/patient/milestones');
        setMilestones(response.data.data);
      } catch (err) {
        setError('Failed to load milestones');
      } finally {
        setLoading(false);
      }
    };
    fetchMilestones();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Milestones</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track your major recovery goals.</p>
      </div>

      {milestones.length === 0 ? (
        <div className="card p-12 text-center text-gray-500 dark:text-gray-400 border-dashed border-2 bg-transparent">
          You don't have any milestones assigned yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {milestones.map(milestone => (
            <MilestoneCard key={milestone.id} milestone={milestone} />
          ))}
        </div>
      )}
    </div>
  );
}
