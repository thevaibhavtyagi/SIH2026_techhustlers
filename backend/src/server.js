const env = require('./config/env');
const app = require('./app');

const server = app.listen(env.port, () => {
  console.log(`Server running on port ${env.port} [${env.nodeEnv}]`);
});

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully...`);
  server.close(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
