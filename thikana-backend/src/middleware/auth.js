const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

// Verifies JWT and attaches req.user = { id, role }
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return error(res, 'NO_TOKEN', 'Authentication required', 401);
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return error(res, 'INVALID_TOKEN', 'Session expired or invalid, please log in again', 401);
  }
}

// Optional auth: attaches req.user if present, but doesn't block if absent
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    } catch (err) {
      // ignore invalid token for optional auth
    }
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
