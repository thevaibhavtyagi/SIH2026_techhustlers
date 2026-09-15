// One-time bootstrap: creates the first admin account from env vars, since
// every other way to create an admin/mp/district_nodal account requires an
// existing admin to be authenticated. Run with `npm run seed`.
const env = require('../config/env');
const userRepo = require('../repositories/user.repository');
const { hashPassword } = require('../utils/password');
const { ROLES } = require('../constants/roles');

async function main() {
  const { name, email, password } = env.seedAdmin;

  if (!email || !password) {
    console.error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in backend/.env to run the seed script.');
    process.exitCode = 1;
    return;
  }

  const existing = await userRepo.findByEmail(email);
  if (existing) {
    console.log(`Admin account already exists for ${email} — nothing to do.`);
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await userRepo.create({
    name,
    email,
    password_hash: passwordHash,
    role: ROLES.ADMIN,
    designation: 'MoSPI Admin',
  });

  console.log(`Seeded admin account: ${user.email} (id: ${user.id})`);
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
});
