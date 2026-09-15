import { useState, useEffect } from 'react';
import { getAlerts, getProjects } from '../../services/api';
import { PageHeader, FilterBar } from '../../components/common/UIComponents';
import DataTable from '../../components/common/DataTable';
import { StatusBadge, SeverityBadge } from '../../components/common/RiskBadge';
import { ShieldAlert, AlertTriangle, CheckCircle, Search, Filter } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const FILTERS = [
  { key: 'severity', label: 'All Severities', options: ['Critical', 'High', 'Medium', 'Low'] },
  { key: 'category', label: 'All Categories', options: ['Financial', 'Progress', 'Contractor', 'Documentation'] },
  { key: 'status', label: 'All Statuses', options: ['New', 'Assigned', 'Investigating', 'Resolved'] },
];

export default function AlertsList() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      const data = await getAlerts(filterValues);
      
      let filtered = data;
      if (search) {
        const s = search.toLowerCase();
        filtered = data.filter(a => 
          a.projectId.toLowerCase().includes(s) || 
          a.description.toLowerCase().includes(s) ||
          a.id.toLowerCase().includes(s)
        );
      }
      
      setAlerts(filtered);
      setLoading(false);
    };
    fetchAlerts();
  }, [filterValues, search]);

  const columns = [
    { key: 'id', label: 'Alert ID', render: (val) => <span className="font-mono text-xs">{val}</span> },
    { key: 'projectId', label: 'Project ID', render: (val) => <span className="font-mono text-xs font-semibold text-slate-700">{val}</span> },
    { key: 'description', label: 'Description', width: '40%', render: (val) => <span className="text-sm text-slate-700 truncate block max-w-md" title={val}>{val}</span> },
    { key: 'category', label: 'Category', render: (val) => <span className="text-sm font-medium text-slate-600">{val}</span> },
    { key: 'severity', label: 'Severity', render: (val) => <SeverityBadge severity={val} /> },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'timestamp', label: 'Detected On', render: (val) => formatDate(val) },
  ];

  const criticalCount = alerts.filter(a => a.severity === 'Critical').length;
  const highCount = alerts.filter(a => a.severity === 'High').length;
  const newCount = alerts.filter(a => a.status === 'New').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Anomaly & Risk Alerts" 
        subtitle="AI-detected anomalies requiring review or investigation."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-800 mb-1">Critical Anomalies</p>
            <p className="text-2xl font-bold text-red-900">{criticalCount}</p>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-orange-800 mb-1">High Risk Alerts</p>
            <p className="text-2xl font-bold text-orange-900">{highCount}</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800 mb-1">Unassigned (New)</p>
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
              placeholder="Search alerts or project IDs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-1 focus:ring-gov-blue-500/30"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden lg:block" />
            <FilterBar 
              filters={FILTERS} 
              values={filterValues} 
              onChange={setFilterValues}
              className="flex-1 md:flex-initial"
            />
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={alerts} 
          loading={loading}
          pageSize={10}
          className="border-0 shadow-none rounded-t-none"
        />
      </div>
    </div>
  );
}
