import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { riskApi } from '../../services/api';
import KPICard from '../../components/common/KPICard';
import { PageHeader, ChartCard } from '../../components/common/UIComponents';
import { StatusBadge } from '../../components/common/RiskBadge';
import { FolderKanban, IndianRupee, Clock, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function DistrictDashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [projects, setProjects] = useState([]);
  const [recentFlags, setRecentFlags] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    // Backend enforces state+district scope for district_nodal role via Step 8.
    Promise.all([
      riskApi.getAnalyticsOverview(),
      riskApi.getProjects({ limit: 5 }),
      riskApi.getInvestigations({ limit: 4 }),
    ])
      .then(([ov, projectsData, invData]) => {
        setOverview(ov);
        setProjects(projectsData?.projects || []);
        setRecentFlags(invData?.investigations || []);
      })
      .catch((err) => setError(err?.response?.data?.message || 'Could not load dashboard data.'));
  }, [user]);

  if (error) return (
    <div className="space-y-6">
      <PageHeader title={`District Dashboard: ${user?.district || 'Your District'}`} subtitle={`MPLADS project monitoring for ${user?.state || 'your state'}`} />
      <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
    </div>
  );

  if (!overview) {
    return (
      <div className="p-6 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-64" />
      </div>
    );
  }

  const completionRate = overview.totalProjects
    ? Math.round(((overview.completedProjects ?? 0) / overview.totalProjects) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`District Dashboard: ${user?.district || 'Your District'}`}
        subtitle={`MPLADS project monitoring for ${user?.state || 'your state'}`}
      />

      {/* KPIs from real analytics/overview (scoped by backend to this district) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={FolderKanban} label="Projects in District" value={overview.totalProjects ?? 0} color="blue" />
        <KPICard icon={IndianRupee} label="Sanctioned Funds" value={Math.round((overview.totalSanctionedAmount ?? 0) / 10000000)} prefix="₹" suffix=" Cr" color="indigo" />
        <KPICard icon={Clock} label="Completion Rate" value={completionRate} suffix="%" color="green" />
        <KPICard icon={AlertTriangle} label="High+Critical Risk" value={overview.highCriticalProjects ?? 0} color={(overview.highCriticalProjects ?? 0) > 0 ? 'red' : 'green'} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <ChartCard title="Recent Projects in District">
          {projects.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No projects found for this district yet.</div>
          ) : (
            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p.id} className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-sm text-slate-800 truncate max-w-xs" title={p.name}>{p.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{p.id} • {p.workType || '—'}</p>
                    </div>
                    <StatusBadge status={p.status} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-slate-100">
                    <span className="text-slate-600">Sanctioned: <strong>{formatCurrency(p.sanctionedAmount)}</strong></span>
                    <span className="text-slate-600">Progress: <strong>{p.progress ?? 0}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* Local Flags */}
        <ChartCard title="Local Anomaly Alerts" subtitle="District-level risk flags from ML engine">
          {recentFlags.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No recent risk flags for your district.</div>
          ) : (
            <div className="space-y-3">
              {recentFlags.map((f) => (
                <div key={f.workId} className="flex gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${f.riskLevel === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{f.primarySignal || `Risk Score: ${f.riskScore}/100`}</p>
                    <p className="text-xs text-slate-500 mt-1 font-mono">Project: {f.workId}</p>
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
