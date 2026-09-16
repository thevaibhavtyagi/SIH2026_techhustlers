import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './components/common/ProtectedRoute';
import { ROLE_DASHBOARD_PATH, ROLES } from './utils/constants';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup'; // admin-only internal account setup — mounted under /admin

// Layouts
import AdminLayout from './layouts/AdminLayout';
import MPLayout from './layouts/MPLayout';
import DistrictLayout from './layouts/DistrictLayout';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProjectsList from './pages/admin/ProjectsList';
import AdminProjectDetail from './pages/admin/ProjectDetail';
import AdminAlerts from './pages/admin/Alerts';
import AdminRiskEngine from './pages/admin/RiskEngine';
import AdminInvestigations from './pages/admin/Investigations';
import AdminGeographicIntel from './pages/admin/GeographicIntel';
import AdminExpenditure from './pages/admin/Expenditure';
import AdminProgressDelays from './pages/admin/ProgressDelays';
import AdminContractors from './pages/admin/Contractors';
import AdminReports from './pages/admin/Reports';
import AdminProfile from './pages/admin/Profile';
import AdminSettings from './pages/admin/Settings';

// MP pages
import MPDashboard from './pages/mp/Dashboard';
import MPFunds from './pages/mp/Funds';
import MPRiskInsights from './pages/mp/RiskInsights';

// District pages
import DistrictDashboard from './pages/district/Dashboard';

// Shared, scope-parametrized pages
import ScopedProjects from './pages/shared/ScopedProjects';
import ScopedAlerts from './pages/shared/ScopedAlerts';

function DashboardRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={ROLE_DASHBOARD_PATH[user?.role] || '/login'} replace />;
}

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public — there is no public registration, only login */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Generic entry point — sends a logged-in user to their role's dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="projects" element={<AdminProjectsList />} />
              <Route path="projects/:id" element={<AdminProjectDetail />} />
              <Route path="alerts" element={<AdminAlerts />} />
              {/* Fraud & Anomalies is the same AI-flagged alert data, different sidebar entry point */}
              <Route path="anomalies" element={<AdminAlerts />} />
              <Route path="risk-engine" element={<AdminRiskEngine />} />
              <Route path="investigations" element={<AdminInvestigations />} />
              <Route path="map" element={<AdminGeographicIntel />} />
              <Route path="expenditure" element={<AdminExpenditure />} />
              <Route path="progress" element={<AdminProgressDelays />} />
              <Route path="contractors" element={<AdminContractors />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="provision-account" element={<Signup />} />
            </Route>

            {/* Member of Parliament */}
            <Route
              path="/mp"
              element={
                <ProtectedRoute allowedRoles={[ROLES.MP]}>
                  <MPLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<MPDashboard />} />
              <Route
                path="projects"
                element={<ScopedProjects scopeField="constituency" title="My Projects" subtitle="All MPLADS projects sanctioned in your constituency." />}
              />
              <Route
                path="progress"
                element={<ScopedProjects scopeField="constituency" title="Progress" subtitle="Physical progress across your constituency's projects." />}
              />
              <Route path="funds" element={<MPFunds />} />
              <Route path="risk" element={<MPRiskInsights />} />
              <Route
                path="alerts"
                element={<ScopedAlerts scopeField="constituency" title="Alerts" subtitle="Risk alerts and anomaly flags for your constituency." />}
              />
            </Route>

            {/* District Authority / Nodal Officer */}
            <Route
              path="/district"
              element={
                <ProtectedRoute allowedRoles={[ROLES.DISTRICT_NODAL]}>
                  <DistrictLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DistrictDashboard />} />
              <Route
                path="projects"
                element={<ScopedProjects scopeField="district" title="District Projects" subtitle="All MPLADS projects sanctioned in your district." />}
              />
              <Route
                path="alerts"
                element={<ScopedAlerts scopeField="district" title="Local Alerts" subtitle="District-level risk alerts and anomaly flags." />}
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}
