import axios from 'axios';
import {
  MOCK_CONTRACTORS,
  COPILOT_WELCOME, COPILOT_SUGGESTIONS,
} from '../data/mockData';
import { delay } from '../utils/formatters';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ============================================================
// Axios instance + auth token handling
// ============================================================
// The access token lives in memory only (never localStorage) — persistence
// across reloads happens by silently calling /auth/refresh on app start,
// which relies on the httpOnly refresh cookie. See AuthContext.
let accessToken = null;
export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send/receive the httpOnly refresh cookie
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// On a 401 (expired access token), try exactly one silent refresh, then
// retry the original request. Auth endpoints themselves are excluded to
// avoid infinite loops.
let refreshPromise = null;

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    const isAuthEndpoint = config?.url?.startsWith('/auth/');

    if (response?.status === 401 && !isAuthEndpoint && !config._retried) {
      config._retried = true;
      try {
        refreshPromise = refreshPromise || apiClient.post('/auth/refresh');
        const { data } = await refreshPromise;
        refreshPromise = null;
        setAccessToken(data.data.accessToken);
        return apiClient(config);
      } catch (refreshErr) {
        refreshPromise = null;
        setAccessToken(null);
        throw refreshErr;
      }
    }
    throw error;
  }
);

// ============================================================
// Auth (real backend — backend/src/routes/auth.routes.js)
// No public registration — every account is admin-provisioned, see adminApi.
// ============================================================
export const authApi = {
  login: (email, password, role) => apiClient.post('/auth/login', { email, password, role }).then((r) => r.data.data),
  refresh: () => apiClient.post('/auth/refresh').then((r) => r.data.data),
  logout: () => apiClient.post('/auth/logout').then((r) => r.data),
  me: () => apiClient.get('/auth/me').then((r) => r.data.data.user),
  changePassword: (currentPassword, newPassword) =>
    apiClient.patch('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password }).then((r) => r.data),
};

// ============================================================
// Admin user provisioning (real backend — admin-only)
// ============================================================
export const adminApi = {
  createUser: (payload) => apiClient.post('/users', payload).then((r) => r.data.data.user),
  listUsers: (params) => apiClient.get('/users', { params }).then((r) => r.data.data),
  getUser: (id) => apiClient.get(`/users/${id}`).then((r) => r.data.data.user),
  updateUser: (id, payload) => apiClient.patch(`/users/${id}`, payload).then((r) => r.data.data.user),
};

// ============================================================
// Real ml_engine-backed risk intelligence (via the Express gateway)
// backend/src/routes/{project,risk,investigation,analytics}.routes.js
// Step 8 enforces data-level scope in the backend — constituency for MP,
// state+district for district_nodal, all-India for admin.
// ============================================================
// The Express gateway reads snake_case query keys (risk_level, priority_category —
// see backend/src/controllers/ml.controller.js); several pages pass camelCase
// (e.g. Alerts.jsx, Investigations.jsx), which was silently dropped. Translate here.
const toProjectQuery = ({ riskLevel, ...rest } = {}) => ({ ...rest, risk_level: riskLevel });
const toInvestigationQuery = ({ riskLevel, priorityCategory, ...rest } = {}) => ({
  ...rest,
  risk_level: riskLevel,
  priority_category: priorityCategory,
});

export const riskApi = {
  getProjects: (params) => apiClient.get('/projects', { params: toProjectQuery(params) }).then((r) => r.data.data),
  getProject: (workId) => apiClient.get(`/projects/${encodeURIComponent(workId)}`).then((r) => r.data.data),
  getRiskSummary: () => apiClient.get('/risk/summary').then((r) => r.data.data),
  getRiskDistribution: () => apiClient.get('/risk/distribution').then((r) => r.data.data),
  getInvestigations: (params) => apiClient.get('/investigations', { params: toInvestigationQuery(params) }).then((r) => r.data.data),
  getInvestigation: (workId) => apiClient.get(`/investigations/${encodeURIComponent(workId)}`).then((r) => r.data.data),
  getInvestigationReport: (workId) =>
    apiClient.get(`/investigations/${encodeURIComponent(workId)}/report`).then((r) => r.data.data),
  getAnalyticsOverview: () => apiClient.get('/analytics/overview').then((r) => r.data.data),
  getAnalyticsStates: () => apiClient.get('/analytics/states').then((r) => r.data.data),
  getAnalyticsCategories: () => apiClient.get('/analytics/categories').then((r) => r.data.data),
  getAnalyticsConstituencies: () => apiClient.get('/analytics/constituencies').then((r) => r.data.data),
};

// ============================================================
// getDashboardStats — now powered by the real analytics/overview endpoint.
// Step 8 enforces data-level scope on the backend, so the `role` and `scope`
// params are not sent to the API — the backend already scopes the response
// correctly based on the logged-in user's JWT claims.
// ============================================================
export const getDashboardStats = async (role = 'admin', scope = null) => {
  const data = await riskApi.getAnalyticsOverview();
  return {
    // Backward-compatible shape that existing dashboard pages already consume
    totalProjects: data.totalProjects ?? 0,
    highRiskAlerts: data.highCriticalProjects ?? 0,
    completionRate: data.totalProjects
      ? Math.round(((data.completedProjects ?? 0) / data.totalProjects) * 100)
      : 0,
    totalFunds: data.totalSanctionedAmount ?? 0,
    // Additional real fields passed through for dashboard pages that want them
    totalExpenditure: data.totalExpenditure ?? 0,
    averageRiskScore: data.averageRiskScore ?? 0,
    completedProjects: data.completedProjects ?? 0,
    pendingProjects: data.pendingProjects ?? 0,
    riskDistribution: data.riskDistribution ?? {},
    mlDetectedProjects: data.mlDetectedProjects ?? 0,
    multiEngineProjects: data.multiEngineProjects ?? 0,
    maximumRiskScore: data.maximumRiskScore ?? 0,
  };
};

export const getProjects = async (filters = {}) => {
  const data = await riskApi.getProjects(filters);
  let results = data.projects || [];

  if (filters.search) {
    const s = filters.search.toLowerCase();
    results = results.filter(
      (p) => (p.id || '').toLowerCase().includes(s) || (p.name || '').toLowerCase().includes(s) || (p.district || '').toLowerCase().includes(s)
    );
  }
  return results;
};

export const getProjectById = async (id) => {
  return await riskApi.getProject(id);
};

// Admin-only — writes straight into Supabase's `projects` table
// (database/data_schema.sql) via POST /api/projects.
export const createProject = async (fields) => {
  return apiClient.post('/projects', fields).then((r) => r.data.data);
};

// Client-side CSV export of whatever's currently loaded/filtered — no backend
// round-trip needed since the data's already in the page.
export const exportProjectsCsv = (projects, filename = 'mplads-projects.csv') => {
  const columns = ['id', 'name', 'state', 'district', 'constituency', 'workType', 'sanctionedAmount', 'expenditure', 'progress', 'status', 'riskScore', 'sanctionDate'];
  const escape = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(',')];
  for (const p of projects) lines.push(columns.map((c) => escape(p[c])).join(','));
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// ============================================================
// Contractors — the MPLADS dataset has no real contractor/vendor identity
// (only an anonymous `unique_vendors` count per project), so contractor
// names/IDs below stay fictional. Their performance numbers are not,
// though: each real project is deterministically bucketed into one of the
// 5 demo contractors by hashing its work_id (stable across page loads), and
// every stat is aggregated from real project data for that bucket.
// ============================================================
const hashToIndex = (str, mod) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return hash % mod;
};

