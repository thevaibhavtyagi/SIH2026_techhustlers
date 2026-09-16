require('dotenv').config();

const required = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 5000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  mlEngineUrl: process.env.ML_ENGINE_URL || 'http://localhost:8000',

  groq: {
    apiKey: process.env.GROQ_API_KEY || null,
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    // Server-side only — full admin access, bypasses Row Level Security. Never expose to the client.
    secretKey: process.env.SUPABASE_SECRET_KEY,
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresInDays: Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS) || 7,
    issuer: process.env.JWT_ISSUER || 'mplads-drishti-api',
  },

  refreshCookieName: process.env.REFRESH_TOKEN_COOKIE_NAME || 'mplads_refresh_token',

  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,

  passwordResetTokenExpiresMin: Number(process.env.PASSWORD_RESET_TOKEN_EXPIRES_MIN) || 30,

  rateLimit: {
    windowMin: Number(process.env.RATE_LIMIT_WINDOW_MIN) || 15,
    maxAttempts: Number(process.env.RATE_LIMIT_MAX_ATTEMPTS) || 20,
  },

  accountLock: {
    threshold: Number(process.env.ACCOUNT_LOCK_THRESHOLD) || 5,
    minutes: Number(process.env.ACCOUNT_LOCK_MINUTES) || 15,
  },

  seedAdmin: {
    name: process.env.SEED_ADMIN_NAME || 'System Administrator',
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
  },
};
