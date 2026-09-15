const asyncHandler = require('../utils/asyncHandler');
const mlService = require('../services/ml.service');

const getProjects = asyncHandler(async (req, res) => {
  const { limit, offset, risk_level: riskLevel, state, district, constituency, status } = req.query;
  const data = await mlService.getProjects({ limit, offset, riskLevel, state, district, constituency, status });
  res.json({ success: true, data });
});

const getProject = asyncHandler(async (req, res) => {
  const data = await mlService.getProject(req.params.workId);
  res.json({ success: true, data });
});

const getRiskSummary = asyncHandler(async (req, res) => {
  const data = await mlService.getRiskSummary();
  res.json({ success: true, data });
});

const getRiskDistribution = asyncHandler(async (req, res) => {
  const data = await mlService.getRiskDistribution();
  res.json({ success: true, data });
});

const getInvestigations = asyncHandler(async (req, res) => {
  const { limit, offset, risk_level: riskLevel, priority_category: priorityCategory, state } = req.query;
  const data = await mlService.getInvestigations({ limit, offset, riskLevel, priorityCategory, state });
  res.json({ success: true, data });
});

const getInvestigation = asyncHandler(async (req, res) => {
  const data = await mlService.getInvestigation(req.params.workId);
  res.json({ success: true, data });
});

const getInvestigationReport = asyncHandler(async (req, res) => {
  const data = await mlService.getInvestigationReport(req.params.workId);
  res.json({ success: true, data });
});

const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const data = await mlService.getAnalyticsOverview();
  res.json({ success: true, data });
});

const getAnalyticsStates = asyncHandler(async (req, res) => {
  const data = await mlService.getAnalyticsStates();
  res.json({ success: true, data });
});

const getAnalyticsCategories = asyncHandler(async (req, res) => {
  const data = await mlService.getAnalyticsCategories();
  res.json({ success: true, data });
});

const getAnalyticsConstituencies = asyncHandler(async (req, res) => {
  const data = await mlService.getAnalyticsConstituencies();
  res.json({ success: true, data });
});

module.exports = {
  getProjects,
  getProject,
  getRiskSummary,
  getRiskDistribution,
  getInvestigations,
  getInvestigation,
  getInvestigationReport,
  getAnalyticsOverview,
  getAnalyticsStates,
  getAnalyticsCategories,
  getAnalyticsConstituencies,
};
