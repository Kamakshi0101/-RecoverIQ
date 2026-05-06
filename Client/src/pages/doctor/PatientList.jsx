import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import PatientCard from '../../components/PatientCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { Search } from 'lucide-react';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get(`/doctor/patients?search=${search}`);
        setPatients(response.data.data.data); // Paginated structure
      } catch (err) {
        setError('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchPatients();
    }, 500); // debounce
    
    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Roster</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and monitor all your assigned patients.</p>
      </div>

      <div className="relative mb-6 max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full rounded-lg border-gray-300 pl-10 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-[#0f1117] dark:text-white shadow-sm border"
          placeholder="Search patients by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : patients.length === 0 ? (
        <div className="card p-12 text-center text-gray-500 dark:text-gray-400 border-dashed border-2 bg-transparent">
          No patients found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {patients.map(patient => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}
    </div>
  );
}
