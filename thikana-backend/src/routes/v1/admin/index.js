const express = require('express');
const { requireAuth } = require('../../../middleware/auth');
const requireAdmin = require('../../../middleware/requireAdmin');

const dashboardRoutes = require('./dashboard.routes');
const listingsRoutes = require('./listings.routes');
const usersRoutes = require('./users.routes');
const categoriesRoutes = require('./categories.routes');

const router = express.Router();

// Every admin route requires a valid JWT AND the admin role
router.use(requireAuth, requireAdmin);

router.use('/dashboard', dashboardRoutes);
router.use('/listings', listingsRoutes);
router.use('/users', usersRoutes);
router.use('/categories', categoriesRoutes);

module.exports = router;
