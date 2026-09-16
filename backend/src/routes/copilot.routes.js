const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const copilotController = require('../controllers/copilot.controller');

const router = Router();

router.use(authenticate);

router.post('/query', copilotController.askCopilot);

module.exports = router;
