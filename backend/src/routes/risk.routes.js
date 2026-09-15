const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const mlController = require('../controllers/ml.controller');
const { ROLES } = require('../constants/roles');

const router = Router();

// Fraud/risk intelligence is restricted to internal roles.
router.use(authenticate, authorize(ROLES.ADMIN, ROLES.DISTRICT_NODAL, ROLES.MP));

router.get('/summary', mlController.getRiskSummary);
router.get('/distribution', mlController.getRiskDistribution);

module.exports = router;
