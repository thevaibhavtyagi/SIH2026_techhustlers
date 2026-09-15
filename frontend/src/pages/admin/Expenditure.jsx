import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { PageHeader, FilterBar } from '../../components/common/UIComponents';
import { riskApi } from '../../services/api';
import { formatCurrencyFull, formatPercentage } from '../../utils/formatters';
import { INDIAN_STATES } from '../../utils/constants';

const FILTERS = [{ key: 'state', label: 'All States', options: INDIAN_STATES }];

export default function Expenditure() {
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState({});
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await riskApi.getProjects({ limit: 50, state: filterValues.state });
        setProjects(data.projects || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load expenditure data from the risk intelligence service.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [filterValues]);

  const filtered = search
    ? projects.filter((p) => p.work_id.toLowerCase().includes(search.toLowerCase()) || p.work_description?.toLowerCase().includes(search.toLowerCase()))
    : projects;

  const columns = [
    { key: 'work_id', label: 'Work ID', sortable: true, render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'work_description', label: 'Project', width: '28%', render: (v, row) => (
      <div>
        <p className="text-sm text-slate-800 truncate max-w-xs" title={v}>{v || '—'}</p>
        <p className="text-xs text-slate-500">{row.constituency}, {row.state}</p>
      </div>
    ) },
    { key: 'sanction_amount', label: 'Sanctioned', sortable: true, render: (v) => formatCurrencyFull(v) },
    { key: 'total_expenditure', label: 'Expenditure', sortable: true, render: (v) => v == null ? '—' : formatCurrencyFull(v) },
    { key: 'expenditure_ratio', label: 'Utilization', sortable: true, render: (v) => v == null ? '—' : (
      <span className={v > 1 ? 'text-red-600 font-semibold' : 'text-slate-700'}>{formatPercentage(v * 100)}</span>
    ) },
    { key: 'financial_risk_score', label: 'Financial Risk', sortable: true, render: (v) => v == null ? '—' : Math.round(v) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Expenditure"
        subtitle={`Live sanctioned vs. actual expenditure per project — ${total.toLocaleString('en-IN')} projects tracked.`}
      />

      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible z-10 relative">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by work ID or description..."
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

        <DataTable columns={columns} data={filtered} loading={loading} pageSize={15} className="border-0 shadow-none rounded-t-none" />
      </div>
    </div>
  );
}
