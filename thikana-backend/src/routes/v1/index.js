const express = require('express');

const authRoutes = require('./auth.routes');
const listingsRoutes = require('./listings.routes');
const categoriesRoutes = require('./categories.routes');
const uploadRoutes = require('./upload.routes');
const aiRoutes = require('./ai.routes');
const adminRoutes = require('./admin/index');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/listings', listingsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/upload', uploadRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
