import { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import KPICard from '../../components/common/KPICard';
import { PageHeader, ChartCard, LoadingState } from '../../components/common/UIComponents';
import { getProjects } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

export default function Funds() {
  const { user } = useAuth();
  const [projects, setProjects] = useState(null);

  useEffect(() => {
    if (!user?.constituency) return;
    getProjects({ constituency: user.constituency }).then(setProjects);
  }, [user]);

  if (!projects) return <div className="p-6"><LoadingState rows={6} /></div>;

  const totalSanctioned = projects.reduce((s, p) => s + p.sanctionedAmount, 0);
  const totalExpenditure = projects.reduce((s, p) => s + p.expenditure, 0);
  const remaining = Math.max(totalSanctioned - totalExpenditure, 0);
  const utilizationRate = totalSanctioned ? Math.round((totalExpenditure / totalSanctioned) * 100) : 0;

  const topFunded = [...projects]
    .sort((a, b) => b.sanctionedAmount - a.sanctionedAmount)
    .slice(0, 8)
    .map((p) => ({ name: p.id, Sanctioned: Math.round(p.sanctionedAmount / 100000), Expenditure: Math.round(p.expenditure / 100000) }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Funds" subtitle={`Fund allocation, release, and utilization for ${user.constituency}.`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={IndianRupee} label="Total Sanctioned" value={totalSanctioned / 100000} prefix="₹" suffix=" L" color="indigo" />
        <KPICard icon={TrendingUp} label="Total Expenditure" value={totalExpenditure / 100000} prefix="₹" suffix=" L" color="blue" />
        <KPICard icon={Wallet} label="Remaining Balance" value={remaining / 100000} prefix="₹" suffix=" L" color="green" />
        <KPICard icon={IndianRupee} label="Utilization Rate" value={utilizationRate} suffix="%" color={utilizationRate > 100 ? 'red' : 'amber'} />
      </div>

      <ChartCard title="Top Funded Projects" subtitle="Sanctioned vs. expenditure (₹ Lakh)">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={topFunded}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} formatter={(v) => `₹${v} L`} />
            <Bar dataKey="Sanctioned" fill="#2C5282" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Expenditure" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="All Projects — Funds Breakdown">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-2 pr-4">Project</th>
                <th className="py-2 pr-4">Sanctioned</th>
                <th className="py-2 pr-4">Expenditure</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2.5 pr-4">
                    <p className="font-medium text-slate-800 truncate max-w-xs">{p.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{p.id}</p>
                  </td>
                  <td className="py-2.5 pr-4 text-slate-700">{formatCurrency(p.sanctionedAmount)}</td>
                  <td className={`py-2.5 pr-4 font-medium ${p.expenditure > p.sanctionedAmount ? 'text-red-600' : 'text-slate-700'}`}>
                    {formatCurrency(p.expenditure)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
