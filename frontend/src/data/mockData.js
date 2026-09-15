// Realistic MPLADS-shaped mock data so the dashboard UI can be built and
// demoed without waiting on the ml_engine risk pipeline being wired end to
// end. Field names match what pages/admin, pages/mp, pages/district expect.
// See src/services/api.js for which calls are mock vs the real backend.

const WORK_TYPES = [
  'Road Construction', 'Bridge Construction', 'Community Hall', 'School Building',
  'Hospital / Health Center', 'Water Supply', 'Drainage System', 'Electrification',
  'Sanitation Facility', 'Park / Playground',
];

const STATUSES = ['On Track', 'Delayed', 'Under Review', 'Completed', 'High Risk'];

const CONTRACTORS = [
  { id: 'CTR-001', name: 'Sharma Infrastructure Pvt. Ltd.', state: 'Uttar Pradesh', riskScore: 72, activeProjects: 14, completedProjects: 38, delayRate: 34, avgDelayDays: 46 },
  { id: 'CTR-002', name: 'Bharat Nirman Constructions', state: 'Bihar', riskScore: 81, activeProjects: 9, completedProjects: 21, delayRate: 41, avgDelayDays: 58 },
  { id: 'CTR-003', name: 'Konkan Builders & Co.', state: 'Maharashtra', riskScore: 28, activeProjects: 22, completedProjects: 67, delayRate: 12, avgDelayDays: 9 },
  { id: 'CTR-004', name: 'Deccan Infra Works', state: 'Karnataka', riskScore: 45, activeProjects: 11, completedProjects: 29, delayRate: 22, avgDelayDays: 21 },
  { id: 'CTR-005', name: 'Purvanchal Roadways Ltd.', state: 'Uttar Pradesh', riskScore: 88, activeProjects: 7, completedProjects: 14, delayRate: 55, avgDelayDays: 71 },
];

const LOCATIONS = [
  { state: 'Uttar Pradesh', district: 'Varanasi', constituency: 'Varanasi' },
  { state: 'Uttar Pradesh', district: 'Gorakhpur', constituency: 'Gorakhpur' },
  { state: 'Bihar', district: 'Patna', constituency: 'Patna Sahib' },
  { state: 'Bihar', district: 'Gaya', constituency: 'Gaya' },
  { state: 'Maharashtra', district: 'Pune', constituency: 'Pune' },
  { state: 'Maharashtra', district: 'Nagpur', constituency: 'Nagpur' },
  { state: 'Karnataka', district: 'Bengaluru', constituency: 'Bengaluru North' },
  { state: 'West Bengal', district: 'Kolkata', constituency: 'Kolkata Dakshin' },
  { state: 'Rajasthan', district: 'Jaipur', constituency: 'Jaipur' },
  { state: 'Tamil Nadu', district: 'Chennai', constituency: 'Chennai Central' },
];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const isoDate = (daysAgo) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const isoFuture = (daysAhead) => new Date(Date.now() + daysAhead * 86400000).toISOString();

const PROJECT_NAMES = [
  'Construction of link road at', 'Community hall building in', 'Rural water supply scheme for',
  'Drainage system upgrade in', 'Primary school renovation at', 'Health sub-center construction in',
  'Street lighting project for', 'Public park development in', 'Bridge repair at', 'Sanitation facility in',
];

