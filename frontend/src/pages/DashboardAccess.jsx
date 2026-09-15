import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, MapPin, IndianRupee, AlertTriangle, BarChart3, Clock, Shield, Building2, Landmark } from 'lucide-react';
import logo from '../assets/mplads-drishti-logo.png';

export default function DashboardAccess() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const role = user.role;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar with Logout */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="MPLADS DRISHTI" className="w-9 h-9" />
            <div className="leading-tight">
              <span className="font-bold text-navy-800 text-sm">MPLADS DRISHTI</span>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase block">Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-700">{user.name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{user.designation || user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-red-50 text-red-600 font-medium text-sm px-4 py-2 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ===== ADMIN (MoSPI) ===== */}
        {role === 'admin' && (
          <div className="animate-fade-in">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-navy-800 to-gov-blue-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-6 h-6 text-indigo-300" />
                  <span className="text-xs uppercase tracking-widest text-indigo-300 font-semibold">Central Administration</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Welcome, Central Admin.
                </h1>
                <p className="text-slate-300 text-sm">
                  You have <span className="text-white font-semibold">PAN-India Access</span>. Monitoring all states, constituencies, and project allocations.
                </p>
              </div>
            </div>

            {/* Placeholder Boxes */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center min-h-[320px] hover:border-gov-blue-400 transition-colors">
                <MapPin className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-lg font-bold text-slate-400 uppercase tracking-wider">INDIA MAP WILL RENDER HERE</p>
                <p className="text-sm text-slate-300 mt-2">Interactive state-level risk heatmap with drill-down</p>
              </div>

              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center min-h-[320px] hover:border-gov-blue-400 transition-colors">
                <IndianRupee className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-lg font-bold text-slate-400 uppercase tracking-wider">TOTAL INDIA MPLADS FUNDS KPI</p>
                <p className="text-sm text-slate-300 mt-2">National fund allocation, utilization rates, and expenditure analytics</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== DISTRICT AUTHORITY (DM/Nodal Officer) ===== */}
        {role === 'district_nodal' && (
          <div className="animate-fade-in">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-6 h-6 text-emerald-200" />
                  <span className="text-xs uppercase tracking-widest text-emerald-200 font-semibold">District Administration</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Welcome, District Authority.
                </h1>
                <p className="text-slate-200 text-sm">
                  Viewing data for: <span className="text-white font-semibold">{user.district || 'Your District'}</span>
                  {user.state && <span className="text-emerald-200">, {user.state}</span>}
                </p>
              </div>
            </div>

            {/* Placeholder Boxes */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center min-h-[320px] hover:border-emerald-400 transition-colors">
                <BarChart3 className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-lg font-bold text-slate-400 uppercase tracking-wider">DISTRICT SPECIFIC PROJECTS TABLE HERE</p>
                <p className="text-sm text-slate-300 mt-2">Projects, progress, and financial data for your district only</p>
              </div>

              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center min-h-[320px] hover:border-amber-400 transition-colors">
                <AlertTriangle className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-lg font-bold text-slate-400 uppercase tracking-wider">LOCAL ANOMALY ALERTS</p>
                <p className="text-sm text-slate-300 mt-2">District-level risk alerts and anomaly flags — not entire India data</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== MP (Member of Parliament) ===== */}
        {role === 'mp' && (
          <div className="animate-fade-in">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-saffron-600 to-amber-500 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Landmark className="w-6 h-6 text-amber-200" />
                  <span className="text-xs uppercase tracking-widest text-amber-200 font-semibold">Parliamentary Portal</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Welcome, Hon'ble MP.
                </h1>
                <p className="text-amber-100 text-sm">
                  Constituency Progress Report
                  {user.constituency && <span className="text-white font-semibold"> — {user.constituency}</span>}
                </p>
              </div>
            </div>

            {/* Placeholder Boxes */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center min-h-[320px] hover:border-saffron-400 transition-colors">
                <IndianRupee className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-lg font-bold text-slate-400 uppercase tracking-wider">MY SANCTIONED FUNDS CHART</p>
                <p className="text-sm text-slate-300 mt-2">Fund allocation, release, and utilization for your constituency</p>
              </div>

              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center min-h-[320px] hover:border-red-400 transition-colors">
                <Clock className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-lg font-bold text-slate-400 uppercase tracking-wider">MY DELAYED PROJECTS</p>
                <p className="text-sm text-slate-300 mt-2">Projects behind schedule in your constituency with delay analysis</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
