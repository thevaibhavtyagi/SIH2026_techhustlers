const asyncHandler = require('../utils/asyncHandler');
const mlService = require('../services/ml.service');
const llmService = require('../services/llmService');

const scopeLabel = (user) => {
  if (user.role === 'admin') return 'All-India (MoSPI Admin)';
  if (user.role === 'mp') return `Constituency: ${user.constituency}`;
  if (user.role === 'district_nodal') return `District: ${user.district}, ${user.state}`;
  return 'Unknown';
};

// Reuses ml.service's already RBAC-scoped functions (same enforceListScope
// used by the dashboard/alerts/investigations endpoints) so the Copilot never
// sees data the requesting user isn't authorized to see in the first place.
const buildContext = async (user) => {
  const [overview, riskSummary, investigationsData, statesData] = await Promise.all([
    mlService.getAnalyticsOverview(user),
    mlService.getRiskSummary(user),
    mlService.getInvestigations(user, { limit: 10 }),
    mlService.getAnalyticsStates(user).catch(() => null),
  ]);

  const investigations = investigationsData?.investigations || [];
  const states = statesData?.states || (Array.isArray(statesData) ? statesData : []);

  return {
    scope: scopeLabel(user),
    // Per-state breakdown so questions like "high-risk projects in <state>" are answerable.
    byState: states.slice(0, 40).map((s) => ({
      state: s.state,
      totalProjects: s.totalProjects,
      highRisk: s.highRisk,
      criticalRisk: s.criticalRisk,
      averageRiskScore: s.averageRiskScore,
    })),
    projectTotals: {
      totalProjects: overview?.totalProjects ?? 0,
      totalSanctionedAmount: overview?.totalSanctionedAmount ?? 0,
      totalExpenditure: overview?.totalExpenditure ?? 0,
      completedProjects: overview?.completedProjects ?? 0,
      pendingProjects: overview?.pendingProjects ?? 0,
      averageRiskScore: overview?.averageRiskScore ?? riskSummary?.averageRiskScore ?? 0,
      riskDistribution: overview?.riskDistribution ?? riskSummary?.riskDistribution ?? {},
      highCriticalProjects: overview?.highCriticalProjects ?? riskSummary?.highCriticalProjects ?? 0,
      mlDetectedProjects: overview?.mlDetectedProjects ?? 0,
    },
    topFlaggedProjects: investigations.slice(0, 10).map((i) => ({
      workId: i.workId,
      riskScore: i.riskScore,
      riskLevel: i.riskLevel,
      priority: i.priority,
      state: i.state,
      constituency: i.constituency,
    })),
  };
};

const askCopilot = asyncHandler(async (req, res) => {
  const { query } = req.body;
  const context = await buildContext(req.user);
  const answer = await llmService.askCopilot(query, context);
  res.json({ success: true, data: answer });
});

module.exports = { askCopilot };
