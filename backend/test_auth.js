const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';
const EMAIL = 'admin@mpladsdrishti.gov.in';
const PASSWORD = 'NewAdmin@123';
const ROLE = 'admin';

async function runTests() {
  console.log('--- AUTHENTICATION TESTS ---');
  let accessToken = null;
  let cookie = null;

  try {
    console.log('\n[1] TEST: Login with valid credentials');
    const loginRes = await axios.post(`${BASE_URL}/login`, { email: EMAIL, password: PASSWORD, role: ROLE });
    console.log('Login Status:', loginRes.status);
    accessToken = loginRes.data.data.accessToken;
    cookie = loginRes.headers['set-cookie'][0];
    console.log('Access Token received:', !!accessToken);
    console.log('Set-Cookie received:', !!cookie);
  } catch (err) {
    console.error('Login Failed:', err.response?.data || err.message);
  }

  try {
    console.log('\n[2] TEST: Login with wrong password');
    await axios.post(`${BASE_URL}/login`, { email: EMAIL, password: 'wrongpassword', role: ROLE });
  } catch (err) {
    console.log('Expected Error Status:', err.response?.status);
    console.log('Error Format:', err.response?.data);
  }

  try {
    console.log('\n[3] TEST: Access /me with valid token');
    const meRes = await axios.get(`${BASE_URL}/me`, { headers: { Authorization: `Bearer ${accessToken}` } });
    console.log('Me Status:', meRes.status);
    console.log('User Role:', meRes.data.data.user.role);
    // ensure no password hash is returned
    console.log('Password hash leaked?', !!meRes.data.data.user.password_hash);
  } catch (err) {
    console.error('Me Failed:', err.response?.data || err.message);
  }

  try {
    console.log('\n[4] TEST: Refresh token');
    const refreshRes = await axios.post(`${BASE_URL}/refresh`, {}, { headers: { Cookie: cookie } });
    console.log('Refresh Status:', refreshRes.status);
    accessToken = refreshRes.data.data.accessToken;
    cookie = refreshRes.headers['set-cookie'][0];
    console.log('New Access Token:', !!accessToken);
  } catch (err) {
    console.error('Refresh Failed:', err.response?.data || err.message);
  }

  try {
    console.log('\n[5] TEST: Logout');
    const logoutRes = await axios.post(`${BASE_URL}/logout`, {}, { headers: { Cookie: cookie } });
    console.log('Logout Status:', logoutRes.status);
    console.log('Cookie cleared:', logoutRes.headers['set-cookie'][0].includes('Max-Age=0') || logoutRes.headers['set-cookie'][0].includes('Expires='));
  } catch (err) {
    console.error('Logout Failed:', err.response?.data || err.message);
  }

  try {
    console.log('\n[6] TEST: Try old refresh token after logout');
    await axios.post(`${BASE_URL}/refresh`, {}, { headers: { Cookie: cookie } });
    console.log('Unexpected success - token should be invalid');
  } catch (err) {
    console.log('Expected Error Status:', err.response?.status);
  }

  try {
    console.log('\n[7] TEST: Forgot password');
    const forgotRes = await axios.post(`${BASE_URL}/forgot-password`, { email: EMAIL });
    console.log('Forgot Password Status:', forgotRes.status);
    console.log('Has debug reset token:', !!forgotRes.data.devResetToken);
  } catch (err) {
    console.error('Forgot Password Failed:', err.response?.data || err.message);
  }
}

runTests();
