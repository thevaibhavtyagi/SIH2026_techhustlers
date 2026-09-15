const crypto = require('crypto');

// Generates a high-entropy opaque token (sent to the client) and its SHA-256
// hash (stored in the DB). We never store the raw token, mirroring password
// hashing practice — a DB leak alone can't be used to impersonate a session.
const generateOpaqueToken = () => {
  const raw = crypto.randomBytes(48).toString('base64url');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
};

const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

module.exports = { generateOpaqueToken, hashToken };
