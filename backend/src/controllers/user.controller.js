const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user.service');

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createProvisionedUser(req.body);
  res.status(201).json({ success: true, message: 'Account provisioned successfully', data: { user } });
});

const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  res.json({ success: true, data: result });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json({ success: true, data: { user } });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.json({ success: true, message: 'User updated successfully', data: { user } });
});

module.exports = { createUser, listUsers, getUser, updateUser };
