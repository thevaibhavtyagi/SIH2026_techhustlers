const asyncHandler = require('../utils/asyncHandler');
const mlService = require('../services/ml.service');
const pdfService = require('../services/pdf.service');

const getProjects = asyncHandler(async (req, res) => {
  const { limit, offset, risk_level: riskLevel, state, district, constituency, status } = req.query;
  const data = await mlService.getProjects(req.user, { limit, offset, riskLevel, state, district, constituency, status });
  res.json({ success: true, data });
});

const getProject = asyncHandler(async (req, res) => {
  const data = await mlService.getProject(req.user, req.params.workId);
  res.json({ success: true, data });
});

const getRiskSummary = asyncHandler(async (req, res) => {
  const data = await mlService.getRiskSummary(req.user);
  res.json({ success: true, data });
});

const getRiskDistribution = asyncHandler(async (req, res) => {
  const data = await mlService.getRiskDistribution(req.user);
  res.json({ success: true, data });
});

const getInvestigations = asyncHandler(async (req, res) => {
  const { limit, offset, risk_level: riskLevel, priority_category: priorityCategory, state } = req.query;
  const data = await mlService.getInvestigations(req.user, { limit, offset, riskLevel, priorityCategory, state });
  res.json({ success: true, data });
});

const getInvestigation = asyncHandler(async (req, res) => {
  const data = await mlService.getInvestigation(req.user, req.params.workId);
  res.json({ success: true, data });
});

const getInvestigationReport = asyncHandler(async (req, res) => {
  const data = await mlService.getInvestigationReport(req.user, req.params.workId);
  res.json({ success: true, data });
});

const exportInvestigationReport = asyncHandler(async (req, res) => {
  const data = await mlService.getInvestigationReport(req.user, req.params.workId);
  const pdfBuffer = await pdfService.generateInvestigationReport(data);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="investigation-${encodeURIComponent(req.params.workId)}.pdf"`);
  res.send(pdfBuffer);
});

const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const data = await mlService.getAnalyticsOverview(req.user);
  res.json({ success: true, data });
});

const getAnalyticsStates = asyncHandler(async (req, res) => {
  const data = await mlService.getAnalyticsStates(req.user);
  res.json({ success: true, data });
});

const getAnalyticsCategories = asyncHandler(async (req, res) => {
  const data = await mlService.getAnalyticsCategories(req.user);
  res.json({ success: true, data });
});

const getAnalyticsConstituencies = asyncHandler(async (req, res) => {
  const data = await mlService.getAnalyticsConstituencies(req.user);
  res.json({ success: true, data });
});

const getAnalyticsTimeseries = asyncHandler(async (req, res) => {
  const data = await mlService.getAnalyticsTimeseries(req.user);
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
  exportInvestigationReport,
  getAnalyticsOverview,
  getAnalyticsStates,
  getAnalyticsCategories,
  getAnalyticsConstituencies,
  getAnalyticsTimeseries,
};
