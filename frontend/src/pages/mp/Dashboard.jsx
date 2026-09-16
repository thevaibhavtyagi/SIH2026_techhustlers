import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { riskApi } from '../../services/api';
import KPICard from '../../components/common/KPICard';
import { PageHeader, ChartCard } from '../../components/common/UIComponents';
import RiskBadge, { StatusBadge } from '../../components/common/RiskBadge';
import { FolderKanban, IndianRupee, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

export default function MPDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [projects, setProjects] = useState([]);
  const [recentFlags, setRecentFlags] = useState([]);
  const [timeseries, setTimeseries] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    // Backend enforces constituency scope for MP role via Step 8 — no need to
    // pass constituency manually to getAnalyticsOverview.
    Promise.all([
      riskApi.getAnalyticsOverview(),
      riskApi.getProjects({ limit: 5 }),
      riskApi.getInvestigations({ limit: 4 }),
      riskApi.getAnalyticsTimeseries(),
    ])
      .then(([ov, projectsData, invData, tsData]) => {
        setOverview(ov);
        setProjects(projectsData?.projects || []);
        setRecentFlags(invData?.investigations || []);
        setTimeseries(tsData || []);
      })
      .catch((err) => setError(err?.response?.data?.message || 'Could not load dashboard data.'));
  }, [user]);

  if (error) return (
    <div className="space-y-6">
      <PageHeader title={`Constituency Dashboard: ${user?.constituency || ''}`} subtitle={`MPLADS monitoring for ${user?.state || ''}`} />
      <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
    </div>
  );

  if (!overview) return <div className="p-6 animate-pulse space-y-6"><div className="h-8 bg-slate-200 rounded w-64" /></div>;

  const completionRate = overview.totalProjects
    ? Math.round(((overview.completedProjects ?? 0) / overview.totalProjects) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`Constituency Dashboard: ${user?.constituency || 'My Constituency'}`}
        subtitle={`MPLADS monitoring for ${user?.state || ''}`}
      />

      {/* KPIs from real analytics/overview (scoped by backend to this MP's constituency) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={FolderKanban} label="Total Projects" value={overview.totalProjects ?? 0} color="blue" />
        <KPICard icon={IndianRupee} label="Sanctioned Funds" value={Math.round((overview.totalSanctionedAmount ?? 0) / 100000)} prefix="₹" suffix=" L" color="indigo" />
        <KPICard icon={Clock} label="Completion Rate" value={completionRate} suffix="%" color="green" />
        <KPICard icon={AlertTriangle} label="High+Critical Risk" value={overview.highCriticalProjects ?? 0} color={(overview.highCriticalProjects ?? 0) > 0 ? 'red' : 'green'} />
      </div>

      {/* Monthly Project Activity */}
      <ChartCard
        title="Monthly Project Activity"
        subtitle="Projects recommended, sanctioned, and completed by month"
      >
        <ResponsiveContainer width="100%" height={240}>
          {timeseries.length > 0 ? (
            <BarChart data={timeseries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="recommendedProjects" name="Recommended" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sanctionedProjects" name="Sanctioned" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completedProjects" name="Completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              No activity data available.
            </div>
          )}
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <ChartCard title="Recent Projects in Constituency">
          {projects.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No projects found for your constituency.</div>
          ) : (
            <div className="space-y-3">
              {projects.map(p => (
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

        {/* Recent Flags from investigations */}
        <ChartCard
          title="Constituency Risk Flags"
          subtitle="ML-flagged projects requiring attention"
          action={<button onClick={() => navigate('/mp/risk')} className="text-xs text-gov-blue-600 hover:underline flex items-center gap-1">View Insights <ArrowRight className="w-3 h-3" /></button>}
        >
          {recentFlags.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No risk flags for your constituency. ✓
            </div>
          ) : (
            <div className="space-y-3">
              {recentFlags.map(f => (
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
