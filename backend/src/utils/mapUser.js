// Maps a raw `users` table row (snake_case, includes password_hash) to the
// shape sent to clients / attached to req.user — never leaks the hash.
const toPublicUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  phone: row.phone,
  designation: row.designation,
  department: row.department,
  state: row.state,
  district: row.district,
  constituency: row.constituency,
  isActive: row.is_active,
  lastLoginAt: row.last_login_at,
  createdAt: row.created_at,
});

module.exports = { toPublicUser };