function buildProject(i) {
  const loc = pick(LOCATIONS);
  const riskScore = rand(5, 96);
  const sanctionedAmount = rand(500000, 9500000);
  const overrun = riskScore > 70 ? rand(105, 145) / 100 : rand(60, 100) / 100;
  const progress = riskScore > 75 ? rand(5, 35) : rand(20, 100);
  const status = riskScore > 75 ? 'High Risk' : progress >= 100 ? 'Completed' : progress < 30 ? 'Delayed' : pick(STATUSES.slice(0, 3));
  const contractor = pick(CONTRACTORS);

  return {
    id: `MPLAD-${10000 + i}`,
    name: `${pick(PROJECT_NAMES)} ${loc.constituency}`,
    state: loc.state,
    district: loc.district,
    constituency: loc.constituency,
    workType: pick(WORK_TYPES),
    sanctionedAmount,
    expenditure: Math.round(sanctionedAmount * overrun),
    progress,
    status,
    riskScore,
    riskLevel: riskScore >= 75 ? 'Critical' : riskScore >= 60 ? 'High' : riskScore >= 40 ? 'Moderate' : 'Low',
    aiAnomalyReason:
      riskScore >= 75
        ? 'Expenditure is significantly above the sanctioned amount while physical progress remains low — a pattern consistent with fund diversion in similar flagged cases.'
        : riskScore >= 60
        ? 'Payment clustering detected near the financial year-end, combined with a slower-than-expected completion rate.'
        : riskScore >= 40
        ? 'Minor deviation from the expected expenditure-to-progress ratio for this work category.'
        : 'No significant anomaly — project is progressing in line with similar sanctioned works.',
    sanctionDate: isoDate(rand(60, 720)),
    expectedCompletion: isoFuture(rand(-30, 300)),
    contractorId: contractor.id,
    pinCode: `${rand(110001, 855999)}`,
  };
}

export const MOCK_PROJECTS = Array.from({ length: 60 }, (_, i) => buildProject(i));

export const MOCK_CONTRACTORS = CONTRACTORS;

const ALERT_CATEGORIES = ['Financial', 'Progress', 'Contractor', 'Documentation'];

export const MOCK_ALERTS = MOCK_PROJECTS.filter((p) => p.riskScore >= 55)
  .slice(0, 25)
  .map((p, i) => ({
    id: `ALT-${2000 + i}`,
    projectId: p.id,
    description: p.aiAnomalyReason,
    category: pick(ALERT_CATEGORIES),
    severity: p.riskScore >= 75 ? 'Critical' : p.riskScore >= 60 ? 'High' : 'Medium',
    status: pick(['New', 'Assigned', 'Investigating', 'Resolved']),
    timestamp: isoDate(rand(0, 20)),
  }));

export const COPILOT_WELCOME = "Hi, I'm Drishti Copilot. Ask me about projects, risk scores, or delays in plain English.";

export const COPILOT_SUGGESTIONS = [
  'Show me high-risk projects in Uttar Pradesh',
  "What's the average completion rate this quarter?",
  'Which contractors have the highest delay rate?',
  'Summarize this week’s critical alerts',
];

export function mockCopilotResponse(query) {
  const q = query.toLowerCase();

  if (q.includes('high-risk') || q.includes('high risk') || q.includes('critical')) {
    const rows = MOCK_PROJECTS.filter((p) => p.riskScore >= 75)
      .slice(0, 5)
      .map((p) => ({ project: p.id, location: `${p.district}, ${p.state}`, risk: p.riskScore }));
    return {
      text: `Found ${MOCK_PROJECTS.filter((p) => p.riskScore >= 75).length} critical-risk projects. Top 5 shown below.`,
      type: 'table',
      data: rows,
      insight: 'Uttar Pradesh and Bihar account for the majority of critical flags this cycle.',
    };
  }

  if (q.includes('contractor')) {
    const rows = [...MOCK_CONTRACTORS]
      .sort((a, b) => b.delayRate - a.delayRate)
      .map((c) => ({ metric: c.name, value: `${c.delayRate}% delay rate` }));
    return { text: 'Contractors ranked by delay rate:', type: 'list', data: rows };
  }

  if (q.includes('completion') || q.includes('progress')) {
    const avg = Math.round(MOCK_PROJECTS.reduce((s, p) => s + p.progress, 0) / MOCK_PROJECTS.length);
    return { text: `Average physical completion across tracked projects is ${avg}%.`, type: 'text' };
  }

  return {
    text: "I can help with project status, risk scores, contractor performance, and alerts. Try one of the suggestions below, or ask about a specific state or project ID.",
    type: 'text',
  };
}
