const axios = require('axios');
const supabase = require('./src/config/supabaseClient');

const BASE_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@mpladsdrishti.gov.in';
const ADMIN_PASSWORD = 'NewAdmin@123';

const MP_EMAIL = 'test_mp_cd072750@example.com';
const MP_PASS = 'Password@123';
const DIST_EMAIL = 'test_district_cd072750@example.com';
const DIST_PASS = 'Password@123';

async function run() {
  console.log('--- STARTING SECURITY TEST ---');

  // 1. Admin login
  const adminLogin = await axios.post(`${BASE_URL}/auth/login`, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
  const adminToken = adminLogin.data.data.accessToken;
  const adminClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${adminToken}` }, validateStatus: () => true });

  // 2. Find a real project
  const p1Res = await adminClient.get('/projects/WS%2FMP352%2F2025-2026%2F135862');
  const p1 = p1Res.data.data;
  console.log(`Found Real Project 1: ${p1.id} -> State: ${p1.state}, District: ${p1.district}, Constituency: ${p1.constituency}`);
  
  // 3. Find another real project in a different state/constituency
  const p2Res = await adminClient.get('/projects/WS%2FMP620%2F2024-2025%2F133166');
  const p2 = p2Res.data.data;
  console.log(`Found Real Project 2: ${p2.id} -> State: ${p2.state}, District: ${p2.district}, Constituency: ${p2.constituency}`);

  // 4. Update test users to match p1's geography
  await supabase.from('users').update({ constituency: p1.constituency }).eq('email', MP_EMAIL);
  await supabase.from('users').update({ state: p1.state, district: p1.district }).eq('email', DIST_EMAIL);
  console.log(`Updated test MP to constituency: ${p1.constituency}`);
  console.log(`Updated test Nodal to ${p1.state} / ${p1.district}`);

  // 5. Login as MP and Nodal
  const mpLogin = await axios.post(`${BASE_URL}/auth/login`, { email: MP_EMAIL, password: MP_PASS, role: 'mp' });
  const mpToken = mpLogin.data.data.accessToken;
  const mpClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${mpToken}` }, validateStatus: () => true });

  const distLogin = await axios.post(`${BASE_URL}/auth/login`, { email: DIST_EMAIL, password: DIST_PASS, role: 'district_nodal' });
  const distToken = distLogin.data.data.accessToken;
  const distClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${distToken}` }, validateStatus: () => true });

  console.log('\n--- MP ROLE TESTING ---');
  // List Projects
  const mpProjects = await mpClient.get('/projects');
  console.log(`MP List Projects (Expected: Only ${p1.constituency}): ${mpProjects.data.data.projects.every(p => p.constituency === p1.constituency)}`);
  
  // List Projects Malicious Query
  const mpProjectsMalicious = await mpClient.get(`/projects?constituency=${p2.constituency}`);
  console.log(`MP Malicious Query (Expected: Still ${p1.constituency}, ignoring malicious filter): ${mpProjectsMalicious.data.data.projects.every(p => p.constituency === p1.constituency)}`);
  
  // Get Project In Scope
  const mpGetP1 = await mpClient.get(`/projects/${encodeURIComponent(p1.id)}`);
  console.log(`MP Get Own Project: ${mpGetP1.status === 200 ? 'SUCCESS' : 'FAILED'}`);
  
  // Get Project Out of Scope
  const mpGetP2 = await mpClient.get(`/projects/${encodeURIComponent(p2.id)}`);
  console.log(`MP Get Other Project: ${mpGetP2.status === 403 ? 'SUCCESS 403' : 'FAILED ' + mpGetP2.status}`);
  
  // Analytics In Scope
  const mpAnalytics = await mpClient.get('/analytics/overview');
  console.log(`MP Analytics Total Projects (Expected: small subset for ${p1.constituency}): ${mpAnalytics.data.data.total_projects}`);
  
  console.log('\n--- DISTRICT NODAL ROLE TESTING ---');
  // List Projects
  const distProjects = await distClient.get('/projects');
  console.log(`Nodal List Projects (Expected: Only ${p1.district}): ${distProjects.data.data.projects.every(p => p.district === p1.district && p.state === p1.state)}`);
  
  // List Projects Malicious Query
  const distProjectsMalicious = await distClient.get(`/projects?district=${p2.district}`);
  console.log(`Nodal Malicious Query (Expected: Still ${p1.district}): ${distProjectsMalicious.data.data.projects.every(p => p.district === p1.district)}`);

  // Get Project In Scope
  const distGetP1 = await distClient.get(`/projects/${encodeURIComponent(p1.id)}`);
  console.log(`Nodal Get Own Project: ${distGetP1.status === 200 ? 'SUCCESS' : 'FAILED'}`);

  // Get Project Out of Scope
  const distGetP2 = await distClient.get(`/projects/${encodeURIComponent(p2.id)}`);
  console.log(`Nodal Get Other Project: ${distGetP2.status === 403 ? 'SUCCESS 403' : 'FAILED ' + distGetP2.status}`);

  // Analytics In Scope
  const distAnalytics = await distClient.get('/analytics/overview');
  console.log(`Nodal Analytics Total Projects (Expected: subset for ${p1.district}): ${distAnalytics.data.data.total_projects}`);

  console.log('\n--- ADMIN TESTING ---');
  const adminAnalytics = await adminClient.get('/analytics/overview');
  console.log(`Admin Analytics Total Projects (Expected: ~13694): ${adminAnalytics.data.data.total_projects}`);

}
run().catch(console.error);
