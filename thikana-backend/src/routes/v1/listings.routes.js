const express = require('express');
const Listing = require('../../models/Listing');
const User = require('../../models/User');
const { success, error } = require('../../utils/response');
const { requireAuth, optionalAuth } = require('../../middleware/auth');

const router = express.Router();

// GET /api/v1/listings — public browse, with filters
// ?category=&subcategory=&area=&search=&minPrice=&maxPrice=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { category, subcategory, area, search, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    const query = { status: 'active' };

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (area) query['location.area'] = area;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [listings, total] = await Promise.all([
      Listing.find(query)
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('sellerId', 'name storeName storeSlug verified'),
      Listing.countDocuments(query)
    ]);

    return success(res, { listings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

// GET /api/v1/listings/:id
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      'sellerId',
      'name storeName storeSlug verified'
    );
    if (!listing) return error(res, 'NOT_FOUND', 'Listing not found', 404);
    listing.views += 1;
    await listing.save();
    return success(res, { listing });
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

// GET /api/v1/listings/store/:slug — all active listings for one seller's storefront
router.get('/store/:slug', async (req, res) => {
  try {
    const seller = await User.findOne({ storeSlug: req.params.slug });
    if (!seller) return error(res, 'NOT_FOUND', 'Store not found', 404);

    const listings = await Listing.find({ sellerId: seller._id, status: 'active' }).sort({ createdAt: -1 });
    return success(res, { seller: seller.toSafeJSON(), listings });
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

// POST /api/v1/listings — create (seller only, goes to pending)
router.post('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.role.includes('seller')) {
      return error(res, 'NOT_A_SELLER', 'Set up your store before posting a listing', 403);
    }
    const { category, subcategory, title, description, price, images, attributes, location } = req.body;
    if (!category || !subcategory || !title) {
      return error(res, 'MISSING_FIELDS', 'Category, subcategory, and title are required');
    }

    const listing = await Listing.create({
      sellerId: user._id,
      category,
      subcategory,
      title,
      description,
      price,
      images: images || [],
      attributes: attributes || {},
      location: location || { area: user.location?.area, city: 'Kolkata' },
      status: 'pending'
    });

    return success(res, { listing }, 201);
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

// PATCH /api/v1/listings/:id — owner can edit/mark sold
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return error(res, 'NOT_FOUND', 'Listing not found', 404);
    if (String(listing.sellerId) !== req.user.id) {
      return error(res, 'FORBIDDEN', 'You can only edit your own listings', 403);
    }

    const allowedFields = ['title', 'description', 'price', 'images', 'attributes', 'status'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        // sellers can only set status to 'sold', not re-approve themselves
        if (field === 'status' && req.body.status !== 'sold') continue;
        listing[field] = req.body[field];
      }
    }
    // Editing an active listing sends it back for re-approval
    if (listing.isModified() && listing.status === 'active' && req.body.status !== 'sold') {
      listing.status = 'pending';
    }
    await listing.save();
    return success(res, { listing });
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

// DELETE /api/v1/listings/:id — owner only
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return error(res, 'NOT_FOUND', 'Listing not found', 404);
    if (String(listing.sellerId) !== req.user.id) {
      return error(res, 'FORBIDDEN', 'You can only delete your own listings', 403);
    }
    await listing.deleteOne();
    return success(res, { deleted: true });
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

// GET /api/v1/listings/mine/all — seller's own listings, any status
router.get('/mine/all', requireAuth, async (req, res) => {
  try {
    const listings = await Listing.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
    return success(res, { listings });
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

module.exports = router;
