import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProjects } from '../../services/api';
import { PageHeader, ChartCard, LoadingState, AIInsightCard } from '../../components/common/UIComponents';
import RiskBadge from '../../components/common/RiskBadge';

const RISK_LEVEL_LABEL = {
  CRITICAL: 'Critical', HIGH: 'High', MEDIUM: 'Moderate', LOW: 'Low',
  Critical: 'Critical', High: 'High', Moderate: 'Moderate', Low: 'Low',
};

const riskExplanation = (riskScore, riskLevel) => {
  const level = riskLevel?.toUpperCase?.() || '';
  if (level === 'CRITICAL' || riskScore >= 75) {
    return 'Expenditure is significantly above the sanctioned amount while physical progress remains low — a pattern consistent with fund diversion in similar flagged cases.';
  }
  if (level === 'HIGH' || riskScore >= 60) {
    return 'Payment clustering detected combined with a slower-than-expected completion rate. Recommend review.';
  }
  if (level === 'MEDIUM' || riskScore >= 40) {
    return 'Minor deviation from the expected expenditure-to-progress ratio for this work category.';
  }
  return 'No significant anomaly — project is progressing in line with similar sanctioned works.';
};

export default function RiskInsights() {
  const { user } = useAuth();
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.constituency) return;
    getProjects({ constituency: user.constituency })
      .then(setProjects)
      .catch((err) => setError(err?.response?.data?.message || 'Could not load risk data.'));
  }, [user]);

  if (error) return (
    <div className="space-y-6">
      <PageHeader title="Risk Insights" subtitle={`AI risk analysis for projects in ${user?.constituency || 'your constituency'}.`} />
      <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
    </div>
  );

  if (!projects) return <div className="p-6"><LoadingState rows={6} /></div>;

  const byLevel = { Low: 0, Moderate: 0, High: 0, Critical: 0 };
  projects.forEach((p) => {
    const label = RISK_LEVEL_LABEL[p.riskLevel] || 'Low';
    byLevel[label] = (byLevel[label] || 0) + 1;
  });

  const topRisky = [...projects].sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0)).slice(0, 6);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Risk Insights" subtitle={`AI risk analysis for projects in ${user?.constituency || 'your constituency'}.`} />

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
                <RiskBadge score={p.riskScore ?? 0} />
              </div>
              <p className="text-xs text-slate-600">{riskExplanation(p.riskScore, p.riskLevel)}</p>
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
            <strong>{topRisky[0].riskScore ?? 0}/100</strong> ({RISK_LEVEL_LABEL[topRisky[0].riskLevel] || topRisky[0].riskLevel || '—'}).{' '}
            {riskExplanation(topRisky[0].riskScore, topRisky[0].riskLevel)}
          </p>
        </AIInsightCard>
      )}
    </div>
  );
}
