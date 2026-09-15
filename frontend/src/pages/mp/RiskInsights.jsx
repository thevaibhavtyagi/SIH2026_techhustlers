import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProjects } from '../../services/api';
import { PageHeader, ChartCard, LoadingState, AIInsightCard } from '../../components/common/UIComponents';
import RiskBadge from '../../components/common/RiskBadge';

export default function RiskInsights() {
  const { user } = useAuth();
  const [projects, setProjects] = useState(null);

  useEffect(() => {
    if (!user?.constituency) return;
    getProjects({ constituency: user.constituency }).then(setProjects);
  }, [user]);

  if (!projects) return <div className="p-6"><LoadingState rows={6} /></div>;

  const byLevel = { Low: 0, Moderate: 0, High: 0, Critical: 0 };
  projects.forEach((p) => { byLevel[p.riskLevel] = (byLevel[p.riskLevel] || 0) + 1; });

  const topRisky = [...projects].sort((a, b) => b.riskScore - a.riskScore).slice(0, 6);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Risk Insights" subtitle={`AI risk analysis for projects in ${user.constituency}.`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(byLevel).map(([level, count]) => (
          <div key={level} className="bg-white rounded-xl border border-slate-200 p-5 text-center">
            <p className="text-2xl font-bold text-slate-800">{count}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">{level}</p>
          </div>
        ))}
      </div>

      <ChartCard title="Highest-Risk Projects" subtitle="Ranked by AI risk score">
        <div className="space-y-4">
          {topRisky.map((p) => (
            <div key={p.id} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="font-semibold text-sm text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{p.id}</p>
                </div>
                <RiskBadge score={p.riskScore} />
              </div>
              <p className="text-xs text-slate-600">{p.aiAnomalyReason}</p>
            </div>
          ))}
          {topRisky.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-8">No projects found for your constituency.</p>
          )}
        </div>
      </ChartCard>

      {topRisky[0] && (
        <AIInsightCard title="AI Insight">
          <p>
            <strong>{topRisky[0].name}</strong> has the highest risk score in your constituency at{' '}
            <strong>{topRisky[0].riskScore}/100</strong>. {topRisky[0].aiAnomalyReason}
          </p>
        </AIInsightCard>
      )}
    </div>
  );
}
