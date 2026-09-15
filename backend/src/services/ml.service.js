const mlClient = require('../config/mlClient');
const ApiError = require('../utils/ApiError');

// Runs an axios call against the ml_engine FastAPI service, translating
// network/HTTP failures into ApiError so routes don't need try/catch.
const call = async (fn) => {
  try {
    const { data } = await fn();
    return data;
  } catch (err) {
    if (err.response) {
      // FastAPI returned a real HTTP error (e.g. 404 for an unknown work_id).
      const message = err.response.data?.detail || 'Risk intelligence service error';
      throw new ApiError(err.response.status, typeof message === 'string' ? message : 'Risk intelligence service error');
    }
    // Service unreachable (down, wrong ML_ENGINE_URL, timeout, etc.)
    throw new ApiError(503, 'Risk intelligence service is currently unavailable');
  }
};

// ---------- Projects ----------

const getProjects = ({ limit, offset, riskLevel, state } = {}) =>
  call(() =>
    mlClient.get('/projects', {
      params: { limit, offset, risk_level: riskLevel, state },
    })
  );

const getProject = (workId) => call(() => mlClient.get(`/projects/${encodeURIComponent(workId)}`));

// ---------- Risk ----------

const getRiskSummary = () => call(() => mlClient.get('/risk/summary'));

const getRiskDistribution = () => call(() => mlClient.get('/risk/distribution'));

// ---------- Investigations ----------

const getInvestigations = ({ limit, offset, riskLevel, priorityCategory, state } = {}) =>
  call(() =>
    mlClient.get('/investigations', {
      params: { limit, offset, risk_level: riskLevel, priority_category: priorityCategory, state },
    })
  );

const getInvestigation = (workId) => call(() => mlClient.get(`/investigations/${encodeURIComponent(workId)}`));

const getInvestigationReport = (workId) =>
  call(() => mlClient.get(`/investigations/${encodeURIComponent(workId)}/report`));

// ---------- Analytics ----------

const getAnalyticsOverview = () => call(() => mlClient.get('/analytics/overview'));
const getAnalyticsStates = () => call(() => mlClient.get('/analytics/states'));
const getAnalyticsCategories = () => call(() => mlClient.get('/analytics/categories'));
const getAnalyticsConstituencies = () => call(() => mlClient.get('/analytics/constituencies'));

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
