const express = require('express');
const Category = require('../../../models/Category');
const { success, error } = require('../../../utils/response');
const slugify = require('../../../utils/slugify');

const router = express.Router();

// GET /api/v1/admin/categories — all, including inactive
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return success(res, { categories });
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

// POST /api/v1/admin/categories
router.post('/', async (req, res) => {
  try {
    const { name, icon, subcategories } = req.body;
    if (!name) return error(res, 'MISSING_FIELDS', 'Category name is required');

    const slug = slugify(name);
    const exists = await Category.findOne({ slug });
    if (exists) return error(res, 'CATEGORY_EXISTS', 'A category with this name already exists', 409);

    const category = await Category.create({
      name,
      slug,
      icon: icon || '',
      subcategories: (subcategories || []).map((s) => ({
        name: s.name,
        slug: slugify(s.name),
        attrs: s.attrs || []
      }))
    });
    return success(res, { category }, 201);
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

// PATCH /api/v1/admin/categories/:id
router.patch('/:id', async (req, res) => {
  try {
    const { name, icon, isActive, subcategories } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return error(res, 'NOT_FOUND', 'Category not found', 404);

    if (name) { category.name = name; category.slug = slugify(name); }
    if (icon !== undefined) category.icon = icon;
    if (isActive !== undefined) category.isActive = isActive;
    if (subcategories) {
      category.subcategories = subcategories.map((s) => ({
        name: s.name,
        slug: slugify(s.name),
        attrs: s.attrs || []
      }));
    }
    await category.save();
    return success(res, { category });
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

// DELETE /api/v1/admin/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return error(res, 'NOT_FOUND', 'Category not found', 404);
    await category.deleteOne();
    return success(res, { deleted: true });
  } catch (err) {
    return error(res, 'SERVER_ERROR', err.message, 500);
  }
});

module.exports = router;
