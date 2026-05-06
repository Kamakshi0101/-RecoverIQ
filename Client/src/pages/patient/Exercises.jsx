import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import ExerciseCard from '../../components/ExerciseCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await api.get('/patient/exercises');
        setExercises(response.data.data);
      } catch (err) {
        setError('Failed to load exercises');
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  const handleLogExercise = async (exercise) => {
    const confirmed = window.confirm(`Log completion of ${exercise.name}?`);
    if (!confirmed) return;

    try {
      await api.post(`/patient/exercises/${exercise.id}/log`, {
        actual_reps: exercise.target_reps,
        actual_duration_minutes: exercise.target_duration_minutes,
        difficulty_rating: 3,
        notes: 'Logged via quick action'
      });
      alert('Exercise logged successfully!');
    } catch (err) {
      alert('Failed to log exercise.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Exercises</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Your assigned daily routine.</p>
        </div>
      </div>

      {exercises.length === 0 ? (
        <div className="card p-12 text-center text-gray-500 dark:text-gray-400 border-dashed border-2 bg-transparent">
          You don't have any active exercises assigned right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map(exercise => (
            <ExerciseCard key={exercise.id} exercise={exercise} onLog={handleLogExercise} />
          ))}
        </div>
      )}
    </div>
  );
}
