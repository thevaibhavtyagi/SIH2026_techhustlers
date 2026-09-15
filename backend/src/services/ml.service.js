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

const transformProject = (p) => {
  if (!p) return null;
  return {
    ...p,
    id: p.work_id,
    name: p.work_description || p.work_category || 'Untitled Project',
    state: p.state,
    district: p.district,
    constituency: p.constituency,
    workType: p.work_category,
    status: p.work_status || 'In Progress',
    progress: p.expenditure_ratio ? Math.round(p.expenditure_ratio * 100) : 0,
    expectedCompletion: p.completion_date,
    sanctionDate: p.sanction_date,
    sanctionedAmount: p.sanction_amount || 0,
    expenditure: p.total_expenditure || 0,
    riskScore: p.final_ai_risk_score ? Math.round(p.final_ai_risk_score) : 0,
    riskLevel: p.final_ai_risk_level,
    contractorId: 'CTR-' + (p.work_id ? p.work_id.slice(-4) : '0000')
  };
};

const getProjects = async ({ limit, offset, riskLevel, state, district, constituency, status } = {}) => {
  const data = await call(() =>
    mlClient.get('/projects', {
      params: { limit, offset, risk_level: riskLevel, state, district, constituency, status },
    })
  );
  if (data && data.projects) {
    data.projects = data.projects.map(transformProject);
  }
  return data;
};

const getProject = async (workId) => {
  const data = await call(() => mlClient.get(`/projects/${encodeURIComponent(workId)}`));
  return transformProject(data);
};

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
