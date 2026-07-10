const express = require('express');
const Listing = require('../../../models/Listing');
const User = require('../../../models/User');
const Category = require('../../../models/Category');
const { success, error } = require('../../../utils/response');

const router = express.Router();

// GET /api/v1/admin/dashboard — basic counts for the admin home page
router.get('/', async (req, res) => {
  try {
    const [totalListings, pendingListings, activeListings, totalUsers, totalSellers, activeCategories] =
      await Promise.all([
        Listing.countDocuments(),
        Listing.countDocuments({ status: 'pending' }),
        Listing.countDocuments({ status: 'active' }),
        User.countDocuments(),
        User.countDocuments({ role: 'seller' }),
        Category.countDocuments({ isActive: true })
      ]);

    return success(res, {
      totalListings,
      pendingListings,
      activeListings,
      totalUsers,
      totalSellers,
      activeCategories
    });
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

module.exports = router;
