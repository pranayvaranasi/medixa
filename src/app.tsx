import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/authcontext';
import LandingPage from './pages/landingpage';
import Login from './pages/login';
import PatientDashboard from './pages/patientdashboard';
import HealthWorkerDashboard from './pages/healthworkerdashboard';
import DoctorDashboard from './pages/doctordashboard';
import ProtectedRoute from './components/protectedroute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/patientdashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/health-worker/*" 
              element={
                <ProtectedRoute allowedRoles={['health-worker']}>
                  <HealthWorkerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/doctordashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;