const { Router } = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const projectRoutes = require('./project.routes');
const riskRoutes = require('./risk.routes');
const investigationRoutes = require('./investigation.routes');
const analyticsRoutes = require('./analytics.routes');
const copilotRoutes = require('./copilot.routes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/risk', riskRoutes);
router.use('/investigations', investigationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/copilot', copilotRoutes);

module.exports = router;
