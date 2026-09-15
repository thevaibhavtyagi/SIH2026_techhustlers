const ApiError = require('../utils/ApiError');
const userRepo = require('../repositories/user.repository');
const { hashPassword } = require('../utils/password');
const { toPublicUser } = require('../utils/mapUser');
const tokenService = require('./token.service');

// Admin-only provisioning — the only way any account (admin / district_nodal / mp) is created.
const createProvisionedUser = async (payload) => {
  const existing = await userRepo.findByEmail(payload.email);
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await hashPassword(payload.password);

  const user = await userRepo.create({
    name: payload.name,
    email: payload.email,
    password_hash: passwordHash,
    role: payload.role,
    phone: payload.phone,
    designation: payload.designation,
    department: payload.department,
    state: payload.state,
    district: payload.district,
    constituency: payload.constituency,
  });

  return toPublicUser(user);
};

const listUsers = async (query) => {
  const { items, total } = await userRepo.list(query);
  return {
    users: items.map(toPublicUser),
    pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) },
  };
};

const getUserById = async (id) => {
  const user = await userRepo.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  return toPublicUser(user);
};

const updateUser = async (id, patch) => {
  const existing = await userRepo.findById(id);
  if (!existing) throw ApiError.notFound('User not found');

  const dbPatch = {
    ...(patch.name !== undefined && { name: patch.name }),
    ...(patch.phone !== undefined && { phone: patch.phone }),
    ...(patch.designation !== undefined && { designation: patch.designation }),
    ...(patch.department !== undefined && { department: patch.department }),
    ...(patch.state !== undefined && { state: patch.state }),
    ...(patch.district !== undefined && { district: patch.district }),
    ...(patch.constituency !== undefined && { constituency: patch.constituency }),
    ...(patch.isActive !== undefined && { is_active: patch.isActive }),
  };

  const updated = await userRepo.updateById(id, dbPatch);

  // Deactivating an account should also kill any live sessions immediately.
  if (patch.isActive === false) {
    await tokenService.revokeAllUserRefreshTokens(id);
  }

  return toPublicUser(updated);
};

module.exports = { createProvisionedUser, listUsers, getUserById, updateUser };
