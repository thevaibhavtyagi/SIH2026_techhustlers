import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, IndianRupee, Calendar, FileText, ShieldAlert, CheckCircle } from 'lucide-react';
import { getProjectById } from '../../services/api';
import RiskBadge, { StatusBadge } from '../../components/common/RiskBadge';
import RiskScoreRing from '../../components/common/RiskScoreRing';
import { PageHeader, ChartCard, ProgressBar, LoadingState, AIInsightCard } from '../../components/common/UIComponents';
import { formatCurrency, formatDate, getRiskLevel } from '../../utils/formatters';

export default function ProjectDetail() {
  const { id: rawId } = useParams();
  // Work IDs can contain slashes (e.g. WS/MP352/2025-2026/135862).
  // React Router captures them via /:id(.*) and we decode here.
  const id = decodeURIComponent(rawId ?? '');
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await getProjectById(id);
        setProject(p);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404) {
          setError('not_found');
        } else if (status === 403) {
          setError('forbidden');
        } else {
          setError(err?.response?.data?.message || 'Could not load project details.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return (
    <div className="p-6"><LoadingState rows={8} /></div>
  );

  if (error === 'not_found') return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Project Not Found</h2>
      <p className="text-slate-500 mb-6">The project ID <span className="font-mono">{id}</span> does not exist in the system.</p>
      <button onClick={() => navigate('/admin/projects')} className="bg-navy-800 text-white px-5 py-2 rounded-lg">Return to Projects</button>
    </div>
  );

  if (error === 'forbidden') return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
      <p className="text-slate-500 mb-6">This project is outside your authorized scope.</p>
      <button onClick={() => navigate('/admin/projects')} className="bg-navy-800 text-white px-5 py-2 rounded-lg">Return to Projects</button>
    </div>
  );

  if (error) return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin/projects')} className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>
      <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
    </div>
  );

  if (!project) return null;

  const isHighRisk = (project.riskScore ?? 0) >= 75;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/admin/projects')} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800 font-mono">{project.id}</h1>
          <StatusBadge status={project.status} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800 mb-2">{project.name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-6">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {project.district}, {project.state}</span>
              <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-slate-400" /> {project.workType || '—'}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> Sanctioned: {formatDate(project.sanctionDate)}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Sanctioned Amount</p>
                <p className="font-semibold text-slate-800">{formatCurrency(project.sanctionedAmount)}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Expenditure</p>
                <p className={`font-semibold ${project.expenditure > project.sanctionedAmount ? 'text-red-600' : 'text-slate-800'}`}>
                  {formatCurrency(project.expenditure)}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Physical Progress</p>
                <p className="font-semibold text-slate-800">{project.progress ?? 0}%</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Expected Completion</p>
                <p className="font-semibold text-slate-800">{formatDate(project.expectedCompletion)}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100 lg:w-64">
            <h3 className="text-sm font-semibold text-slate-600 mb-4 uppercase tracking-wider">AI Risk Score</h3>
            <RiskScoreRing score={project.riskScore ?? 0} size={140} strokeWidth={12} />
            <p className="text-xs text-slate-500 mt-4 text-center">Live from the ML risk intelligence engine</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column — AI insight + extra ML fields */}
        <div className="lg:col-span-2 space-y-6">

          {isHighRisk && (
            <AIInsightCard title="AI Risk Explanation">
              <div className="space-y-3">
                <p>The AI Risk Engine has flagged this project with a score of <strong>{project.riskScore}/100 ({getRiskLevel(project.riskScore)})</strong>. Key contributing factors:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  {project.expenditure > project.sanctionedAmount && (
                    <li><span className="font-medium text-red-700">Cost Overrun:</span> Expenditure is {(((project.expenditure - project.sanctionedAmount) / project.sanctionedAmount) * 100).toFixed(1)}% above sanctioned amount.</li>
                  )}
                  {(project.progress ?? 0) < 30 && (
                    <li><span className="font-medium text-red-700">Severely Delayed Progress:</span> Only {project.progress ?? 0}% completed despite significant time elapsed.</li>
                  )}
                  {project.ensembleRiskLevel && (project.ensembleRiskLevel === 'HIGH' || project.ensembleRiskLevel === 'CRITICAL') && (
                    <li><span className="font-medium text-amber-700">ML Ensemble Flag:</span> Isolation Forest + LOF ensemble classified this project as <strong>{project.ensembleRiskLevel}</strong> risk.</li>
                  )}
                  {project.financialRiskScore != null && project.financialRiskScore > 70 && (
                    <li><span className="font-medium text-amber-700">Financial Anomaly:</span> Financial risk sub-score is {Math.round(project.financialRiskScore)}/100 — payment pattern anomaly detected.</li>
                  )}
                </ul>
                <div className="mt-4 pt-3 border-t border-indigo-100/50 flex items-center justify-between">
                  <span className="text-xs font-medium text-indigo-700">Recommendation: Initiate Investigation</span>
                  <button
                    onClick={() => navigate('/admin/investigations')}
                    className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
                  >
                    View Investigations
                  </button>
                </div>
              </div>
            </AIInsightCard>
          )}

          {/* ML Signals */}
          <ChartCard title="ML Risk Signals" subtitle="Sub-scores from the AI detection pipeline">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Financial Risk Sub-Score</p>
                <p className="font-semibold text-slate-800">
                  {project.financialRiskScore != null ? `${Math.round(project.financialRiskScore)}/100` : '—'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">ML Ensemble Risk Level</p>
                <p className={`font-semibold ${
                  project.ensembleRiskLevel === 'CRITICAL' ? 'text-red-600' :
                  project.ensembleRiskLevel === 'HIGH' ? 'text-orange-600' :
                  'text-slate-800'
                }`}>{project.ensembleRiskLevel || '—'}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Sanction Delay</p>
                <p className={`font-semibold ${(project.sanctionDelayDays ?? 0) > 30 ? 'text-amber-600' : 'text-slate-800'}`}>
                  {project.sanctionDelayDays != null ? `${Math.round(project.sanctionDelayDays)} days` : '—'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Completion Duration</p>
                <p className="font-semibold text-slate-800">
                  {project.completionDurationDays != null ? `${Math.round(project.completionDurationDays)} days` : '—'}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <ProgressBar value={project.riskScore ?? 0} color="auto" showLabel={true} label="Overall AI Risk Score" />
            </div>
          </ChartCard>

          {/* No mock alerts — investigation data lives on the Investigations page */}
          {!isHighRisk && (
            <ChartCard title="Project Risk Status" subtitle="AI detection pipeline assessment">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="w-10 h-10 text-green-500 mb-3" />
                <p className="text-sm font-medium text-slate-700">No critical anomalies detected</p>
                <p className="text-xs text-slate-500 mt-1">
                  Risk score {project.riskScore ?? 0}/100 — within acceptable thresholds.
                  <br />
                  For detailed ML flags, see the{' '}
                  <button onClick={() => navigate('/admin/investigations')} className="text-gov-blue-600 underline">
                    Investigations page
                  </button>.
                </p>
              </div>
            </ChartCard>
          )}
        </div>

        {/* Right Column — Location Details */}
        <div className="space-y-6">
          <ChartCard title="Location Details">
            <div className="aspect-video bg-slate-100 rounded-lg mb-4 flex items-center justify-center border border-slate-200 relative overflow-hidden">
              <MapPin className="w-8 h-8 text-slate-400 absolute z-10" />
              {/* Placeholder map grid */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">State</span>
                <span className="font-medium text-slate-800">{project.state || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">District</span>
                <span className="font-medium text-slate-800">{project.district || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Constituency</span>
                <span className="font-medium text-slate-800">{project.constituency || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Work Type</span>
                <span className="font-medium text-slate-800">{project.workType || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Final Risk Level</span>
                <span className={`font-semibold ${
                  project.riskLevel === 'CRITICAL' ? 'text-red-600' :
                  project.riskLevel === 'HIGH' ? 'text-orange-600' :
                  project.riskLevel === 'MEDIUM' ? 'text-amber-600' :
                  'text-green-600'
                }`}>{project.riskLevel || '—'}</span>
              </div>
            </div>
          </ChartCard>

          {/* Contractor section — no contractor API exists yet */}
          <ChartCard title="Contractor Details">
            <div className="text-center py-6 text-slate-500">
              <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm">Contractor profile data is not yet available in this system version.</p>
              <p className="text-xs text-slate-400 mt-1">Planned for a future release.</p>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
