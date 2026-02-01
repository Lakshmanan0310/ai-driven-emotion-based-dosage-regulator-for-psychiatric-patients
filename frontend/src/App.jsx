import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import Home from './pages/Home';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientLogin from './pages/PatientLogin';
import PatientDashboard from './pages/PatientDashboard';
import PatientProfilePage from './pages/PatientProfilePage';
import Health from './components/Health';
import './index.css';

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/patient-login" element={<PatientLogin />} />
          <Route path="/patient/:patientId" element={<PatientDashboard />} />
          <Route path="/patient/:patientId/profile" element={<PatientProfilePage />} />
          <Route path="/health" element={<Health />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
