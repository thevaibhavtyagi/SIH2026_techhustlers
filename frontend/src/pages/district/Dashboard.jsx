import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats, getProjects, getAlerts } from '../../services/api';
import KPICard from '../../components/common/KPICard';
import { PageHeader, ChartCard } from '../../components/common/UIComponents';
import { StatusBadge } from '../../components/common/RiskBadge';
import { FolderKanban, IndianRupee, Clock, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function DistrictDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    getDashboardStats('district_nodal', user?.district).then(setStats);
    getProjects({ district: user?.district }).then((p) => setProjects(p.slice(0, 5)));
    getAlerts({}).then((a) => setAlerts(a.slice(0, 4)));
  }, [user]);

  if (!stats) {
    return (
      <div className="p-6 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`District Dashboard: ${user?.district || 'Your District'}`}
        subtitle={`MPLADS project monitoring for ${user?.state || 'your state'}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={FolderKanban} label="Projects in District" value={stats.totalProjects} color="blue" />
        <KPICard icon={IndianRupee} label="Sanctioned Funds" value={stats.totalFunds / 100000} prefix="₹" suffix=" Cr" color="indigo" />
        <KPICard icon={Clock} label="Avg. Completion" value={stats.completionRate} suffix="%" color="green" />
        <KPICard icon={AlertTriangle} label="High-Risk Projects" value={stats.highRiskAlerts} color={stats.highRiskAlerts > 0 ? 'red' : 'green'} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Recent Projects in District">
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.id} • {p.workType}</p>
                  </div>
                  <StatusBadge status={p.status} size="sm" />
                </div>
                <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-slate-100">
                  <span className="text-slate-600">Sanctioned: <strong>{formatCurrency(p.sanctionedAmount)}</strong></span>
                  <span className="text-slate-600">Progress: <strong>{p.progress}%</strong></span>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">No projects found for this district yet.</div>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Local Anomaly Alerts" subtitle="District-level risk flags — not entire India data">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No recent alerts for your district.</div>
          ) : (
            <div className="space-y-3">
              {alerts.map((a) => (
                <div key={a.id} className="flex gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${a.severity === 'Critical' ? 'text-red-500' : 'text-amber-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{a.description}</p>
                    <p className="text-xs text-slate-500 mt-1">Project: {a.projectId}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
