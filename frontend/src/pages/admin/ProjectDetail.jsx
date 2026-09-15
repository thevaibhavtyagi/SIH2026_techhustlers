import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, IndianRupee, Calendar, FileText, HardHat, AlertTriangle, ShieldAlert, Clock, CheckCircle } from 'lucide-react';
import { getProjectById, getContractorById, getAlerts } from '../../services/api';
import RiskBadge, { StatusBadge } from '../../components/common/RiskBadge';
import RiskScoreRing from '../../components/common/RiskScoreRing';
import { PageHeader, ChartCard, ProgressBar, LoadingState, AIInsightCard, Timeline } from '../../components/common/UIComponents';
import { formatCurrency, formatDate, getRiskLevel } from '../../utils/formatters';

export default function ProjectDetail() {
  const { id: rawId } = useParams();
  const id = decodeURIComponent(rawId ?? '');
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [contractor, setContractor] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const p = await getProjectById(id);
      if (p) {
        setProject(p);
        const c = await getContractorById(p.contractorId);
        setContractor(c);
        const a = await getAlerts({ projectId: id });
        setAlerts(a);
      }
      setLoading(false);
    };
    fetchDetails();
  }, [id]);

  if (loading) return (
    <div className="p-6">
      <LoadingState rows={8} />
    </div>
  );
  
  if (!project) return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Project Not Found</h2>
      <p className="text-slate-500 mb-6">The project ID {id} does not exist in the system.</p>
      <button onClick={() => navigate('/admin/projects')} className="bg-navy-800 text-white px-5 py-2 rounded-lg">Return to Projects</button>
    </div>
  );

  const isHighRisk = project.riskScore >= 75;

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
              <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-slate-400" /> {project.workType}</span>
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
                <p className="font-semibold text-slate-800">{project.progress}%</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Expected Completion</p>
                <p className="font-semibold text-slate-800">{formatDate(project.expectedCompletion)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100 lg:w-64">
            <h3 className="text-sm font-semibold text-slate-600 mb-4 uppercase tracking-wider">AI Risk Score</h3>
            <RiskScoreRing score={project.riskScore} size={140} strokeWidth={12} />
            <p className="text-xs text-slate-500 mt-4 text-center">Score updated 2 hours ago by Risk Engine v2.1</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - AI & Alerts */}
        <div className="lg:col-span-2 space-y-6">
          
          {isHighRisk && (
            <AIInsightCard title="AI Risk Explanation">
              <div className="space-y-3">
                <p>The AI Risk Engine has flagged this project with a score of <strong>{project.riskScore}/100 ({getRiskLevel(project.riskScore)})</strong>. Key contributing factors:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  {project.expenditure > project.sanctionedAmount && (
                    <li><span className="font-medium text-red-700">Cost Overrun:</span> Expenditure is {((project.expenditure - project.sanctionedAmount) / project.sanctionedAmount * 100).toFixed(1)}% above sanctioned amount.</li>
                  )}
                  {project.progress < 30 && (
                    <li><span className="font-medium text-red-700">Severely Delayed Progress:</span> Only {project.progress}% completed despite significant time elapsed.</li>
                  )}
                  {alerts.some(a => a.category === 'Financial') && (
                    <li><span className="font-medium text-amber-700">Payment Anomaly:</span> Unusual payment clustering detected (Isolation Forest).</li>
                  )}
                  {contractor && contractor.riskScore >= 70 && (
                    <li><span className="font-medium text-amber-700">Contractor Risk:</span> Associated contractor has a high risk profile ({contractor.riskScore}).</li>
                  )}
                </ul>
                <div className="mt-4 pt-3 border-t border-indigo-100/50 flex items-center justify-between">
                  <span className="text-xs font-medium text-indigo-700">Recommendation: Immediate Site Inspection</span>
                  <button className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">Initiate Investigation</button>
                </div>
              </div>
            </AIInsightCard>
          )}

          <ChartCard title="Project Alerts & Anomalies" subtitle="Flags generated by the AI detection pipeline">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-slate-600">No anomalies detected. Project is running smoothly.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map(a => (
                  <div key={a.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className={`mt-0.5 p-2 rounded-lg flex-shrink-0 h-min ${
                      a.severity === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {a.severity === 'Critical' ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800 text-sm">{a.category} Anomaly</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          a.status === 'New' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>{a.status}</span>
                      </div>
                      <p className="text-sm text-slate-600">{a.description}</p>
                      <p className="text-xs text-slate-400 mt-2 font-mono">ID: {a.id} • {formatDate(a.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>

          <ChartCard title="Project Timeline" subtitle="Milestones and recorded events">
            <Timeline items={[
              { event: 'Latest Progress Update', detail: `${project.progress}% physical completion recorded`, date: '2025-04-10' },
              { event: 'Fund Release - Tranche 2', detail: '₹40,00,000 released to implementing agency', date: '2025-02-15' },
              { event: 'Work Order Issued', detail: 'Awarded to Sharma Infrastructure', date: '2024-11-05' },
              { event: 'Administrative Approval', detail: 'Project approved by District Collector', date: '2024-10-20' },
              { event: 'Project Sanctioned', detail: `Initial sanction of ${formatCurrency(project.sanctionedAmount)}`, date: formatDate(project.sanctionDate) },
            ]} />
          </ChartCard>

        </div>

        {/* Right Column - Contractor & Details */}
        <div className="space-y-6">
          
          {contractor && (
            <ChartCard title="Contractor Profile" subtitle="Executing agency details">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                  <HardHat className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{contractor.name}</h3>
                  <p className="text-xs text-slate-500">{contractor.id} • {contractor.state}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">Contractor Risk Score</span>
                    <span className="font-bold">{contractor.riskScore}/100</span>
                  </div>
                  <ProgressBar value={contractor.riskScore} color="auto" showLabel={false} />
                </div>
                
                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-xs text-slate-500">Active Projects</p>
                    <p className="font-semibold text-slate-800">{contractor.activeProjects}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Completed</p>
                    <p className="font-semibold text-slate-800">{contractor.completedProjects}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Delay Rate</p>
                    <p className={`font-semibold ${contractor.delayRate > 30 ? 'text-red-600' : 'text-slate-800'}`}>
                      {contractor.delayRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Avg Delay</p>
                    <p className="font-semibold text-slate-800">{contractor.avgDelayDays} days</p>
                  </div>
                </div>
                
                <button className="w-full text-xs text-gov-blue-600 font-medium py-2 border border-gov-blue-200 rounded-lg hover:bg-gov-blue-50 transition-colors">
                  View Full Contractor Profile
                </button>
              </div>
            </ChartCard>
          )}

          <ChartCard title="Location Details">
            <div className="aspect-video bg-slate-100 rounded-lg mb-4 flex items-center justify-center border border-slate-200 relative overflow-hidden">
              <MapPin className="w-8 h-8 text-slate-400 absolute z-10" />
              {/* Fake Map Grid */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">State</span>
                <span className="font-medium text-slate-800">{project.state}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">District</span>
                <span className="font-medium text-slate-800">{project.district}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Constituency</span>
                <span className="font-medium text-slate-800">{project.constituency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pin Code</span>
                <span className="font-medium text-slate-800">{project.pinCode || 'N/A'}</span>
              </div>
            </div>
          </ChartCard>

        </div>
      </div>
    </div>
  );
}
