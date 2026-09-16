const mlClient = require('../config/mlClient');
const ApiError = require('../utils/ApiError');
const llmService = require('./llmService');
const investigationReportRepo = require('../repositories/investigationReport.repository');
const projectRepo = require('../repositories/project.repository');

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

// Reads from Supabase's `projects` table (database/data_schema.sql, populated
// via `npm run ingest-data`) instead of the FastAPI/CSV gateway — this is the
// same table `createProject` writes to, so newly-added projects show up here
// immediately instead of only existing in a database nothing reads from.
const getProjects = async (user, filters = {}) => {
  const scopedFilters = enforceListScope(user, filters);
  const data = await projectRepo.list(scopedFilters);
  data.projects = data.projects.map(transformProject);
  return data;
};

const getProject = async (user, workId) => {
  const data = await projectRepo.getByWorkId(workId);
  if (!data) throw ApiError.notFound(`Project '${workId}' not found`);
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

// Only 20 of 175 queued investigations have a pre-generated report from the
// offline batch script (ml_engine/notebooks/generate_grounded_llm_explanations_v3.py).
// The single-item /investigations/:id endpoint is filtered through a narrow
// Pydantic schema that drops several fields the report prompt needs
// (verified_observations, financial/statistical sub-scores), so page through
// the list endpoint — which returns full raw rows — to find them.
const findRawInvestigation = async (user, workId) => {
  let offset = 0;
  while (true) {
    const page = await getInvestigations(user, { limit: 100, offset });
    const list = page?.investigations || [];
    const match = list.find((i) => i.work_id === workId || i.workId === workId);
    if (match) return match;
    const total = page?.total ?? 0;
    if (!list.length || offset + list.length >= total) return null;
    offset += 100;
  }
};

const getInvestigationReport = async (user, workId) => {
  // To enforce detail scope on a report string, we must first fetch the investigation metadata
  const investigation = await getInvestigation(user, workId); // This will throw 403/404 if out of scope/missing

  // Persisted reports (database/data_schema.sql#investigation_reports) short-circuit
  // everything below — once a report has been seen once (offline batch, ingested via
  // `npm run ingest-data`, or previously live-generated), it's served straight from
  // Supabase forever after, with no dependency on the ML engine or Groq being up.
  const persisted = await investigationReportRepo.findByWorkId(workId);
  if (persisted) {
    return { ...investigation, report: persisted.report_text, reportStatus: persisted.report_status };
  }

  try {
    const data = await call(() => mlClient.get(`/investigations/${encodeURIComponent(workId)}/report`));
    const transformed = transformInvestigationData(data);
    if (transformed?.report) {
      await investigationReportRepo.upsert({ workId, reportText: transformed.report, source: 'offline_batch_v3' });
    }
    return transformed;
  } catch (err) {
    if (err.statusCode !== 404) throw err;
    // No pre-generated report exists for this project — generate one live via
    // Groq, in the same grounded style as the offline batch script, and persist
    // it so it's never regenerated again.
    const raw = (await findRawInvestigation(user, workId)) || investigation;
    const generated = await llmService.generateInvestigationReport(raw);
    await investigationReportRepo.upsert({ workId, reportText: generated.text, source: 'live_groq' });
    return { ...investigation, report: generated.text, reportStatus: 'GENERATED_LIVE' };
  }
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
