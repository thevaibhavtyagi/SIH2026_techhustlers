const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const mlController = require('../controllers/ml.controller');

const router = Router();

// Project data is readable by any authenticated internal role.
router.use(authenticate);

router.get('/', mlController.getProjects);
router.post('/', authorize('admin'), mlController.createProject);
// work_id looks like "WS/MP620/2024-2025/133166" — (.*) lets the param capture the slashes.
router.get('/:workId(.*)', mlController.getProject);

module.exports = router;
