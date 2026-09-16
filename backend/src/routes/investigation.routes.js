const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const mlController = require('../controllers/ml.controller');
const { ROLES } = require('../constants/roles');

const router = Router();

// Investigation queue/reports are restricted to internal fraud-investigation roles.
router.use(authenticate, authorize(ROLES.ADMIN, ROLES.DISTRICT_NODAL, ROLES.MP));

router.get('/', mlController.getInvestigations);
// Specific routes before the generic one so they don't get swallowed by :workId
router.get('/:workId(.*)/export', mlController.exportInvestigationReport);
router.get('/:workId(.*)/report', mlController.getInvestigationReport);
router.get('/:workId(.*)', mlController.getInvestigation);

module.exports = router;