// Bounded sample of real projects (paginated) used to compute contractor
// aggregates — the backend caps a single page at 100, and scanning all
// ~13.7k national projects on every page load isn't worth it for a 5-way
// demo bucketing. ~1000 projects gives ~200/bucket, plenty for stable rates.
const CONTRACTOR_SAMPLE_PAGES = 10;
const CONTRACTOR_PAGE_SIZE = 100;

const sampleRealProjects = async () => {
  const pages = await Promise.all(
    Array.from({ length: CONTRACTOR_SAMPLE_PAGES }, (_, i) =>
      riskApi.getProjects({ limit: CONTRACTOR_PAGE_SIZE, offset: i * CONTRACTOR_PAGE_SIZE })
    )
  );
  return pages.flatMap((page) => page.projects || []);
};

const isDelayed = (p) => (p.sanctionDelayDays || 0) > 90;
const isCompleted = (p) => p.status === 'Work Completed' || p.status === 'Completed';

const computeContractorStats = (sampledProjects) => {
  const buckets = MOCK_CONTRACTORS.map((c) => ({ ...c, projects: [] }));
  for (const p of sampledProjects) {
    buckets[hashToIndex(p.id, buckets.length)].projects.push(p);
  }
  return buckets.map(({ projects, ...identity }) => {
    const total = projects.length;
    const completed = projects.filter(isCompleted).length;
    const delayed = projects.filter(isDelayed).length;
    const sumDelay = projects.reduce((s, p) => s + (p.sanctionDelayDays || 0), 0);
    const sumRisk = projects.reduce((s, p) => s + (p.riskScore || 0), 0);
    return {
      ...identity,
      activeProjects: total - completed,
      completedProjects: completed,
      delayRate: total ? Math.round((delayed / total) * 100) : 0,
      avgDelayDays: total ? Math.round(sumDelay / total) : 0,
      riskScore: total ? Math.round(sumRisk / total) : 0,
      sampleSize: total,
    };
  });
};

