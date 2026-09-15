const axios = require('axios');
const API = 'http://localhost:5000/api';

(async () => {
  let token = null;

  try {
    const res = await axios.post(API + '/auth/login', { email: 'admin@mpladsdrishti.gov.in', password: 'Admin@123', role: 'admin' });
    console.log('1. Valid login: PASS', res.status);
    token = res.data.data.accessToken;
  } catch (err) {
    console.log('1. Valid login: FAIL', err.response?.status);
  }

  try {
    await axios.post(API + '/auth/login', { email: 'admin@mpladsdrishti.gov.in', password: 'WrongPassword!', role: 'admin' });
    console.log('2. Invalid password: FAIL');
  } catch (err) {
    console.log('2. Invalid password: PASS', err.response?.status);
  }

  try {
    await axios.post(API + '/auth/login', { email: 'nobody@example.com', password: 'Admin@123', role: 'admin' });
    console.log('3. Unknown email: FAIL');
  } catch (err) {
    console.log('3. Unknown email: PASS', err.response?.status);
  }

  try {
    await axios.post(API + '/auth/login', { email: 'admin@mpladsdrishti.gov.in', password: 'Admin@123', role: 'mp' });
    console.log('4. Invalid role: FAIL');
  } catch (err) {
    console.log('4. Invalid role: PASS', err.response?.status);
  }

  if (token) {
    try {
      const res = await axios.get(API + '/auth/me', { headers: { Authorization: 'Bearer ' + token } });
      console.log('5. GET /api/auth/me: PASS', res.status);
    } catch (err) {
      console.log('5. GET /api/auth/me: FAIL', err.response?.status);
    }
    
    try {
      const res = await axios.get(API + '/projects?limit=1', { headers: { Authorization: 'Bearer ' + token } });
      console.log('6. GET /api/projects: PASS', res.status);
    } catch (err) {
      console.log('6. GET /api/projects: FAIL', err.response?.status);
    }
  }
})();
