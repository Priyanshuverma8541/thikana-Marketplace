const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { success, error } = require('../../utils/response');
const { requireAuth } = require('../../middleware/auth');
const slugify = require('../../utils/slugify');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !password || (!email && !phone)) {
      return error(res, 'MISSING_FIELDS', 'Name, password, and email or phone are required');
    }
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) return error(res, 'USER_EXISTS', 'An account with this email/phone already exists', 409);

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: role && ['buyer', 'seller'].includes(role) ? [role] : ['buyer']
    });

    return success(res, { user: user.toSafeJSON(), token: signToken(user) }, 201);
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) return error(res, 'MISSING_FIELDS', 'Email/phone and password are required');

    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user) return error(res, 'INVALID_CREDENTIALS', 'Invalid email/phone or password', 401);
    if (user.banned) return error(res, 'ACCOUNT_BANNED', 'This account has been suspended', 403);

    const match = await user.comparePassword(password);
    if (!match) return error(res, 'INVALID_CREDENTIALS', 'Invalid email/phone or password', 401);

    return success(res, { user: user.toSafeJSON(), token: signToken(user) });
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

// GET /api/v1/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return error(res, 'NOT_FOUND', 'User not found', 404);
  return success(res, { user: user.toSafeJSON() });
});

// PATCH /api/v1/auth/become-seller — upgrades a buyer to also be a seller + sets storefront slug
router.patch('/become-seller', requireAuth, async (req, res) => {
  try {
    const { storeName, bio } = req.body;
    if (!storeName) return error(res, 'MISSING_FIELDS', 'Store name is required');

    const user = await User.findById(req.user.id);
    if (!user) return error(res, 'NOT_FOUND', 'User not found', 404);

    let baseSlug = slugify(storeName);
    let slug = baseSlug;
    let counter = 1;
    while (await User.findOne({ storeSlug: slug, _id: { $ne: user._id } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    if (!user.role.includes('seller')) user.role.push('seller');
    user.storeName = storeName;
    user.storeSlug = slug;
    if (bio) user.bio = bio;
    await user.save();

    return success(res, { user: user.toSafeJSON() });
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

module.exports = router;
