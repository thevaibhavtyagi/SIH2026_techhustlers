const env = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const authService = require('../services/auth.service');

const REFRESH_COOKIE_PATH = '/api/auth';

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  path: REFRESH_COOKIE_PATH,
  maxAge: env.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000,
});

const setRefreshCookie = (res, token) => {
  res.cookie(env.refreshCookieName, token, cookieOptions());
};

const clearRefreshCookie = (res) => {
  res.clearCookie(env.refreshCookieName, { ...cookieOptions(), maxAge: 0 });
};

const requestMeta = (req) => ({ ip: req.ip, userAgent: req.headers['user-agent'] });

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({ success: true, message: 'Account created successfully', data: { user } });
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body, requestMeta(req));
  setRefreshCookie(res, refreshToken);
  res.json({ success: true, message: 'Login successful', data: { user, accessToken } });
});

const refresh = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.[env.refreshCookieName] || req.body?.refreshToken;
  const { user, accessToken, refreshToken } = await authService.refresh(rawToken, requestMeta(req));
  setRefreshCookie(res, refreshToken);
  res.json({ success: true, data: { user, accessToken } });
});

const logout = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.[env.refreshCookieName] || req.body?.refreshToken;
  await authService.logout(rawToken);
  clearRefreshCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { debugResetToken } = await authService.forgotPassword(req.body.email);
  res.json({
    success: true,
    message: 'If an account exists for this email, a password reset link has been sent.',
    // Only ever populated outside production — no email provider is wired up yet.
    ...(debugResetToken ? { devResetToken: debugResetToken } : {}),
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  res.json({ success: true, message: 'Password has been reset. Please log in with your new password.' });
});

const changePassword = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  clearRefreshCookie(res);
  res.json({ success: true, message: 'Password changed. Please log in again on all devices.' });
});

module.exports = { register, login, refresh, logout, me, forgotPassword, resetPassword, changePassword };
