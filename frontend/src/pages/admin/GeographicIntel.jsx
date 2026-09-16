import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MapPin } from 'lucide-react';
import { PageHeader, ChartCard, LoadingState } from '../../components/common/UIComponents';
import { riskApi } from '../../services/api';
import { formatNumber, getRiskColor } from '../../utils/formatters';

const riskFill = (score) => {
  if (score >= 75) return '#ef4444';
  if (score >= 60) return '#f97316';
  if (score >= 40) return '#f59e0b';
  return '#22c55e';
};

export default function GeographicIntel() {
  const [states, setStates] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    riskApi
      .getAnalyticsStates()
      .then((data) => setStates(data.states || []))
      .catch((err) => setError(err?.response?.data?.message || 'Could not load state-wise risk data.'));
  }, []);

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Geographic Intelligence" subtitle="State-level risk breakdown, sourced live from the ML risk engine." />
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
      </div>
    );
  }

  if (!states) {
    return (
      <div className="space-y-6">
        <PageHeader title="Geographic Intelligence" subtitle="State-level risk breakdown, sourced live from the ML risk engine." />
        <LoadingState rows={8} />
      </div>
    );
  }

  const sortedByRisk = [...states].sort((a, b) => b.averageRiskScore - a.averageRiskScore);
  const top15 = sortedByRisk.slice(0, 15);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader title="Geographic Intelligence" subtitle={`${states.length} states/UTs — live from the ML risk engine.`} />

      <ChartCard title="Average Risk Score by State" subtitle="Top 15 states, ranked by average AI risk score">
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={top15} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis dataKey="state" type="category" axisLine={false} tickLine={false} width={140} tick={{ fontSize: 11, fill: '#334155' }} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              formatter={(value, name) => [value, name === 'averageRiskScore' ? 'Avg Risk Score' : name]}
            />
            <Bar dataKey="averageRiskScore" radius={[0, 4, 4, 0]} barSize={18}>
              {top15.map((s, i) => <Cell key={i} fill={riskFill(s.averageRiskScore)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="All States & UTs" subtitle="Project counts and risk flags by state">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-2 pr-4">State</th>
                <th className="py-2 pr-4">Total Projects</th>
                <th className="py-2 pr-4">Avg Risk Score</th>
                <th className="py-2 pr-4">High Risk</th>
                <th className="py-2 pr-4">Critical Risk</th>
              </tr>
            </thead>
            <tbody>
              {sortedByRisk.map((s) => (
                <tr key={s.state} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2.5 pr-4 font-medium text-slate-800 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {s.state}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-600">{formatNumber(s.totalProjects)}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getRiskColor(s.averageRiskScore)}`}>
                      {s.averageRiskScore}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-orange-600 font-medium">{s.highRisk}</td>
                  <td className="py-2.5 pr-4 text-red-600 font-medium">{s.criticalRisk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
