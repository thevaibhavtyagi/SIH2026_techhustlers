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

// ==========================================
// SECURITY: DATA SCOPE ENFORCEMENT
// ==========================================

const enforceListScope = (user, query = {}) => {
  if (user.role === 'admin') return query;
  if (user.role === 'mp') {
    if (!user.constituency) throw new ApiError(403, 'User is missing assigned constituency scope');
    return { ...query, constituency: user.constituency };
  }
  if (user.role === 'district_nodal') {
    if (!user.state || !user.district) throw new ApiError(403, 'User is missing assigned state/district scope');
    return { ...query, state: user.state, district: user.district };
  }
  throw new ApiError(403, 'Unauthorized role');
};

const enforceDetailScope = (user, item) => {
  if (!item) return;
  if (user.role === 'admin') return;
  if (user.role === 'mp') {
    if (!user.constituency || item.constituency !== user.constituency) {
      throw new ApiError(403, 'Project is outside your assigned constituency');
    }
  } else if (user.role === 'district_nodal') {
    if (!user.state || !user.district || item.state !== user.state || item.district !== user.district) {
      throw new ApiError(403, 'Project is outside your assigned district');
    }
  } else {
    throw new ApiError(403, 'Unauthorized role');
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
    district: p.district || p.ida,
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
    financialRiskScore: p.financial_risk_score,
    sanctionDelayDays: p.sanction_delay_days,
    completionDurationDays: p.completion_duration_days,
    ensembleRiskLevel: p.ensemble_risk_level,
    contractorId: 'CTR-' + (p.work_id ? p.work_id.slice(-4) : '0000')
  };
};

const getProjects = async (user, filters = {}) => {
  const scopedFilters = enforceListScope(user, filters);
  const data = await call(() =>
    mlClient.get('/projects', {
      params: { 
        limit: scopedFilters.limit, 
        offset: scopedFilters.offset, 
        risk_level: scopedFilters.riskLevel, 
        state: scopedFilters.state, 
        district: scopedFilters.district, 
        constituency: scopedFilters.constituency, 
        status: scopedFilters.status 
      },
    })
  );
  if (data && data.projects) {
    data.projects = data.projects.map(transformProject);
  }
  return data;
};

const getProject = async (user, workId) => {
  const data = await call(() => mlClient.get(`/projects/${encodeURIComponent(workId)}`));
  const project = transformProject(data);
  enforceDetailScope(user, project);
  return project;
};

// ---------- Transformers ----------

const transformRiskSummaryResponse = (s) => {
  if (!s) return null;
  return {
    ...s,
    totalProjects: s.total_projects,
    riskDistribution: s.risk_distribution,
    averageRiskScore: s.average_risk_score,
    highCriticalProjects: s.high_critical_projects
  };
};

const transformAnalyticsOverview = (a) => {
  if (!a) return null;
  return {
    ...a,
    totalProjects: a.total_projects,
    totalSanctionedAmount: a.total_sanctioned_amount,
    totalExpenditure: a.total_expenditure,
    completedProjects: a.completed_projects,
    pendingProjects: a.pending_projects,
    riskDistribution: a.risk_distribution,
    averageRiskScore: a.average_risk_score,
    maximumRiskScore: a.maximum_risk_score,
    highCriticalProjects: a.high_critical_projects,
    mlDetectedProjects: a.ml_detected_projects,
    multiEngineProjects: a.multi_engine_projects,
  };
};

const transformStateAnalytics = (s) => {
  if (!s) return null;
  return {
    ...s,
    totalProjects: s.total_projects,
    totalSanctionedAmount: s.total_sanctioned_amount,
    totalExpenditure: s.total_expenditure,
    averageRiskScore: s.average_risk_score,
    highRisk: s.high_risk,
    criticalRisk: s.critical_risk,
  };
};

const transformInvestigationData = (i) => {
  if (!i) return null;
  return {
    ...i,
    workId: i.work_id,
    riskScore: i.final_ai_risk_score ? Math.round(i.final_ai_risk_score) : 0,
    riskLevel: i.final_ai_risk_level,
    priority: i.investigation_priority_category,
    rank: i.investigation_rank,
    primarySignal: i.primary_risk_source,
    confidence: i.risk_detection_confidence,
    report: i.grounded_llm_investigation_report,
    reportStatus: i.report_status,
  };
};

// ---------- Risk ----------

const getRiskSummary = async (user) => {
  const params = enforceListScope(user, {});
  const data = await call(() => mlClient.get('/risk/summary', { params }));
  return transformRiskSummaryResponse(data);
};

const getRiskDistribution = async (user) => {
  const params = enforceListScope(user, {});
  return call(() => mlClient.get('/risk/distribution', { params }));
};

// ---------- Investigations ----------

const getInvestigations = async (user, filters = {}) => {
  const scopedFilters = enforceListScope(user, filters);
  const data = await call(() =>
    mlClient.get('/investigations', {
      params: { 
        limit: scopedFilters.limit, 
        offset: scopedFilters.offset, 
        risk_level: scopedFilters.riskLevel, 
        priority_category: scopedFilters.priorityCategory, 
        state: scopedFilters.state,
        district: scopedFilters.district,
        constituency: scopedFilters.constituency
      },
    })
  );
  if (data && data.investigations) {
    data.investigations = data.investigations.map(transformInvestigationData);
  } else if (Array.isArray(data)) {
    return data.map(transformInvestigationData);
  }
  return data;
};

const getInvestigation = async (user, workId) => {
  const data = await call(() => mlClient.get(`/investigations/${encodeURIComponent(workId)}`));
  enforceDetailScope(user, data);
  return transformInvestigationData(data);
};

const getInvestigationReport = async (user, workId) => {
  // To enforce detail scope on a report string, we must first fetch the investigation metadata
  await getInvestigation(user, workId); // This will throw 403 if out of scope
  const data = await call(() => mlClient.get(`/investigations/${encodeURIComponent(workId)}/report`));
  return transformInvestigationData(data);
};

// ---------- Analytics ----------

const getAnalyticsOverview = async (user) => {
  const params = enforceListScope(user, {});
  const data = await call(() => mlClient.get('/analytics/overview', { params }));
  return transformAnalyticsOverview(data);
};

const getAnalyticsStates = async (user) => {
  const params = enforceListScope(user, {});
  const data = await call(() => mlClient.get('/analytics/states', { params }));
  // ML engine returns { total_states, states: [...] } — NOT a bare array.
  // Array.isArray(data) is therefore false and the transformer must be applied
  // to the nested 'states' array explicitly.
  if (data && Array.isArray(data.states)) {
    return { ...data, states: data.states.map(transformStateAnalytics) };
  }
  return Array.isArray(data) ? data.map(transformStateAnalytics) : data;
};

const getAnalyticsCategories = async (user) => {
  const params = enforceListScope(user, {});
  const data = await call(() => mlClient.get('/analytics/categories', { params }));
  // ML engine returns { total_categories, categories: [...] }
  if (data && Array.isArray(data.categories)) {
    return { ...data, categories: data.categories.map(transformStateAnalytics) };
  }
  return Array.isArray(data) ? data.map(transformStateAnalytics) : data;
};

const getAnalyticsConstituencies = async (user) => {
  const params = enforceListScope(user, {});
  const data = await call(() => mlClient.get('/analytics/constituencies', { params }));
  // ML engine returns { total_constituencies, constituencies: [...] }
  if (data && Array.isArray(data.constituencies)) {
    return { ...data, constituencies: data.constituencies.map(transformStateAnalytics) };
  }
  return Array.isArray(data) ? data.map(transformStateAnalytics) : data;
};

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
