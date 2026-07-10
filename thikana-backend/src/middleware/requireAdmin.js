const { error } = require('../utils/response');

// Must run after requireAuth
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.role || !req.user.role.includes('admin')) {
    return error(res, 'FORBIDDEN', 'Admin access required', 403);
  }
  next();
}

module.exports = requireAdmin;
