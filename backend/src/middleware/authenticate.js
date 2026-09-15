const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const userRepo = require('../repositories/user.repository');
const { verifyAccessToken } = require('../services/token.service');
const { toPublicUser } = require('../utils/mapUser');

// Verifies the JWT access token from the Authorization header, loads the
// current user, and attaches it to req.user. Rejects deactivated accounts
// immediately even if their token is still technically valid.
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token expired');
    }
    throw ApiError.unauthorized('Invalid access token');
  }

  const user = await userRepo.findById(payload.sub);

  if (!user || !user.is_active) {
    throw ApiError.unauthorized('Account is no longer active');
  }

  req.user = toPublicUser(user);
  req.dbUser = user;
  next();
});

module.exports = authenticate;
