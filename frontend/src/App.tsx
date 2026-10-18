import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { PatientDashboardPage } from './pages/PatientDashboardPage';
import { CoderDashboardPage } from './pages/CoderDashboardPage';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: string }> = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-nude-300 border-t-charcoal-700 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-taupe-400">Loading ClaimSure-AI Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'Doctor') return <Navigate to="/doctor/dashboard" replace />;
    if (user.role === 'Patient') return <Navigate to="/patient/dashboard" replace />;
    if (user.role === 'Medical Coder') return <Navigate to="/coder/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Role Dashboards */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRole="Doctor">
                <DoctorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRole="Patient">
                <PatientDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coder/dashboard"
            element={
              <ProtectedRoute allowedRole="Medical Coder">
                <CoderDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
