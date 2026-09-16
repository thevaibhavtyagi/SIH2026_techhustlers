import axios from 'axios';
import {
  MOCK_CONTRACTORS,
  COPILOT_WELCOME, COPILOT_SUGGESTIONS, mockCopilotResponse,
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
export const riskApi = {
  getProjects: (params) => apiClient.get('/projects', { params }).then((r) => r.data.data),
  getProject: (workId) => apiClient.get(`/projects/${encodeURIComponent(workId)}`).then((r) => r.data.data),
  getRiskSummary: () => apiClient.get('/risk/summary').then((r) => r.data.data),
  getRiskDistribution: () => apiClient.get('/risk/distribution').then((r) => r.data.data),
  getInvestigations: (params) => apiClient.get('/investigations', { params }).then((r) => r.data.data),
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

export const getContractors = async () => {
  await delay(200);
  return MOCK_CONTRACTORS;
};

export const getContractorById = async (id) => {
  await delay(150);
  return MOCK_CONTRACTORS.find((c) => c.id === id) || null;
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

export const getCopilotResponse = async (query) => {
  await delay(500);
  return mockCopilotResponse(query);
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
