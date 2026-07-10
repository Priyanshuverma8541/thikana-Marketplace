const express = require('express');
const Listing = require('../../../models/Listing');
const { success, error } = require('../../../utils/response');

const router = express.Router();

// GET /api/v1/admin/listings — all statuses, filterable
router.get('/', async (req, res) => {
  try {
    const { status, category, page = 1, limit = 30 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [listings, total] = await Promise.all([
      Listing.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('sellerId', 'name storeName'),
      Listing.countDocuments(query)
    ]);
    return success(res, { listings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

// PATCH /api/v1/admin/listings/:id — approve, reject, feature, unfeature
router.patch('/:id', async (req, res) => {
  try {
    const { status, featured } = req.body;
    const listing = await Listing.findById(req.params.id);
    if (!listing) return error(res, 'NOT_FOUND', 'Listing not found', 404);

    if (status && ['pending', 'active', 'rejected', 'sold'].includes(status)) listing.status = status;
    if (featured !== undefined) listing.featured = featured;
    await listing.save();

    return success(res, { listing });
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

// DELETE /api/v1/admin/listings/:id
router.delete('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return error(res, 'NOT_FOUND', 'Listing not found', 404);
    await listing.deleteOne();
    return success(res, { deleted: true });
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

module.exports = router;
