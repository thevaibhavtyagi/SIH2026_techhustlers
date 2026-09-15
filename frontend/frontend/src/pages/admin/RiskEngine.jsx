import { useState, useEffect } from 'react';
import { getRiskAnalysis } from '../../services/api';
import { PageHeader, ChartCard, ProgressBar } from '../../components/common/UIComponents';
import { Brain, Activity, Database, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function RiskEngine() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getRiskAnalysis().then(setData);
  }, []);

  if (!data) return (
    <div className="p-6 animate-pulse space-y-6">
      <div className="h-8 bg-slate-200 rounded w-64" />
      <div className="grid grid-cols-4 gap-4"><div className="h-32 bg-slate-200 rounded-xl col-span-4" /></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader 
        title="AI Risk Engine Status" 
        subtitle="Monitor the health and performance of the intelligent detection models."
      >
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium">
          <Activity className="w-4 h-4" /> System Healthy
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
                    <p className="text-sm text-slate-600">Continuous sync from 36 state registries, financials, and progress reports.</p>
                    <div className="mt-3 flex gap-4 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> {data.modelHealth.projectsScanned} Records</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> Real-time</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="font-mono font-bold">RE</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800 mb-1">Rule Engine (Deterministic)</h3>
                        <p className="text-sm text-slate-600">{data.pipeline.ruleEngine.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-800">{data.pipeline.ruleEngine.flagged}</p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Flags</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="font-mono font-bold">IF</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800 mb-1">Isolation Forest (Unsupervised ML)</h3>
                        <p className="text-sm text-slate-600">{data.pipeline.isolationForest.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-800">{data.pipeline.isolationForest.outliers}</p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Anomalies</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="font-mono font-bold">RF</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800 mb-1">Random Forest (Supervised ML)</h3>
                        <p className="text-sm text-slate-600">{data.pipeline.randomForest.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-800">{data.pipeline.randomForest.predicted}</p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Predictions</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-600">Model Accuracy</span>
                        <span className="font-bold text-green-600">{data.pipeline.randomForest.accuracy}%</span>
                      </div>
                      <ProgressBar value={data.pipeline.randomForest.accuracy} color="green" showLabel={false} />
                    </div>
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
                        <p className="text-sm text-orange-800">{data.pipeline.riskEngine.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-red-600">{data.pipeline.riskEngine.highRisk}</p>
                        <p className="text-[10px] uppercase tracking-wider text-red-500 font-bold">Critical</p>
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
                <span className="text-sm text-slate-600">Engine Version</span>
                <span className="font-mono text-sm font-semibold text-slate-800">{data.modelHealth.version}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-sm text-slate-600">Last Sync</span>
                <span className="text-sm font-semibold text-slate-800">2 mins ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-sm text-slate-600">Total Scanned</span>
                <span className="text-sm font-semibold text-slate-800">{data.modelHealth.projectsScanned.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <span className="text-sm text-red-800">Total Anomalies</span>
                <span className="text-sm font-bold text-red-700">{data.modelHealth.anomaliesDetected.toLocaleString()}</span>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Risk Distribution">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.riskDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="range" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {data.riskDistribution.map((entry, i) => (
                    <Cell key={i} fill={
                      entry.label === 'Critical' ? '#ef4444' :
                      entry.label === 'High' ? '#f97316' :
                      entry.label === 'Moderate' ? '#f59e0b' : '#22c55e'
                    } />
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
                <p className="text-sm text-indigo-800">All risk scores generated by the engine include plain-text reasoning for full transparency and auditability.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Clock({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
