import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/common/DataTable';
import RiskBadge, { StatusBadge } from '../../components/common/RiskBadge';
import { PageHeader, FilterBar } from '../../components/common/UIComponents';
import { getProjects } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const FILTERS = [
  { key: 'status', label: 'All Statuses', options: ['On Track', 'Delayed', 'Under Review', 'High Risk', 'Completed'] },
  { key: 'riskLevel', label: 'All Risk Levels', options: ['Low', 'Moderate', 'High', 'Critical'] },
];

// Reused for "My Projects" / "Progress" (MP, scoped by constituency) and
// "District Projects" (District Authority, scoped by district).
export default function ScopedProjects({ scopeField, title, subtitle }) {
  const { user } = useAuth();
  const scopeValue = user?.[scopeField];
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!scopeValue) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const debounce = setTimeout(() => {
      getProjects({ [scopeField]: scopeValue, ...filterValues, search }).then((data) => {
        setProjects(data);
        setLoading(false);
      });
    }, 250);
    return () => clearTimeout(debounce);
  }, [scopeField, scopeValue, filterValues, search]);

  const columns = [
    { key: 'id', label: 'Project ID', sortable: true, render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'name', label: 'Project Details', sortable: true, width: '30%', render: (v, row) => (
      <div>
        <p className="font-medium text-slate-800 truncate" title={v}>{v}</p>
        <p className="text-xs text-slate-500">{row.workType}</p>
      </div>
    ) },
    { key: 'sanctionedAmount', label: 'Funds (₹)', sortable: true, render: (v) => formatCurrency(v) },
    { key: 'progress', label: 'Progress', sortable: true, render: (v) => (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gov-blue-500 rounded-full" style={{ width: `${v}%` }} />
        </div>
        <span className="text-xs font-medium text-slate-600">{v}%</span>
      </div>
    ) },
    { key: 'status', label: 'Status', sortable: true, render: (v) => <StatusBadge status={v} /> },
    { key: 'riskScore', label: 'Risk', sortable: true, render: (v) => <RiskBadge score={v} /> },
    { key: 'sanctionDate', label: 'Sanctioned', sortable: true, render: (v) => formatDate(v) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={title} subtitle={subtitle} />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible z-10 relative">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID or name..."
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

        <DataTable columns={columns} data={projects} loading={loading} pageSize={10} className="border-0 shadow-none rounded-t-none" />
      </div>
    </div>
  );
}
