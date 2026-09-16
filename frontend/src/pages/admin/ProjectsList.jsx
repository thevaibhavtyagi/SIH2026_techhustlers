import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Plus, Search, Filter, Loader2 } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import RiskBadge, { StatusBadge } from '../../components/common/RiskBadge';
import { PageHeader, FilterBar, Modal } from '../../components/common/UIComponents';
import { getProjects, createProject, exportProjectsCsv } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { INDIAN_STATES } from '../../utils/constants';

const EMPTY_FORM = { state: '', district: '', constituency: '', workCategory: '', workDescription: '', sanctionAmount: '', workStatus: 'Sanctioned' };

const FILTERS = [
  { key: 'state', label: 'All States', options: INDIAN_STATES },
  { key: 'status', label: 'All Statuses', options: ['On Track', 'Delayed', 'Under Review', 'High Risk', 'Completed'] },
  { key: 'riskLevel', label: 'All Risk Levels', options: ['Low', 'Moderate', 'High', 'Critical'] },
];

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState({});
  const [search, setSearch] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    const data = await getProjects({ ...filterValues, search });
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(fetchProjects, 300);
    return () => clearTimeout(debounceTimer);
  }, [filterValues, search]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!form.state || !form.constituency || !form.workDescription) {
      setFormError('State, constituency, and work description are required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await createProject(form);
      setShowNewProject(false);
      setForm(EMPTY_FORM);
      await fetchProjects();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Could not create project.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'id', label: 'Project ID', sortable: true, render: (val) => <span className="font-mono text-xs">{val}</span> },
    { key: 'name', label: 'Project Details', sortable: true, width: '30%', render: (val, row) => (
      <div>
        <p className="font-medium text-slate-800 truncate" title={val}>{val}</p>
        <p className="text-xs text-slate-500">{row.district}, {row.state}</p>
      </div>
    ) },
    { key: 'sanctionedAmount', label: 'Funds (₹)', sortable: true, render: (val) => formatCurrency(val) },
    { key: 'progress', label: 'Progress', sortable: true, render: (val) => (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gov-blue-500 rounded-full" style={{ width: `${val}%` }} />
        </div>
        <span className="text-xs font-medium text-slate-600">{val}%</span>
      </div>
    ) },
    { key: 'status', label: 'Status', sortable: true, render: (val) => <StatusBadge status={val} /> },
    { key: 'riskScore', label: 'Risk', sortable: true, render: (val) => <RiskBadge score={val} /> },
    { key: 'sanctionDate', label: 'Sanctioned', sortable: true, render: (val) => formatDate(val) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Project Directory" 
        subtitle="Comprehensive view of all MPLADS projects across constituencies."
      >
        <button
          onClick={() => exportProjectsCsv(projects)}
          disabled={projects.length === 0}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
        <button
          onClick={() => setShowNewProject(true)}
          className="flex items-center gap-2 px-4 py-2 bg-navy-800 text-white rounded-lg text-sm font-medium hover:bg-navy-900 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </PageHeader>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible z-10 relative">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by ID, name, or location..."
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
          data={projects} 
          loading={loading}
          pageSize={10}
          onRowClick={(row) => navigate(`/admin/projects/${encodeURIComponent(row.id)}`)}
          className="border-0 shadow-none rounded-t-none"
        />
      </div>

      <Modal isOpen={showNewProject} onClose={() => { setShowNewProject(false); setFormError(null); }} title="New Project" maxWidth="max-w-lg">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <p className="text-xs text-slate-500 -mt-2">
            Manually-added projects have no AI risk score until the next ML pipeline run picks them up from the official MPLADS dataset.
          </p>
          {formError && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-200">{formError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">State *</label>
              <input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">District</label>
              <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Constituency *</label>
            <input required value={form.constituency} onChange={(e) => setForm({ ...form, constituency: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Work Description *</label>
            <textarea required rows={3} value={form.workDescription} onChange={(e) => setForm({ ...form, workDescription: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Work Category</label>
              <input value={form.workCategory} onChange={(e) => setForm({ ...form, workCategory: e.target.value })} placeholder="Normal/Others" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Sanctioned Amount (₹)</label>
              <input type="number" min="0" value={form.sanctionAmount} onChange={(e) => setForm({ ...form, sanctionAmount: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowNewProject(false); setFormError(null); }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-navy-800 text-white rounded-lg text-sm font-medium hover:bg-navy-900 disabled:opacity-60 transition-colors">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
