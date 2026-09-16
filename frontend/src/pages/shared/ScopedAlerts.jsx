import { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/common/DataTable';
import RiskBadge from '../../components/common/RiskBadge';
import { PageHeader } from '../../components/common/UIComponents';
import { riskApi } from '../../services/api';

// Reused for MP "Alerts" (scoped by constituency) and District "Local Alerts"
// (scoped by district). Data comes from riskApi.getInvestigations — the real
// source of flagged/alert data. Step 8 backend enforces the data-level scope
// for each role automatically based on their JWT claims.
export default function ScopedAlerts({ scopeField, title, subtitle }) {
  const { user } = useAuth();
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    riskApi.getInvestigations({ limit: 50 })
      .then((data) => {
        setInvestigations(data?.investigations || []);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Could not load risk flags.');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const criticalCount = investigations.filter((i) => i.riskLevel === 'CRITICAL').length;
  const highCount = investigations.filter((i) => i.riskLevel === 'HIGH').length;
  const pendingCount = investigations.filter((i) => !i.reportStatus || i.reportStatus === 'pending').length;

  const columns = [
    { key: 'workId', label: 'Work ID', render: (v) => <span className="font-mono text-xs font-semibold text-slate-700">{v}</span> },
    { key: 'primarySignal', label: 'Primary Signal', width: '40%', render: (v) => (
      <span className="text-sm text-slate-700 truncate block max-w-md" title={v}>{v || '—'}</span>
    ) },
    { key: 'riskLevel', label: 'Risk Level', render: (v) => (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
        v === 'CRITICAL' ? 'bg-red-100 text-red-700' :
        v === 'HIGH' ? 'bg-orange-100 text-orange-700' :
        v === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
        'bg-green-100 text-green-700'
      }`}>{v}</span>
    ) },
    { key: 'riskScore', label: 'Risk Score', sortable: true, render: (v) => <RiskBadge score={Math.round(v ?? 0)} /> },
    { key: 'priority', label: 'Priority', render: (v) => <span className="text-sm font-medium text-slate-600">{v || '—'}</span> },
    { key: 'state', label: 'State', render: (v) => <span className="text-sm text-slate-600">{v || '—'}</span> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={title} subtitle={subtitle} />

      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg"><ShieldAlert className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-red-800 mb-1">Critical</p>
            <p className="text-2xl font-bold text-red-900">{criticalCount}</p>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-orange-800 mb-1">High Risk</p>
            <p className="text-2xl font-bold text-orange-900">{highCount}</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><CheckCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-blue-800 mb-1">Pending Report</p>
            <p className="text-2xl font-bold text-blue-900">{pendingCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={investigations} loading={loading} pageSize={10} className="border-0 shadow-none" />
      </div>
    </div>
  );
}
