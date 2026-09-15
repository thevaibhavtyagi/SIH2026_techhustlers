import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import MPLayout from './layouts/MPLayout';
import CitizenLayout from './layouts/CitizenLayout';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ProjectsList from './pages/admin/ProjectsList';
import ProjectDetail from './pages/admin/ProjectDetail';
import RiskEngine from './pages/admin/RiskEngine';
import Alerts from './pages/admin/Alerts';

// MP Pages
import MPDashboard from './pages/mp/Dashboard';

// Citizen Pages
import CitizenDashboard from './pages/citizen/Dashboard';

// Placeholder for missing pages
import Placeholder from './pages/Placeholder';

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="projects" element={<ProjectsList />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="risk-engine" element={<RiskEngine />} />
              <Route path="alerts" element={<Alerts />} />
              {/* Placeholders for remaining Admin menu items */}
              <Route path="anomalies" element={<Placeholder title="Fraud & Anomalies" />} />
              <Route path="expenditure" element={<Placeholder title="Expenditure" />} />
              <Route path="progress" element={<Placeholder title="Progress & Delays" />} />
              <Route path="contractors" element={<Placeholder title="Contractors" />} />
              <Route path="map" element={<Placeholder title="Geographic Intel" />} />
              <Route path="investigations" element={<Placeholder title="Investigations" />} />
              <Route path="reports" element={<Placeholder title="Reports" />} />
            </Route>

            {/* MP Routes */}
            <Route path="/mp" element={
              <ProtectedRoute allowedRoles={['mp']}>
                <MPLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/mp/dashboard" replace />} />
              <Route path="dashboard" element={<MPDashboard />} />
              {/* Placeholders for remaining MP menu items */}
              <Route path="projects" element={<Placeholder title="My Projects" />} />
              <Route path="funds" element={<Placeholder title="Funds" />} />
              <Route path="progress" element={<Placeholder title="Progress" />} />
              <Route path="risk" element={<Placeholder title="Risk Insights" />} />
              <Route path="alerts" element={<Placeholder title="Alerts" />} />
            </Route>

            {/* Citizen Routes */}
            <Route path="/citizen" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/citizen/dashboard" replace />} />
              <Route path="dashboard" element={<CitizenDashboard />} />
              {/* Placeholders for remaining Citizen menu items */}
              <Route path="projects" element={<Placeholder title="Explore Projects" />} />
              <Route path="nearby" element={<Placeholder title="Nearby Development" />} />
              <Route path="my-reports" element={<Placeholder title="My Reports" />} />
              <Route path="report" element={<Placeholder title="Report a Concern" />} />
              <Route path="profile" element={<Placeholder title="Profile" />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}
