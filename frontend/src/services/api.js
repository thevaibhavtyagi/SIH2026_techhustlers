import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProjects = async (filters = {}) => {
  const { data } = await apiClient.get('/projects', { params: filters });
  return data;
};

export const getProjectById = async (id) => {
  const { data } = await apiClient.get(`/projects/${id}`);
  return data;
};

export const getAlerts = async (filters = {}) => {
  const { data } = await apiClient.get('/alerts', { params: filters });
  return data;
};

export const getContractors = async (filters = {}) => {
  const { data } = await apiClient.get('/contractors', { params: filters });
  return data;
};

export const getContractorById = async (id) => {
  const { data } = await apiClient.get(`/contractors/${id}`);
  return data;
};

export const getStateRiskData = async () => {
  const { data } = await apiClient.get('/states/risk-data');
  return data;
};

export const getStateByName = async (name) => {
  const { data } = await apiClient.get(`/states/${name}`);
  return data;
};

export const getDashboardStats = async (role = 'admin', constituency = null) => {
  const { data } = await apiClient.get('/dashboard/stats', { params: { role, constituency } });
  return data;
};

export const getRiskAnalysis = async () => {
  const { data } = await apiClient.get('/risk-analysis');
  return data;
};

export const getInvestigations = async () => {
  const { data } = await apiClient.get('/investigations');
  return data;
};

export const getCopilotResponse = async (query) => {
  const { data } = await apiClient.post('/copilot/chat', { query });
  return data.response;
};

export const getCopilotSuggestions = async () => {
  const { data } = await apiClient.get('/copilot/suggestions');
  return data;
};

export const getCopilotWelcome = async () => {
  const { data } = await apiClient.get('/copilot/welcome');
  return data;
};

export const generateReport = async (config) => {
  const { data } = await apiClient.post('/reports/generate', config);
  return data;
};

export const submitConcern = async (concernData) => {
  const { data } = await apiClient.post('/citizen/concern', concernData);
  return data;
};

export const getExpenditureData = async () => {
  const { data } = await apiClient.get('/expenditure');
  return data;
};

export const getProgressData = async () => {
  const { data } = await apiClient.get('/progress');
  return data;
};

export default apiClient;
