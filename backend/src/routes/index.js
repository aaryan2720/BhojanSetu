const express = require('express');
const router = express.Router();
const userRoutes = require('./users');
const listingRoutes = require('./listings');
const ratingRoutes = require('./ratings');

router.use('/users', userRoutes);
router.use('/listings', listingRoutes);
router.use('/ratings', ratingRoutes);

module.exports = router; 