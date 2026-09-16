import { useState, useEffect } from 'react';
import { Search, Filter, FileText, Loader2 } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import RiskBadge from '../../components/common/RiskBadge';
import { PageHeader, FilterBar, Drawer } from '../../components/common/UIComponents';
import { riskApi } from '../../services/api';

const FILTERS = [
  { key: 'risk_level', label: 'All Risk Levels', options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
  { key: 'priority_category', label: 'All Priorities', options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
];

export default function Investigations() {
  const [investigations, setInvestigations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState({});
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvestigations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await riskApi.getInvestigations({
          limit: 50,
          riskLevel: filterValues.risk_level,
          priorityCategory: filterValues.priority_category,
        });
        setInvestigations(data.investigations || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load investigations from the risk intelligence service.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvestigations();
  }, [filterValues]);

  const filtered = search
    ? investigations.filter((i) => i.workId.toLowerCase().includes(search.toLowerCase()) || i.constituency?.toLowerCase().includes(search.toLowerCase()))
    : investigations;

  const openReport = async (row) => {
    setSelected(row);
    setReport(null);
    setReportLoading(true);
    try {
      const data = await riskApi.getInvestigationReport(row.workId);
      setReport(data);
    } catch {
      setReport({ error: true });
    } finally {
      setReportLoading(false);
    }
  };

  const columns = [
    { key: 'rank', label: 'Rank', sortable: true, render: (v) => <span className="font-mono text-xs">#{v}</span> },
    { key: 'workId', label: 'Work ID', sortable: true, render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'constituency', label: 'Location', sortable: true, render: (v, row) => <span>{v || '—'}, {row.state}</span> },
    { key: 'riskScore', label: 'Risk Score', sortable: true, render: (v, row) => <RiskBadge score={Math.round(v ?? 0)} /> },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'primarySignal', label: 'Primary Signal', render: (v) => <span className="text-xs text-slate-600">{v || '—'}</span> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Investigations"
        subtitle={`Live from the ML risk-intelligence engine — ${total.toLocaleString('en-IN')} flagged for investigation.`}
      />

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible z-10 relative">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by work ID or constituency..."
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
          onRowClick={openReport}
          className="border-0 shadow-none rounded-t-none"
        />
      </div>

      <Drawer isOpen={!!selected} onClose={() => setSelected(null)} title={selected ? `Investigation Report — ${selected.workId}` : ''}>
        {reportLoading && (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}
        {!reportLoading && report?.error && (
          <p className="text-sm text-red-600">Could not load this investigation report.</p>
        )}
        {!reportLoading && report && !report.error && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Risk Score</p>
                <p className="font-semibold text-slate-800">{report.riskScore ?? '—'} ({report.riskLevel ?? '—'})</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Priority</p>
                <p className="font-semibold text-slate-800">{report.priority ?? '—'}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Location</p>
                <p className="font-semibold text-slate-800">{report.constituency}, {report.state}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Detection Confidence</p>
                <p className="font-semibold text-slate-800">{report.confidence ?? '—'}</p>
              </div>
            </div>
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                <FileText className="w-4 h-4" /> AI-Grounded Investigation Report
              </h4>
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {report.report || 'No narrative report has been generated for this work yet.'}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
