const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const mlController = require('../controllers/ml.controller');

const router = Router();

router.use(authenticate);

router.get('/overview', mlController.getAnalyticsOverview);
router.get('/states', mlController.getAnalyticsStates);
router.get('/categories', mlController.getAnalyticsCategories);
router.get('/constituencies', mlController.getAnalyticsConstituencies);

module.exports = router;