// Cached for the session so re-visiting Contractors doesn't re-sample
// ~1000 projects every time.
let contractorStatsPromise = null;
const getContractorStats = () => {
  if (!contractorStatsPromise) {
    contractorStatsPromise = sampleRealProjects().then(computeContractorStats);
  }
  return contractorStatsPromise;
};

export const getContractors = async () => getContractorStats();

export const getContractorById = async (id) => {
  const contractors = await getContractorStats();
  return contractors.find((c) => c.id === id) || null;
};

// ============================================================
// getAlerts — bridges to the real investigations API.
// There is no dedicated /api/alerts endpoint (Steps 1–9).
// Investigations from the ML engine are the real source of flagged data.
// Filters: constituency, district, state are passed through to the backend
// (which enforces Step 8 data-level scope). Filters for severity/category/
// status are applied client-side against the mapped shape.
// ============================================================
export const getAlerts = async (filters = {}) => {
  const params = { limit: filters.limit || 50 };
  if (filters.constituency) params.constituency = filters.constituency;
  if (filters.district) params.district = filters.district;
  if (filters.state) params.state = filters.state;

  try {
    const data = await riskApi.getInvestigations(params);
    const investigations = data?.investigations || (Array.isArray(data) ? data : []);

    let results = investigations.map((inv) => ({
      id: inv.workId,
      projectId: inv.workId,
      description: inv.primarySignal || `Risk score ${inv.riskScore ?? 0}/100 — flagged for investigation`,
      category: inv.priority || 'Risk',
      severity:
        inv.riskLevel === 'CRITICAL' ? 'Critical'
        : inv.riskLevel === 'HIGH' ? 'High'
        : inv.riskLevel === 'MEDIUM' ? 'Medium'
        : 'Low',
      status: 'New',
      timestamp: new Date().toISOString(),
      // Pass through original investigation fields for pages that need them
      workId: inv.workId,
      riskScore: inv.riskScore,
      riskLevel: inv.riskLevel,
      primarySignal: inv.primarySignal,
      priority: inv.priority,
      state: inv.state,
      constituency: inv.constituency,
    }));

    // Client-side filter for severity/category/status — these won't perfectly
    // match the old mock categories but allow compatible filtering UI to work.
    if (filters.severity) results = results.filter((a) => a.severity === filters.severity);
    if (filters.status) results = results.filter((a) => a.status === filters.status);

    return results;
  } catch {
    return [];
  }
};

export const getCopilotWelcome = async () => {
  await delay(150);
  return COPILOT_WELCOME;
};

export const getCopilotSuggestions = async () => {
  await delay(150);
  return COPILOT_SUGGESTIONS;
};

// Drishti Copilot — backend/src/routes/copilot.routes.js builds an RBAC-scoped
// data context (same enforceListScope used everywhere else) and asks Groq.
export const getCopilotResponse = async (query) => {
  try {
    const data = await apiClient.post('/copilot/query', { query }).then((r) => r.data.data);
    return { text: data.text, type: 'text' };
  } catch (err) {
    const message = err?.response?.data?.message || 'Copilot is temporarily unavailable. Please try again.';
    return { text: message, type: 'text' };
  }
};

export const submitConcern = async (concernData) => {
  await delay(300);
  return { success: true, id: `CONCERN-${Date.now()}`, ...concernData };
};

// ============================================================
// REMAINING MOCKS — no backend endpoint exists yet for these.
// Do not remove without first implementing the corresponding backend API.
// ============================================================

// Expenditure time-series: no monthly breakdown API exists.
// TODO Step 11: implement GET /api/analytics/timeseries
export const getExpenditureData = async () => {
  await delay(200);
  // Returns empty — callers should handle [] gracefully.
  return [];
};

export const getProgressData = async () => {
  await delay(200);
  return [];
};

// State risk data: now available from real API — use riskApi.getAnalyticsStates() directly.
// This wrapper is kept for any legacy callers but delegates to the real API.
export const getStateRiskData = async () => {
  try {
    const data = await riskApi.getAnalyticsStates();
    const states = data?.states || (Array.isArray(data) ? data : []);
    return states.map((s) => ({
      state: s.state,
      projects: s.totalProjects ?? 0,
      highRiskProjects: (s.highRisk ?? 0) + (s.criticalRisk ?? 0),
      totalRisk: (s.averageRiskScore ?? 0) * (s.totalProjects ?? 0),
      riskScore: Math.round(s.averageRiskScore ?? 0),
    }));
  } catch {
    return [];
  }
};

export const getStateByName = async (name) => {
  const all = await getStateRiskData();
  return all.find((s) => s.state === name) || null;
};

export const generateReport = async (config) => {
  await delay(600);
  return { success: true, reportId: `RPT-${Date.now()}`, config };
};

export default apiClient;
