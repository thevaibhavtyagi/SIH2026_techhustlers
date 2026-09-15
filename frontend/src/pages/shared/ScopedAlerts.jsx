import { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/common/DataTable';
import { StatusBadge, SeverityBadge } from '../../components/common/RiskBadge';
import { PageHeader } from '../../components/common/UIComponents';
import { getAlerts } from '../../services/api';
import { formatDate } from '../../utils/formatters';

// Reused for MP "Alerts" (scoped by constituency) and District "Local Alerts"
// (scoped by district). getAlerts only natively supports constituency
// filtering, so district scoping is applied client-side against the
// constituency-joined mock alert set.
export default function ScopedAlerts({ scopeField, title, subtitle }) {
  const { user } = useAuth();
  const scopeValue = user?.[scopeField];
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scopeValue) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getAlerts(scopeField === 'constituency' ? { constituency: scopeValue } : { district: scopeValue }).then((data) => {
      setAlerts(data);
      setLoading(false);
    });
  }, [scopeField, scopeValue]);

  const columns = [
    { key: 'id', label: 'Alert ID', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'projectId', label: 'Project ID', render: (v) => <span className="font-mono text-xs font-semibold text-slate-700">{v}</span> },
    { key: 'description', label: 'Description', width: '40%', render: (v) => <span className="text-sm text-slate-700 truncate block max-w-md" title={v}>{v}</span> },
    { key: 'category', label: 'Category', render: (v) => <span className="text-sm font-medium text-slate-600">{v}</span> },
    { key: 'severity', label: 'Severity', render: (v) => <SeverityBadge severity={v} /> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'timestamp', label: 'Detected On', render: (v) => formatDate(v) },
  ];

  const criticalCount = alerts.filter((a) => a.severity === 'Critical').length;
  const highCount = alerts.filter((a) => a.severity === 'High').length;
  const newCount = alerts.filter((a) => a.status === 'New').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={title} subtitle={subtitle} />

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
            <p className="text-sm font-medium text-blue-800 mb-1">Unassigned (New)</p>
            <p className="text-2xl font-bold text-blue-900">{newCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={alerts} loading={loading} pageSize={10} className="border-0 shadow-none" />
      </div>
    </div>
  );
}
