import { useState, useEffect } from 'react';
import { riskApi } from '../../services/api';
import { PageHeader, ChartCard } from '../../components/common/UIComponents';
import { Brain, Activity, Database, CheckCircle, ShieldCheck, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatNumber } from '../../utils/formatters';

const RISK_COLORS = { LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' };

export default function RiskEngine() {
  const [summary, setSummary] = useState(null);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([riskApi.getRiskSummary(), riskApi.getAnalyticsOverview()])
      .then(([s, o]) => {
        setSummary(s);
        setOverview(o);
      })
      .catch((err) => setError(err?.response?.data?.message || 'Could not reach the risk intelligence service.'));
  }, []);

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="AI Risk Engine Status" subtitle="Monitor the health and performance of the intelligent detection models." />
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
      </div>
    );
  }

  if (!summary || !overview) return (
    <div className="p-6 animate-pulse space-y-6">
      <div className="h-8 bg-slate-200 rounded w-64" />
      <div className="grid grid-cols-4 gap-4"><div className="h-32 bg-slate-200 rounded-xl col-span-4" /></div>
    </div>
  );

  const riskDistribution = Object.entries(summary.riskDistribution).map(([label, count]) => ({ label, count }));

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="AI Risk Engine Status"
        subtitle="Live from the deployed ml_engine risk-intelligence service."
      >
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium">
          <Activity className="w-4 h-4" /> Live
        </div>
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartCard title="Detection Pipeline Architecture" subtitle="How project data is processed">
            <div className="relative pt-4">
              <div className="absolute left-8 top-12 bottom-12 w-1 bg-slate-100 z-0" />

              <div className="space-y-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Database className="w-8 h-8" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex-1">
                    <h3 className="font-bold text-slate-800 mb-1">Data Ingestion</h3>
                    <p className="text-sm text-slate-600">MPLADS sanction, expenditure, and completion records.</p>
                    <div className="mt-3 flex gap-4 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> {formatNumber(summary.totalProjects)} Records</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> Live</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="font-mono font-bold">RE</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex-1">
                    <h3 className="font-bold text-slate-800 mb-1">Rule Engine (Deterministic)</h3>
                    <p className="text-sm text-slate-600">Threshold checks on payment count, vendors-per-payment, sanction delay, and completion duration (95th-percentile cutoffs).</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="font-mono font-bold">IF</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex-1">
                    <h3 className="font-bold text-slate-800 mb-1">Isolation Forest + LOF (Unsupervised ML)</h3>
                    <p className="text-sm text-slate-600">Ensemble anomaly detection — Isolation Forest (60% weight, global outliers) blended with Local Outlier Factor (40% weight, local outliers).</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="font-mono font-bold">FR</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex-1">
                    <h3 className="font-bold text-slate-800 mb-1">Financial &amp; Statistical Engines</h3>
                    <p className="text-sm text-slate-600">Expenditure-ratio and payment-pattern anomaly scoring, independent of the ML ensemble.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Brain className="w-8 h-8" />
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-orange-900 mb-1">Unified Risk Engine</h3>
                        <p className="text-sm text-orange-800">Blends all engines into one 0–100 score per project.</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-red-600">{formatNumber(summary.highCriticalProjects)}</p>
                        <p className="text-[10px] uppercase tracking-wider text-red-500 font-bold">High + Critical</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="Engine Metrics">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-sm text-slate-600">Engine</span>
                <span className="font-mono text-xs font-semibold text-slate-800 text-right">Isolation Forest + LOF</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-sm text-slate-600">Data Source</span>
                <span className="text-sm font-semibold text-slate-800">ml_engine (live)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-sm text-slate-600">Total Scanned</span>
                <span className="text-sm font-semibold text-slate-800">{formatNumber(summary.totalProjects)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <span className="text-sm text-red-800">ML-Detected Anomalies</span>
                <span className="text-sm font-bold text-red-700">{formatNumber(overview.mlDetectedProjects)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                <span className="text-sm text-amber-800">Flagged by Multiple Engines</span>
                <span className="text-sm font-bold text-amber-700">{formatNumber(overview.multiEngineProjects)}</span>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Risk Distribution">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={riskDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {riskDistribution.map((entry, i) => (
                    <Cell key={i} fill={RISK_COLORS[entry.label] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
            <div className="flex gap-3">
              <ShieldCheck className="w-6 h-6 text-indigo-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-indigo-900 mb-1">Explainable AI</h4>
                <p className="text-sm text-indigo-800">Every flagged project's investigation report includes plain-text reasoning for full transparency and auditability — see the Investigations page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
