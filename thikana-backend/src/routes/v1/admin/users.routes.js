const express = require('express');
const User = require('../../../models/User');
const { success, error } = require('../../../utils/response');

const router = express.Router();

// GET /api/v1/admin/users — filterable by role
router.get('/', async (req, res) => {
  try {
    const { role, page = 1, limit = 30 } = req.query;
    const query = {};
    if (role) query.role = role;

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query)
    ]);
    return success(res, { users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

// PATCH /api/v1/admin/users/:id — verify / ban / unban
router.patch('/:id', async (req, res) => {
  try {
    const { verified, banned } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return error(res, 'NOT_FOUND', 'User not found', 404);

    if (verified !== undefined) user.verified = verified;
    if (banned !== undefined) user.banned = banned;
    await user.save();

    return success(res, { user: user.toSafeJSON() });
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

module.exports = router;
