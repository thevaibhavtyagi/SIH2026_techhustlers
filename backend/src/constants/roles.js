// Must stay in sync with frontend/src/utils/constants.js ROLES
const ROLES = Object.freeze({
  ADMIN: 'admin',
  DISTRICT_NODAL: 'district_nodal',
  MP: 'mp',
  CITIZEN: 'citizen',
});

// Roles a member of the public can self-register as via POST /api/auth/register.
const PUBLIC_SIGNUP_ROLES = [ROLES.CITIZEN];

// Roles that must be provisioned by an admin via POST /api/users.
const ADMIN_PROVISIONED_ROLES = [ROLES.ADMIN, ROLES.DISTRICT_NODAL, ROLES.MP];

const ALL_ROLES = Object.values(ROLES);

module.exports = { ROLES, PUBLIC_SIGNUP_ROLES, ADMIN_PROVISIONED_ROLES, ALL_ROLES };
