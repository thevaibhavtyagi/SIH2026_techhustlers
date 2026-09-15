import axios from 'axios';
import {
  MOCK_PROJECTS, MOCK_CONTRACTORS, MOCK_ALERTS,
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
// Field names here match ml_engine's raw output (work_id, snake_case) —
// distinct from the flattened mock shapes below.
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
// Dashboard UI data — MOCK for now (no backend endpoint yet for these
// aggregate/demo shapes). Same function names/signatures the pages already
// use, so pages/admin, pages/mp, pages/district work unmodified. Swap the
// body for a real apiClient call once a matching backend route exists.
// ============================================================

// `scope` narrows by constituency (mp) or district (district_nodal); admins pass null for all-India totals.
export const getDashboardStats = async (role = 'admin', scope = null) => {
  await delay(250);
  let projects = MOCK_PROJECTS;
  if (scope) projects = projects.filter((p) => p.constituency === scope || p.district === scope);

  const totalProjects = projects.length;
  const highRiskAlerts = projects.filter((p) => p.riskScore >= 60).length;
  const completed = projects.filter((p) => p.status === 'Completed').length;
  const totalFunds = projects.reduce((sum, p) => sum + p.sanctionedAmount, 0);

  return {
    totalProjects,
    highRiskAlerts,
    completionRate: totalProjects ? Math.round((completed / totalProjects) * 100) : 0,
    totalFunds,
  };
};

export const getProjects = async (filters = {}) => {
  const data = await riskApi.getProjects(filters);
  let results = data.projects || [];
  
  if (filters.search) {
    const s = filters.search.toLowerCase();
    results = results.filter(
      (p) => p.id.toLowerCase().includes(s) || p.name.toLowerCase().includes(s) || p.district?.toLowerCase().includes(s)
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

export const getAlerts = async (filters = {}) => {
  await delay(200);
  let results = MOCK_ALERTS;
  if (filters.projectId) results = results.filter((a) => a.projectId === filters.projectId);
  if (filters.severity) results = results.filter((a) => a.severity === filters.severity);
  if (filters.category) results = results.filter((a) => a.category === filters.category);
  if (filters.status) results = results.filter((a) => a.status === filters.status);
  if (filters.constituency) {
    const ids = new Set(MOCK_PROJECTS.filter((p) => p.constituency === filters.constituency).map((p) => p.id));
    results = results.filter((a) => ids.has(a.projectId));
  }
  if (filters.district) {
    const ids = new Set(MOCK_PROJECTS.filter((p) => p.district === filters.district).map((p) => p.id));
    results = results.filter((a) => ids.has(a.projectId));
  }
  return results;
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

export const getExpenditureData = async () => {
  await delay(200);
  return MOCK_PROJECTS.map((p) => ({ month: p.sanctionDate.slice(0, 7), amount: p.expenditure }));
};

export const getProgressData = async () => {
  await delay(200);
  return MOCK_PROJECTS.map((p) => ({ id: p.id, progress: p.progress }));
};

export const getStateRiskData = async () => {
  await delay(200);
  const byState = {};
  for (const p of MOCK_PROJECTS) {
    byState[p.state] ??= { state: p.state, projects: 0, highRiskProjects: 0, totalRisk: 0 };
    byState[p.state].projects += 1;
    byState[p.state].totalRisk += p.riskScore;
    if (p.riskScore >= 60) byState[p.state].highRiskProjects += 1;
  }
  return Object.values(byState).map((s) => ({ ...s, riskScore: Math.round(s.totalRisk / s.projects) }));
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
