import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats, getProjects } from '../../services/api';
import { PageHeader, ChartCard } from '../../components/common/UIComponents';
import { MapPin, Search, Bell, Flag, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [localProjects, setLocalProjects] = useState([]);

  useEffect(() => {
    getDashboardStats('citizen').then(setStats);
    getProjects({ district: user?.district }).then(p => setLocalProjects(p.slice(0, 5)));
  }, [user]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-india-green-600 to-india-green-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold mb-3">Welcome, {user?.name}</h1>
          <p className="text-india-green-50 mb-6 text-lg">Your portal for transparent development monitoring in {user?.district}, {user?.state}.</p>
          <div className="flex gap-4">
            <button className="bg-white text-india-green-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-india-green-50 transition-colors shadow-sm">
              Search Projects
            </button>
            <button className="bg-india-green-800/50 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-india-green-800/70 border border-india-green-500/30 transition-colors backdrop-blur-sm flex items-center gap-2">
              <Flag className="w-4 h-4" /> Report Concern
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-start gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Search className="w-6 h-6" /></div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-1">Explore Projects</h3>
            <p className="text-sm text-slate-500">View all MPLADS projects, funds, and physical progress.</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-start gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Bell className="w-6 h-6" /></div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-1">Stay Updated</h3>
            <p className="text-sm text-slate-500">Get notified when new projects are sanctioned in your area.</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-start gap-4 shadow-sm">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><ShieldCheck className="w-6 h-6" /></div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-1">Transparent Data</h3>
            <p className="text-sm text-slate-500">All data is verified and securely sourced from official records.</p>
          </div>
        </div>
      </div>

      <ChartCard 
        title={`Recent Projects in ${user?.district}`} 
        subtitle="Development activities happening near you"
      >
        <div className="space-y-4">
          {localProjects.map(p => (
            <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-100 rounded-xl hover:shadow-md transition-shadow bg-slate-50/50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-800">{p.name}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    p.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>{p.status}</span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{p.workType} • {p.constituency}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Sanctioned: <strong>{formatCurrency(p.sanctionedAmount)}</strong></span>
                  <span>Progress: <strong>{p.progress}%</strong></span>
                </div>
              </div>
              <button className="sm:w-auto w-full px-4 py-2 text-sm font-medium text-gov-blue-600 bg-white border border-gov-blue-200 rounded-lg hover:bg-gov-blue-50 transition-colors flex items-center justify-center gap-2">
                View Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
          {localProjects.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No recent projects found in your district.
            </div>
          )}
        </div>
      </ChartCard>
    </div>
  );
}
