const express = require('express');
const Category = require('../../models/Category');
const { success, error } = require('../../utils/response');

const router = express.Router();

// GET /api/v1/categories — public, active only
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return success(res, { categories });
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

// GET /api/v1/categories/:slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) return error(res, 'NOT_FOUND', 'Category not found', 404);
    return success(res, { category });
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

module.exports = router;
