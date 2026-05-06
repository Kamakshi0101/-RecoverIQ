import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import PatientProgress from './pages/patient/Progress';
import PatientExercises from './pages/patient/Exercises';
import PatientMilestones from './pages/patient/Milestones';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import PatientList from './pages/doctor/PatientList';
import PatientDetail from './pages/doctor/PatientDetail';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-pulse">Loading...</div></div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} />;
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
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/patient" element={
                <ProtectedRoute allowedRole="patient">
                  <Layout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<PatientDashboard />} />
                <Route path="progress" element={<PatientProgress />} />
                <Route path="exercises" element={<PatientExercises />} />
                <Route path="milestones" element={<PatientMilestones />} />
              </Route>
              
              <Route path="/doctor" element={
                <ProtectedRoute allowedRole="doctor">
                  <Layout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="patients" element={<PatientList />} />
                <Route path="patients/:id" element={<PatientDetail />} />
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
