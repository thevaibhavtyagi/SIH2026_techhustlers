const jwt = require('jsonwebtoken');
const env = require('../config/env');
const refreshTokenRepo = require('../repositories/refreshToken.repository');
const { generateOpaqueToken, hashToken } = require('../utils/tokens');

// ---------- Access tokens (short-lived, stateless JWT) ----------

const signAccessToken = (user) =>
  jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn, issuer: env.jwt.issuer }
  );

const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret, { issuer: env.jwt.issuer });

// ---------- Refresh tokens (long-lived, opaque, stored hashed + revocable) ----------

const refreshTokenExpiryDate = () =>
  new Date(Date.now() + env.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000).toISOString();

const issueRefreshToken = async (userId, { ip, userAgent } = {}) => {
  const { raw, hash } = generateOpaqueToken();

  await refreshTokenRepo.create({
    tokenHash: hash,
    userId,
    expiresAt: refreshTokenExpiryDate(),
    createdByIp: ip,
    userAgent,
  });

  return raw;
};

// Validates a presented refresh token, rotates it (revokes the old one, issues
// a new one), and returns { user, newRawToken }. Returns null if invalid/expired/revoked.
const rotateRefreshToken = async (rawToken, { ip, userAgent } = {}) => {
  const hash = hashToken(rawToken);
  const existing = await refreshTokenRepo.findActiveByHash(hash);

  if (!existing) return null;

  const isExpired = new Date(existing.expires_at) < new Date();
  if (existing.revoked_at || isExpired) {
    if (!existing.revoked_at) {
      // Token reuse after expiry — revoke defensively.
      await refreshTokenRepo.revokeByHash(hash);
    }
    return null;
  }

  const { raw: newRaw, hash: newHash } = generateOpaqueToken();

  await refreshTokenRepo.revokeByHash(hash, newHash);
  await refreshTokenRepo.create({
    tokenHash: newHash,
    userId: existing.user_id,
    expiresAt: refreshTokenExpiryDate(),
    createdByIp: ip,
    userAgent,
  });

  return { user: existing.users, newRawToken: newRaw };
};

const revokeRefreshToken = async (rawToken) => {
  const hash = hashToken(rawToken);
  await refreshTokenRepo.revokeByHash(hash);
};

// Revokes every active refresh token for a user — used on password change/reset
// and by "log out of all devices".
const revokeAllUserRefreshTokens = async (userId) => {
  await refreshTokenRepo.revokeAllForUser(userId);
};

module.exports = {
  signAccessToken,
  verifyAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
};
