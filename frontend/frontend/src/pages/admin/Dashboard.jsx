import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, IndianRupee, AlertTriangle, TrendingUp, CheckCircle, ShieldAlert, Brain, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import KPICard from '../../components/common/KPICard';
import RiskBadge from '../../components/common/RiskBadge';
import { StatusBadge } from '../../components/common/RiskBadge';
import { PageHeader, ChartCard, AIInsightCard } from '../../components/common/UIComponents';
import IndiaRiskMap from '../../components/maps/IndiaRiskMap';
import { getDashboardStats, getAlerts } from '../../services/api';
import { formatCurrency, timeAgo } from '../../utils/formatters';

const expenditureTrend = [
  { month: 'Apr', sanctioned: 720, utilized: 480 }, { month: 'May', sanctioned: 740, utilized: 520 },
  { month: 'Jun', sanctioned: 710, utilized: 550 }, { month: 'Jul', sanctioned: 680, utilized: 510 },
  { month: 'Aug', sanctioned: 730, utilized: 560 }, { month: 'Sep', sanctioned: 750, utilized: 620 },
  { month: 'Oct', sanctioned: 720, utilized: 580 }, { month: 'Nov', sanctioned: 700, utilized: 600 },
  { month: 'Dec', sanctioned: 740, utilized: 630 }, { month: 'Jan', sanctioned: 760, utilized: 650 },
  { month: 'Feb', sanctioned: 720, utilized: 640 }, { month: 'Mar', sanctioned: 672, utilized: 641 },
];

const statusDist = [
  { name: 'On Track', value: 7489, color: '#22c55e' },
  { name: 'Delayed', value: 3245, color: '#f59e0b' },
  { name: 'Completed', value: 1564, color: '#3b82f6' },
  { name: 'High Risk', value: 184, color: '#ef4444' },
];

const riskDist = [
  { range: '0-20', count: 5842, fill: '#22c55e' }, { range: '21-40', count: 3245, fill: '#86efac' },
  { range: '41-60', count: 2104, fill: '#f59e0b' }, { range: '61-75', count: 1107, fill: '#f97316' },
  { range: '76-100', count: 184, fill: '#ef4444' },
];

const topRiskProjects = [
  { id: 'MPLAD-12876', name: 'Flyover, Gorakhpur', risk: 91, state: 'UP' },
  { id: 'MPLAD-14890', name: 'Embankment, Patna', risk: 88, state: 'Bihar' },
  { id: 'MPLAD-10482', name: 'Rural Road, Varanasi', risk: 87, state: 'UP' },
  { id: 'MPLAD-24789', name: 'Bridge Repair, Kolkata', risk: 85, state: 'WB' },
  { id: 'MPLAD-19345', name: 'Embankment, Guwahati', risk: 84, state: 'Assam' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStats('admin').then(setStats);
    getAlerts().then(a => setAlerts(a.slice(0, 5)));
  }, []);

  if (!stats) return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-slate-100 rounded w-64" />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ministry Command Center"
        subtitle="National MPLADS project monitoring, risk intelligence and early-warning overview."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard icon={BarChart3} label="Total Projects" value={stats.totalProjects} color="blue" trend={4.2} />
        <KPICard icon={IndianRupee} label="Total Funds" value={8642} prefix="₹" suffix=" Cr" color="indigo" trend={8.1} />
        <KPICard icon={TrendingUp} label="Utilized Funds" value={6981} prefix="₹" suffix=" Cr" color="green" trend={12.4} />
        <KPICard icon={AlertTriangle} label="High-Risk Alerts" value={stats.highRiskAlerts} color="red" trend={-6.3} />
        <KPICard icon={ShieldAlert} label="Est. Leakage" value={312} prefix="₹" suffix=" Cr" color="amber" trend={-2.1} />
        <KPICard icon={CheckCircle} label="Completion Rate" value={stats.completionRate} suffix="%" color="green" trend={3.8} />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* India Map - takes 2 cols */}
        <div className="lg:col-span-2">
          <ChartCard title="India Risk Intelligence Map" subtitle="Click any state for detailed analysis">
            <IndiaRiskMap />
          </ChartCard>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* AI Insight */}
          <AIInsightCard title="AI Insight of the Day">
            <p className="text-sm text-slate-700 mb-2">
              <strong>Uttar Pradesh</strong> has the highest concentration of high-risk projects (73) with a state risk index of 78. Bihar follows closely with 68 high-risk projects.
            </p>
            <p className="text-xs text-slate-500">
              Fiscal year-end payment clustering detected in 12% of Bihar projects — recommend targeted audit.
            </p>
          </AIInsightCard>

          {/* Top Risk Projects */}
          <ChartCard title="Top High-Risk Projects" subtitle="Highest AI risk scores">
            <div className="space-y-3">
              {topRiskProjects.map(p => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/admin/projects/${p.id}`)}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.id} • {p.state}</p>
                  </div>
                  <RiskBadge score={p.risk} size="sm" />
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Expenditure Trend */}
        <ChartCard title="Expenditure Trend" subtitle="Monthly sanctioned vs utilized (₹ Cr)">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={expenditureTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Area type="monotone" dataKey="sanctioned" stroke="#2C5282" fill="#2C5282" fillOpacity={0.1} name="Sanctioned" />
              <Area type="monotone" dataKey="utilized" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} name="Utilized" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Status Distribution */}
        <ChartCard title="Project Status Distribution" subtitle="Current status breakdown">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusDist} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                {statusDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Legend formatter={(val) => <span className="text-xs text-slate-600">{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Risk Distribution */}
        <ChartCard title="Risk Score Distribution" subtitle="Projects by risk range">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={riskDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Bar dataKey="count" name="Projects" radius={[4, 4, 0, 0]}>
                {riskDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <ChartCard
          title="Recent Alerts"
          subtitle="Latest AI-generated risk alerts"
          action={<button onClick={() => navigate('/admin/alerts')} className="text-xs text-gov-blue-600 hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></button>}
        >
          <div className="space-y-3">
            {alerts.map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate('/admin/alerts')}>
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                  a.severity === 'Critical' ? 'bg-red-100 text-red-600' : a.severity === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{a.description.substring(0, 80)}...</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.projectId} • {timeAgo(a.timestamp)}</p>
                </div>
                <StatusBadge status={a.status} size="sm" />
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Detection Pipeline */}
        <ChartCard title="AI Detection Pipeline Summary" subtitle="Three-stage intelligence processing">
          <div className="space-y-4">
            {[
              { label: 'Rule Engine', desc: 'Duplicate & consistency checks', scanned: '12,482', flagged: '342', color: 'bg-blue-500' },
              { label: 'Isolation Forest', desc: 'Statistical outlier detection', scanned: '12,482', flagged: '218', color: 'bg-purple-500' },
              { label: 'Random Forest', desc: 'Extreme delay prediction', scanned: '12,482', flagged: '156', color: 'bg-indigo-500' },
              { label: 'Risk Engine', desc: 'Unified 0–100 scoring', scanned: '12,482', flagged: '184', color: 'bg-orange-500' },
            ].map((stage, i) => (
              <div key={stage.label} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${stage.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-800">{stage.label}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500">Scanned: {stage.scanned}</span>
                      <span className="font-semibold text-red-600">Flagged: {stage.flagged}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{stage.desc}</p>
                </div>
              </div>
            ))}
            <button onClick={() => navigate('/admin/risk-engine')} className="w-full text-center text-sm text-gov-blue-600 font-medium py-2 hover:bg-slate-50 rounded-lg flex items-center justify-center gap-1">
              <Brain className="w-4 h-4" /> View Full AI Risk Engine <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
