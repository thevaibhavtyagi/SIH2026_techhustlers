const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const userRepo = require('../repositories/user.repository');
const passwordResetRepo = require('../repositories/passwordResetToken.repository');
const { hashPassword, verifyPassword } = require('../utils/password');
const { generateOpaqueToken, hashToken } = require('../utils/tokens');
const { toPublicUser } = require('../utils/mapUser');
const tokenService = require('./token.service');

// There is no public self-registration — every account (admin, district_nodal,
// mp) is provisioned by an admin via user.service.createProvisionedUser.

// ---------- Login ----------

const isLocked = (user) => user.locked_until && new Date(user.locked_until) > new Date();

const login = async ({ email, password, role }, { ip, userAgent } = {}) => {
  const user = await userRepo.findByEmail(email);

  // Same generic error whether the email doesn't exist or the password/role
  // is wrong — avoids leaking which emails are registered.
  const invalidCredentials = () => ApiError.unauthorized('Invalid email, password, or role');

  if (!user) throw invalidCredentials();

  if (!user.is_active) {
    throw ApiError.forbidden('This account has been deactivated. Contact an administrator.');
  }

  if (isLocked(user)) {
    const minutesLeft = Math.ceil((new Date(user.locked_until) - Date.now()) / 60000);
    throw ApiError.tooManyRequests(
      `Account temporarily locked due to repeated failed login attempts. Try again in ${minutesLeft} minute(s).`
    );
  }

  const passwordOk = await verifyPassword(password, user.password_hash);
  const roleOk = user.role === role;

  if (!passwordOk || !roleOk) {
    const attempts = user.failed_login_attempts + 1;
    const shouldLock = attempts >= env.accountLock.threshold;

    await userRepo.recordFailedLogin(user.id, {
      failedLoginAttempts: shouldLock ? 0 : attempts,
      lockedUntil: shouldLock
        ? new Date(Date.now() + env.accountLock.minutes * 60000).toISOString()
        : null,
    });

    throw invalidCredentials();
  }

  await userRepo.recordSuccessfulLogin(user.id);

  const publicUser = toPublicUser(user);
  const accessToken = tokenService.signAccessToken(publicUser);
  const refreshToken = await tokenService.issueRefreshToken(user.id, { ip, userAgent });

  return { user: publicUser, accessToken, refreshToken };
};

// ---------- Refresh / logout ----------

const refresh = async (rawRefreshToken, { ip, userAgent } = {}) => {
  if (!rawRefreshToken) throw ApiError.unauthorized('Missing refresh token');

  const result = await tokenService.rotateRefreshToken(rawRefreshToken, { ip, userAgent });
  if (!result) throw ApiError.unauthorized('Refresh token is invalid, expired, or has been revoked');

  const publicUser = toPublicUser(result.user);
  const accessToken = tokenService.signAccessToken(publicUser);

  return { user: publicUser, accessToken, refreshToken: result.newRawToken };
};

const logout = async (rawRefreshToken) => {
  if (rawRefreshToken) {
    await tokenService.revokeRefreshToken(rawRefreshToken);
  }
};

// ---------- Password reset ----------

const forgotPassword = async (email) => {
  const user = await userRepo.findByEmail(email);

  // Always behave the same way regardless of whether the account exists,
  // so this endpoint can't be used to enumerate registered emails.
  if (!user || !user.is_active) {
    return { debugResetToken: null };
  }

  const { raw, hash } = generateOpaqueToken();
  await passwordResetRepo.create({
    tokenHash: hash,
    userId: user.id,
    expiresAt: new Date(Date.now() + env.passwordResetTokenExpiresMin * 60000).toISOString(),
  });

  // No email provider is configured yet. In production this must be replaced
  // with a real transactional email send; for now we surface the raw token
  // only to the caller in non-production so the flow is testable end-to-end.
  if (!env.isProduction) {
    console.log(`[password-reset] token for ${email}: ${raw}`);
  }

  return { debugResetToken: env.isProduction ? null : raw };
};

const resetPassword = async (rawToken, newPassword) => {
  const hash = hashToken(rawToken);
  const resetToken = await passwordResetRepo.findValidByHash(hash);

  if (!resetToken || new Date(resetToken.expires_at) < new Date()) {
    throw ApiError.badRequest('Reset link is invalid or has expired');
  }

  const passwordHash = await hashPassword(newPassword);
  await userRepo.updateById(resetToken.user_id, { password_hash: passwordHash });
  await passwordResetRepo.markUsed(resetToken.id);
  await tokenService.revokeAllUserRefreshTokens(resetToken.user_id);
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await userRepo.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  const ok = await verifyPassword(currentPassword, user.password_hash);
  if (!ok) throw ApiError.badRequest('Current password is incorrect');

  const passwordHash = await hashPassword(newPassword);
  await userRepo.updateById(userId, { password_hash: passwordHash });
  await tokenService.revokeAllUserRefreshTokens(userId);
};

module.exports = { login, refresh, logout, forgotPassword, resetPassword, changePassword };
