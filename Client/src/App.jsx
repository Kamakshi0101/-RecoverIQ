import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import PatientProgress from './pages/patient/Progress';
import PatientExercises from './pages/patient/Exercises';
import PatientMilestones from './pages/patient/Milestones';
import ExerciseLogger from './pages/patient/ExerciseLogger';
import Calendar from './pages/patient/Calendar';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import PatientList from './pages/doctor/PatientList';
import PatientDetail from './pages/doctor/PatientDetail';
import TherapistAppointments from './pages/doctor/Appointments';
import AvailabilityManager from './pages/doctor/AvailabilityManager';
// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import SessionPrepDashboard from './pages/doctor/SessionPrepDashboard';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-pulse">Loading...</div></div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
    if (user.role === 'doctor') return <Navigate to="/doctor/dashboard" />;
    return <Navigate to="/patient/dashboard" />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-white transition-colors duration-200">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/admin" element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<AdminDashboard />} />
              </Route>

              <Route path="/patient" element={
                <ProtectedRoute allowedRole="patient">
                  <Layout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<PatientDashboard />} />
                <Route path="progress" element={<PatientProgress />} />
                <Route path="exercises" element={<PatientExercises />} />
                <Route path="exercise-logger" element={<ExerciseLogger />} />
                <Route path="milestones" element={<PatientMilestones />} />
                <Route path="calendar" element={<Calendar />} />
              </Route>
              
              <Route path="/doctor" element={
                <ProtectedRoute allowedRole="doctor">
                  <Layout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="patients" element={<PatientList />} />
                <Route path="patients/:id" element={<PatientDetail />} />
                <Route path="patients/:id/prep" element={<SessionPrepDashboard />} />
                <Route path="appointments" element={<TherapistAppointments />} />
                <Route path="availability" element={<AvailabilityManager />} />
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
