const { Router } = require('express');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const userController = require('../controllers/user.controller');
const { ROLES } = require('../constants/roles');
const { createUserSchema, updateUserSchema, listUsersQuerySchema, idParamSchema } = require('../validators/user.validators');

const router = Router();

// Every route below requires a valid access token; only admins manage other accounts.
router.use(authenticate, authorize(ROLES.ADMIN));

router.post('/', validate(createUserSchema), userController.createUser);
router.get('/', validate(listUsersQuerySchema, 'query'), userController.listUsers);
router.get('/:id', validate(idParamSchema, 'params'), userController.getUser);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateUserSchema), userController.updateUser);

module.exports = router;
