import { useState } from 'react';
import { FileText, Download, Loader2, CheckCircle } from 'lucide-react';
import { PageHeader, ChartCard } from '../../components/common/UIComponents';
import { riskApi } from '../../services/api';
import { formatNumber, formatPercentage, formatDateTime } from '../../utils/formatters';
import { REPORT_TYPES } from '../../utils/constants';

// Assembles a real summary from the live ml_engine data (risk summary +
// analytics overview) rather than generating a downloadable file — there is
// no report-rendering/export service behind this yet.
export default function Reports() {
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const [summary, overview] = await Promise.all([riskApi.getRiskSummary(), riskApi.getAnalyticsOverview()]);
      setReport({
        type: reportType,
        generatedAt: new Date().toISOString(),
        summary,
        overview,
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not generate report — the risk intelligence service is unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Reports" subtitle="Generate a live summary report sourced directly from the ML risk-intelligence engine." />

      <ChartCard title="Generate Report">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white appearance-none"
            >
              {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-navy-800 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-navy-900 disabled:opacity-60 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {loading ? 'Generating…' : 'Generate Report'}
          </button>
        </div>
        {error && <div className="mt-4 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}
      </ChartCard>

      {report && (
        <ChartCard
          title={`${report.type} Report`}
          subtitle={`Generated ${formatDateTime(report.generatedAt)}`}
          action={
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
              <CheckCircle className="w-3.5 h-3.5" /> Live data
            </span>
          }
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Total Projects</p>
              <p className="text-xl font-bold text-slate-800">{formatNumber(report.summary.totalProjects)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Avg Risk Score</p>
              <p className="text-xl font-bold text-slate-800">{report.summary.averageRiskScore}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <p className="text-xs text-red-600 mb-1">High + Critical Risk</p>
              <p className="text-xl font-bold text-red-700">{formatNumber(report.summary.highCriticalProjects)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Max Risk Score</p>
              <p className="text-xl font-bold text-slate-800">{report.overview.maximumRiskScore}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">ML-Detected Anomalies</p>
              <p className="text-lg font-semibold text-slate-800">{formatNumber(report.overview.mlDetectedProjects)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Flagged by Multiple Engines</p>
              <p className="text-lg font-semibold text-slate-800">{formatNumber(report.overview.multiEngineProjects)}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Risk Distribution</p>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(report.summary.riskDistribution).map(([level, count]) => (
                <div key={level} className="text-center bg-white border border-slate-200 rounded-lg p-3">
                  <p className="text-lg font-bold text-slate-800">{formatNumber(count)}</p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wide">{level}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {formatPercentage((count / report.summary.totalProjects) * 100)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            disabled
            title="Export requires a report-rendering service — not built yet"
            className="mt-6 flex items-center gap-2 text-sm text-slate-400 border border-slate-200 rounded-lg px-4 py-2 cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> Export as PDF (coming soon)
          </button>
        </ChartCard>
      )}
    </div>
  );
}
