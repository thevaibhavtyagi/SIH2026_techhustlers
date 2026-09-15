import { useState, useEffect } from 'react';
import { HardHat } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { PageHeader, ProgressBar } from '../../components/common/UIComponents';
import { getContractors } from '../../services/api';

// ml_engine's dataset has no contractor entity (only implementing agencies and
// MP names), so this view is backed by the same demo contractor data used on
// the Project Detail page's "Contractor Profile" panel.
export default function Contractors() {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContractors().then((data) => {
      setContractors(data);
      setLoading(false);
    });
  }, []);

  const columns = [
    { key: 'name', label: 'Contractor', sortable: true, render: (v, row) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
          <HardHat className="w-4 h-4 text-slate-500" />
        </div>
        <div>
          <p className="font-medium text-slate-800">{v}</p>
          <p className="text-xs text-slate-500">{row.id} • {row.state}</p>
        </div>
      </div>
    ) },
    { key: 'activeProjects', label: 'Active', sortable: true },
    { key: 'completedProjects', label: 'Completed', sortable: true },
    { key: 'riskScore', label: 'Risk Score', sortable: true, width: '18%', render: (v) => (
      <div className="flex items-center gap-2 w-32">
        <ProgressBar value={v} color="auto" showLabel={false} />
        <span className="text-xs font-semibold w-8">{v}</span>
      </div>
    ) },
    { key: 'delayRate', label: 'Delay Rate', sortable: true, render: (v) => (
      <span className={v > 30 ? 'text-red-600 font-semibold' : 'text-slate-700'}>{v}%</span>
    ) },
    { key: 'avgDelayDays', label: 'Avg Delay', sortable: true, render: (v) => `${v}d` },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Contractors" subtitle="Executing-agency directory, performance scores, and delay history." />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={contractors} loading={loading} pageSize={15} className="border-0 shadow-none" />
      </div>
    </div>
  );
}
