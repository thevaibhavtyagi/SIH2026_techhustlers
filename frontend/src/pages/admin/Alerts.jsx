import { useState, useEffect } from 'react';
import { riskApi } from '../../services/api';
import { PageHeader, FilterBar } from '../../components/common/UIComponents';
import DataTable from '../../components/common/DataTable';
import RiskBadge from '../../components/common/RiskBadge';
import { ShieldAlert, AlertTriangle, CheckCircle, Search, Filter } from 'lucide-react';

// Alerts are sourced directly from the ML investigation pipeline.
// There is no dedicated /api/alerts endpoint — investigations are the canonical
// source of flagged/anomaly data. Filters map to investigation API params.
const FILTERS = [
  { key: 'risk_level', label: 'All Risk Levels', options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
  { key: 'priority_category', label: 'All Priorities', options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
];

export default function AlertsList() {
  const [investigations, setInvestigations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState({});
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlags = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await riskApi.getInvestigations({
          limit: 100,
          riskLevel: filterValues.risk_level,
          priorityCategory: filterValues.priority_category,
        });
        setInvestigations(data?.investigations || []);
        setTotal(data?.total || 0);
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load anomaly flags from the risk intelligence service.');
      } finally {
        setLoading(false);
      }
    };
    fetchFlags();
  }, [filterValues]);

  const filtered = search
    ? investigations.filter((i) =>
        (i.workId || '').toLowerCase().includes(search.toLowerCase()) ||
        (i.primarySignal || '').toLowerCase().includes(search.toLowerCase()) ||
        (i.state || '').toLowerCase().includes(search.toLowerCase())
      )
    : investigations;

  const criticalCount = investigations.filter((i) => i.riskLevel === 'CRITICAL').length;
  const highCount = investigations.filter((i) => i.riskLevel === 'HIGH').length;
  const newCount = investigations.filter((i) => !i.reportStatus || i.reportStatus === 'pending').length;

  const columns = [
    { key: 'rank', label: 'Rank', render: (v) => <span className="font-mono text-xs">#{v}</span> },
    { key: 'workId', label: 'Work ID / Project', render: (v, row) => (
      <div>
        <p className="font-mono text-xs font-semibold text-slate-700">{v}</p>
        <p className="text-xs text-slate-500">{row.constituency || '—'}, {row.state || '—'}</p>
      </div>
    ) },
    { key: 'primarySignal', label: 'Primary Signal', width: '35%', render: (v) => (
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
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Anomaly & Risk Alerts"
        subtitle={`ML-flagged projects requiring review — ${total.toLocaleString('en-IN')} total investigations.`}
      />

      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg"><ShieldAlert className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-red-800 mb-1">Critical Risk</p>
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
            <p className="text-2xl font-bold text-blue-900">{newCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible z-10 relative">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by work ID, signal, or state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-1 focus:ring-gov-blue-500/30"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden lg:block" />
            <FilterBar filters={FILTERS} values={filterValues} onChange={setFilterValues} className="flex-1 md:flex-initial" />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          pageSize={15}
          className="border-0 shadow-none rounded-t-none"
        />
      </div>
    </div>
  );
}
