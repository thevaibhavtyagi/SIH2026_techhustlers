// Must stay in sync with frontend/src/utils/constants.js ROLES.
// There is no public role — every account is provisioned by an admin via
// POST /api/users. There is no public self-registration endpoint.
const ROLES = Object.freeze({
  ADMIN: 'admin',
  DISTRICT_NODAL: 'district_nodal',
  MP: 'mp',
});

// Roles that must be provisioned by an admin via POST /api/users (i.e. all of them).
const ADMIN_PROVISIONED_ROLES = [ROLES.ADMIN, ROLES.DISTRICT_NODAL, ROLES.MP];

const ALL_ROLES = Object.values(ROLES);

module.exports = { ROLES, ADMIN_PROVISIONED_ROLES, ALL_ROLES };
