const axios = require('axios');
const env = require('./env');

// Internal, server-to-server client for the Python (FastAPI) risk-intelligence
// service in ml_engine/. That service has no auth of its own — it must never
// be reachable directly from the browser, only through this gateway, which
// enforces JWT auth + RBAC before forwarding.
const mlClient = axios.create({
  baseURL: env.mlEngineUrl,
  // Render's free tier can take 30-50s to wake a sleeping instance.
  timeout: 45_000,
});

module.exports = mlClient;
