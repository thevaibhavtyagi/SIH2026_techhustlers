const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@mpladsdrishti.gov.in';
const ADMIN_PASSWORD = 'NewAdmin@123';

async function runTests() {
  console.log('--- USER MANAGEMENT TESTS ---');
  let adminToken = null;
  let districtToken = null;

  // 1. Get Admin Token
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
    adminToken = loginRes.data.data.accessToken;
    console.log('Admin login: SUCCESS');
  } catch (err) {
    console.error('Admin login failed:', err.message);
    return;
  }

  const adminClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${adminToken}` }, validateStatus: () => true });
  const anonClient = axios.create({ baseURL: BASE_URL, validateStatus: () => true });

  const randomSuffix = crypto.randomBytes(4).toString('hex');
  const mpEmail = `test_mp_${randomSuffix}@example.com`;
  const districtEmail = `test_district_${randomSuffix}@example.com`;

  // Test 1: Admin Create MP (Valid)
  const createMpRes = await adminClient.post('/users', {
    name: 'Test MP',
    email: mpEmail,
    password: 'Password@123',
    role: 'mp',
    constituency: 'Test Constituency'
  });
  console.log('Admin create MP (Valid):', createMpRes.status, createMpRes.data.success ? 'SUCCESS' : createMpRes.data.message);
  const mpId = createMpRes.data.data?.user?.id;

  // Test 2: Admin Create District (Valid)
  const createDistRes = await adminClient.post('/users', {
    name: 'Test District',
    email: districtEmail,
    password: 'Password@123',
    role: 'district_nodal',
    state: 'Kerala',
    district: 'Ernakulam'
  });
  console.log('Admin create District (Valid):', createDistRes.status, createDistRes.data.success ? 'SUCCESS' : createDistRes.data.message);
  const distId = createDistRes.data.data?.user?.id;

  // Test 3: MP create user missing constituency (Invalid)
  const createMpInvalid = await adminClient.post('/users', {
    name: 'Test MP Invalid',
    email: `invalid_${mpEmail}`,
    password: 'Password@123',
    role: 'mp'
  });
  console.log('Admin create MP (Missing Constituency):', createMpInvalid.status, createMpInvalid.data.success === false ? 'EXPECTED ERROR' : 'FAILED');

  // Test 4: District create user missing state/district (Invalid)
  const createDistInvalid = await adminClient.post('/users', {
    name: 'Test Dist Invalid',
    email: `invalid_${districtEmail}`,
    password: 'Password@123',
    role: 'district_nodal',
    state: 'StateX' // missing district
  });
  console.log('Admin create District (Missing District):', createDistInvalid.status, createDistInvalid.data.success === false ? 'EXPECTED ERROR' : 'FAILED');

  // Test 5: Duplicate Email
  const dupEmail = await adminClient.post('/users', {
    name: 'Duplicate',
    email: mpEmail,
    password: 'Password@123',
    role: 'mp',
    constituency: 'X'
  });
  console.log('Duplicate Email:', dupEmail.status, dupEmail.data.error === 'CONFLICT' ? 'EXPECTED ERROR' : 'FAILED');

  // Test 6: Invalid Password
  const invalidPass = await adminClient.post('/users', {
    name: 'Invalid Pass',
    email: `pass_${mpEmail}`,
    password: 'password',
    role: 'mp',
    constituency: 'X'
  });
  console.log('Invalid Password:', invalidPass.status, invalidPass.data.success === false ? 'EXPECTED ERROR' : 'FAILED');

  // Test 7: Admin List Users
  const listUsers = await adminClient.get('/users');
  console.log('Admin list users:', listUsers.status, listUsers.data.success ? `FOUND ${listUsers.data.data.users.length}` : 'FAILED');
  
  const passwordsLeaked = listUsers.data.data?.users?.some(u => !!u.password_hash);
  console.log('Passwords leaked in list?', passwordsLeaked);

  // Test 8: Admin Get User
  const getUser = await adminClient.get(`/users/${mpId}`);
  console.log('Admin get user:', getUser.status, getUser.data.data?.user?.email === mpEmail ? 'SUCCESS' : 'FAILED');

  // Test 9: Admin Update User
  const updateUser = await adminClient.patch(`/users/${mpId}`, { name: 'Updated MP Name' });
  console.log('Admin update user:', updateUser.status, updateUser.data.data?.user?.name === 'Updated MP Name' ? 'SUCCESS' : 'FAILED');

  // Test 10: Unauthenticated Request
  const anonGet = await anonClient.get('/users');
  console.log('Unauthenticated request:', anonGet.status, anonGet.status === 401 ? 'EXPECTED 401' : 'FAILED');

  // Test 11: District Login & Authorization check
  try {
    const distLogin = await axios.post(`${BASE_URL}/auth/login`, { email: districtEmail, password: 'Password@123', role: 'district_nodal' });
    districtToken = distLogin.data.data.accessToken;
    console.log('District login:', distLogin.status === 200 ? 'SUCCESS' : 'FAILED');
  } catch(e) {
    console.log('District login failed', e.message);
  }

  const distClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${districtToken}` }, validateStatus: () => true });

  const distGetUsers = await distClient.get('/users');
  console.log('District list users:', distGetUsers.status, distGetUsers.status === 403 ? 'EXPECTED 403' : 'FAILED');

  const distUpdate = await distClient.patch(`/users/${distId}`, { name: 'Hacked Name' });
  console.log('District update user:', distUpdate.status, distUpdate.status === 403 ? 'EXPECTED 403' : 'FAILED');

  console.log('\n--- TESTS COMPLETED ---');
}

runTests();
